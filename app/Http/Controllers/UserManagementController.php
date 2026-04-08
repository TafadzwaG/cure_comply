<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\UserAccessUpdateRequest;
use App\Http\Requests\UserIndexRequest;
use App\Http\Requests\UserPasswordUpdateRequest;
use App\Http\Requests\UserProfileUpdateRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    use InteractsWithIndexTables;

    public function index(UserIndexRequest $request): Response|\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', User::class);

        $filters = $request->validated();

        $query = User::query()
            ->with(['tenant', 'roles', 'employeeProfile.department']);

        $this->applySearch($query, $filters['search'] ?? null, [
            'name',
            'email',
            'status',
            'tenant.name',
            'employeeProfile.job_title',
        ]);

        $this->applyFilters($query, $filters, [
            'tenant_id' => 'tenant_id',
            'status' => 'status',
            'role' => fn ($builder, $value) => $builder->role($value),
        ]);

        $this->applySort($query, [
            'name' => 'name',
            'email' => 'email',
            'status' => 'status',
            'created_at' => 'created_at',
            'tenant' => fn ($builder, $direction) => $builder
                ->leftJoin('tenants', 'tenants.id', '=', 'users.tenant_id')
                ->select('users.*')
                ->orderBy('tenants.name', $direction),
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (User $user) => [
                'Name' => $user->name,
                'Email' => $user->email,
                'Tenant' => $user->tenant?->name ?? 'Platform',
                'Status' => $user->status?->value ?? (string) $user->getRawOriginal('status'),
                'Primary Role' => $user->roles->pluck('name')->implode(', '),
                'Job Title' => $user->employeeProfile?->job_title ?? 'N/A',
                'Created' => optional($user->created_at)->toDateTimeString(),
            ])->all();

            return $this->queueTableExport($request, 'users.index', $filters, ['Name', 'Email', 'Tenant', 'Status', 'Primary Role', 'Job Title', 'Created'], $rows, 'Users');
        }

        return Inertia::render('users/index', [
            'users' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => User::query()->count(),
                'platform' => User::query()->whereNull('tenant_id')->count(),
                'active' => User::query()->where('status', 'active')->count(),
                'invited' => User::query()->where('status', 'invited')->count(),
            ],
            'tenants' => Tenant::query()->orderBy('name')->get(['id', 'name']),
            'roles' => Role::query()->orderBy('name')->pluck('name')->values(),
        ]);
    }

    public function show(User $user): Response
    {
        $this->authorize('view', $user);

        $user->load(['tenant', 'roles', 'permissions', 'employeeProfile.department']);

        return Inertia::render('users/show', [
            'userRecord' => $user,
            'tenants' => Tenant::query()->orderBy('name')->get(['id', 'name']),
            'roles' => Role::query()->orderBy('name')->get(['id', 'name']),
            'permissions' => Permission::query()->orderBy('name')->get(['id', 'name']),
            'auditTrail' => $user->auditLogs()->latest('created_at')->limit(8)->get(['id', 'action', 'entity_type', 'created_at']),
        ]);
    }

    public function update(UserProfileUpdateRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $oldValues = $user->toArray();
        $user->update($request->validated());
        app(\App\Services\AuditLogService::class)->logModelUpdated('user_profile_updated', $user, $oldValues);

        return back()->with('success', 'User profile updated.');
    }

    public function updatePassword(UserPasswordUpdateRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $oldValues = $user->only(['last_password_changed_at']);
        $user->update([
            'password' => $request->validated('password'),
            'last_password_changed_at' => now(),
        ]);
        app(\App\Services\AuditLogService::class)->logModelUpdated('user_password_updated', $user, $oldValues);

        return back()->with('success', 'User password updated.');
    }

    public function updateAccess(UserAccessUpdateRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $payload = $request->validated();
        $oldValues = [
            'roles' => $user->roles()->pluck('name')->all(),
            'permissions' => $user->permissions()->pluck('name')->all(),
        ];
        $user->syncRoles($payload['roles'] ?? []);
        $user->syncPermissions($payload['permissions'] ?? []);
        app(\App\Services\AuditLogService::class)->logModelUpdated('user_access_updated', $user, $oldValues);

        return back()->with('success', 'User access updated.');
    }
}
