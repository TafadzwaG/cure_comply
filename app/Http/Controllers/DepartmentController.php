<?php

namespace App\Http\Controllers;

use App\Enums\CourseAssignmentStatus;
use App\Enums\EvidenceReviewStatus;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\DepartmentRequest;
use App\Models\CourseAssignment;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\EvidenceFile;
use App\Models\Tenant;
use App\Models\TestAttempt;
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

            return $this->queueTableExport($request, 'departments.index', $filters, ['Name', 'Description', 'Employees', 'Status'], $rows, 'Departments');
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

    public function scorecards(Request $request): Response
    {
        $this->authorize('viewAny', Department::class);

        $isSuperAdmin = (bool) $request->user()?->hasRole('super_admin');
        $tenantId = $isSuperAdmin ? $request->integer('tenant_id') ?: null : $request->user()?->tenant_id;

        $departments = Department::query()
            ->when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
            ->with('tenant:id,name')
            ->withCount('employeeProfiles')
            ->orderBy('name')
            ->get();

        // Prefetch all employees per department to minimize per-row queries
        $profiles = EmployeeProfile::query()
            ->when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
            ->get(['id', 'department_id', 'user_id']);

        $userIdsByDept = $profiles->groupBy('department_id')->map->pluck('user_id');

        $scorecards = $departments->map(function (Department $department) use ($userIdsByDept) {
            $userIds = ($userIdsByDept->get($department->id) ?? collect())->all();

            if (empty($userIds)) {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'tenant' => $department->tenant?->name,
                    'employees' => 0,
                    'training_completion' => 0,
                    'overdue_assignments' => 0,
                    'avg_test_score' => 0,
                    'pending_evidence' => 0,
                    'risk_score' => 0,
                    'total_assignments' => 0,
                    'completed_assignments' => 0,
                ];
            }

            $totalAssignments = CourseAssignment::query()->whereIn('assigned_to_user_id', $userIds)->count();
            $completedAssignments = CourseAssignment::query()
                ->whereIn('assigned_to_user_id', $userIds)
                ->where('status', CourseAssignmentStatus::Completed)
                ->count();
            $overdueAssignments = CourseAssignment::query()
                ->whereIn('assigned_to_user_id', $userIds)
                ->whereDate('due_date', '<', today())
                ->where('status', '!=', CourseAssignmentStatus::Completed)
                ->count();

            $avgTestScore = round((float) TestAttempt::query()
                ->whereIn('user_id', $userIds)
                ->avg('percentage'), 1);

            $pendingEvidence = EvidenceFile::query()
                ->whereIn('uploaded_by', $userIds)
                ->where('review_status', EvidenceReviewStatus::Pending)
                ->count();

            $trainingCompletion = $totalAssignments > 0
                ? round(($completedAssignments / $totalAssignments) * 100, 1)
                : 0;

            // Composite risk score: lower training + more overdue + lower test score = higher risk
            $risk = round(
                (100 - $trainingCompletion) * 0.5
                + min(100, $overdueAssignments * 10) * 0.3
                + (100 - $avgTestScore) * 0.2,
                1
            );

            return [
                'id' => $department->id,
                'name' => $department->name,
                'tenant' => $department->tenant?->name,
                'employees' => (int) $department->employee_profiles_count,
                'training_completion' => $trainingCompletion,
                'overdue_assignments' => $overdueAssignments,
                'avg_test_score' => $avgTestScore,
                'pending_evidence' => $pendingEvidence,
                'risk_score' => $risk,
                'total_assignments' => $totalAssignments,
                'completed_assignments' => $completedAssignments,
            ];
        })->values()->all();

        return Inertia::render('departments/scorecards', [
            'scorecards' => $scorecards,
            'tenants' => $isSuperAdmin ? Tenant::query()->orderBy('name')->get(['id', 'name']) : [],
            'isSuperAdmin' => $isSuperAdmin,
            'selectedTenantId' => $tenantId,
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

        $department = Department::query()->create($payload);
        app(\App\Services\AuditLogService::class)->logModelCreated('department_created', $department);

        return back()->with('success', 'Department created.');
    }

    public function update(DepartmentRequest $request, Department $department): RedirectResponse
    {
        $this->authorize('update', $department);
        $oldValues = $department->toArray();
        $department->update($request->validated());
        app(\App\Services\AuditLogService::class)->logModelUpdated('department_updated', $department, $oldValues);

        return back()->with('success', 'Department updated.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $this->authorize('delete', $department);
        $oldValues = $department->toArray();
        $department->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('department_deleted', $department, $oldValues);

        return back()->with('success', 'Department deleted.');
    }
}
