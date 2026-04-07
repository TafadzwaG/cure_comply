<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\DepartmentRequest;
use App\Models\Department;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DepartmentController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', Department::class);

        $filters = $this->validateIndex($request, ['name', 'status', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
            'tenant_id' => ['nullable', 'integer'],
        ]);

        $query = Department::query()->with('tenant:id,name')->withCount('employeeProfiles');
        $this->applySearch($query, $filters['search'] ?? null, ['name', 'description']);
        $this->applyFilters($query, $filters, ['status' => 'status', 'tenant_id' => 'tenant_id']);
        $this->applySort($query, [
            'name' => 'name',
            'status' => 'status',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (Department $department) => [
                $department->name,
                $department->description ?: 'No description',
                $department->employee_profiles_count,
                $department->status->value,
            ])->all();

            return $this->exportTable('departments.xlsx', ['Name', 'Description', 'Employees', 'Status'], $rows);
        }

        $isSuperAdmin = (bool) $request->user()?->hasRole('super_admin');

        return Inertia::render('departments/index', [
            'departments' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => Department::query()->count(),
                'active' => Department::query()->where('status', 'active')->count(),
                'inactive' => Department::query()->where('status', 'inactive')->count(),
                'employees' => Department::query()->withCount('employeeProfiles')->get()->sum('employee_profiles_count'),
            ],
            'tenants' => $isSuperAdmin ? Tenant::query()->orderBy('name')->get(['id', 'name']) : [],
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Department::class);

        return Inertia::render('departments/create', [
            'tenants' => request()->user()?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : [],
        ]);
    }

    public function store(DepartmentRequest $request): RedirectResponse
    {
        $this->authorize('create', Department::class);

        $payload = $request->validated();

        if (! $request->user()?->isSuperAdmin()) {
            $payload['tenant_id'] = current_tenant()?->id;
        }

        Department::query()->create($payload);

        return back()->with('success', 'Department created.');
    }

    public function update(DepartmentRequest $request, Department $department): RedirectResponse
    {
        $this->authorize('update', $department);
        $department->update($request->validated());

        return back()->with('success', 'Department updated.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $this->authorize('delete', $department);
        $department->delete();

        return back()->with('success', 'Department deleted.');
    }
}
