<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\UserAccessUpdateRequest;
use App\Http\Requests\UserIndexRequest;
use App\Http\Requests\UserPasswordUpdateRequest;
use App\Http\Requests\UserProfileUpdateRequest;
use App\Models\Tenant;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\UserLifecycleService;
use App\Support\Permissions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserManagementController extends Controller
{
    use InteractsWithIndexTables;

    public function __construct(
        protected UserLifecycleService $userLifecycleService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(UserIndexRequest $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', User::class);

        $filters = $request->validated();
        $actor = $request->user();

        $query = $this->visibleUsersQuery($actor)
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

        $paginated = $query->paginate($this->perPage($filters))->withQueryString();
        $paginated->through(fn (User $user) => [
            ...$user->toArray(),
            'abilities' => $this->abilitiesFor($actor, $user),
        ]);

        $statsQuery = $this->visibleUsersQuery($actor);

        return Inertia::render('users/index', [
            'users' => $paginated,
            'filters' => $filters,
            'stats' => [
                'total' => (clone $statsQuery)->count(),
                'platform' => $actor->isSuperAdmin() ? User::query()->whereNull('tenant_id')->count() : 0,
                'active' => (clone $statsQuery)->where('status', 'active')->count(),
                'invited' => (clone $statsQuery)->where('status', 'invited')->count(),
                'inactive' => (clone $statsQuery)->where('status', 'inactive')->count(),
            ],
            'tenants' => $actor->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : Tenant::query()->whereKey($actor->tenant_id)->get(['id', 'name']),
            'roles' => Role::query()
                ->when(! $actor->isSuperAdmin(), fn ($roleQuery) => $roleQuery->where('name', '!=', 'super_admin'))
                ->orderBy('name')
                ->pluck('name')
                ->values(),
        ]);
    }

    public function show(User $user): Response
    {
        $this->authorize('view', $user);

        $actor = request()->user();
        $user->load(['tenant', 'roles', 'permissions', 'employeeProfile.department']);

        return Inertia::render('users/show', [
            'userRecord' => $user,
            'tenants' => $actor?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : Tenant::query()->whereKey($actor?->tenant_id)->get(['id', 'name']),
            'roles' => $actor?->can('updateAccess', $user)
                ? Role::query()->orderBy('name')->get(['id', 'name'])
                : [],
            'permissions' => $actor?->can('updateAccess', $user)
                ? Permission::query()->orderBy('name')->get(['id', 'name'])
                : [],
            'auditTrail' => $user->auditLogs()->latest('created_at')->limit(8)->get(['id', 'action', 'entity_type', 'created_at']),
            'abilities' => $this->abilitiesFor($actor, $user),
        ]);
    }

    public function update(UserProfileUpdateRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $payload = $request->validated();

        if (! $request->user()?->isSuperAdmin()) {
            unset($payload['tenant_id']);
        }

        $oldValues = $user->toArray();
        $previousEmail = $user->email;

        $user->update($payload);

        $this->auditLogService->logModelUpdated('user_profile_updated', $user, $oldValues);

        if ($previousEmail !== $user->email) {
            $this->auditLogService->logModelUpdated('user_email_updated', $user, ['email' => $previousEmail]);
        }

        return back()->with('success', 'User profile updated.');
    }

    public function updatePassword(UserPasswordUpdateRequest $request, User $user): RedirectResponse
    {
        $this->authorize('updatePassword', $user);

        $oldValues = $user->only(['last_password_changed_at']);
        $user->update([
            'password' => $request->validated('password'),
            'last_password_changed_at' => now(),
            'remember_token' => null,
        ]);

        $this->auditLogService->logModelUpdated('user_password_updated', $user, $oldValues);

        return back()->with('success', 'User password updated.');
    }

    public function updateAccess(UserAccessUpdateRequest $request, User $user): RedirectResponse
    {
        $this->authorize('updateAccess', $user);

        $payload = $request->validated();
        $oldValues = [
            'roles' => $user->roles()->pluck('name')->all(),
            'permissions' => $user->permissions()->pluck('name')->all(),
        ];

        $user->syncRoles($payload['roles'] ?? []);
        $user->syncPermissions($payload['permissions'] ?? []);

        $this->auditLogService->logModelUpdated('user_access_updated', $user, $oldValues);

        return back()->with('success', 'User access updated.');
    }

    public function deactivate(User $user): RedirectResponse
    {
        $this->authorize('deactivate', $user);

        $this->userLifecycleService->deactivate($user);

        return back()->with('success', 'User deactivated. The original email has been archived and can now be reused.');
    }

    public function reactivate(User $user): RedirectResponse
    {
        $this->authorize('reactivate', $user);

        if ($user->hasPlaceholderEmail()) {
            return back()->with('error', 'Set a real unique email address before reactivating this user.');
        }

        $this->userLifecycleService->reactivate($user);

        return back()->with('success', 'User reactivated.');
    }

    protected function visibleUsersQuery(User $actor): Builder
    {
        return User::query()
            ->when(! $actor->isSuperAdmin(), fn (Builder $query) => $query
                ->where('tenant_id', $actor->tenant_id)
                ->whereDoesntHave('roles', fn (Builder $roleQuery) => $roleQuery->where('name', 'super_admin')));
    }

    protected function abilitiesFor(?User $actor, User $target): array
    {
        return [
            'canEdit' => (bool) $actor?->can('update', $target),
            'canChangeTenant' => (bool) $actor?->isSuperAdmin(),
            'canUpdatePassword' => (bool) $actor?->can('updatePassword', $target),
            'canEditAccess' => (bool) $actor?->can('updateAccess', $target),
            'canDeactivate' => (bool) $actor?->can('deactivate', $target),
            'canReactivate' => (bool) $actor?->can('reactivate', $target),
            'canImpersonate' => (bool) $actor?->can(Permissions::IMPERSONATE_USERS) && ! $target->isSuperAdmin(),
        ];
    }
}
