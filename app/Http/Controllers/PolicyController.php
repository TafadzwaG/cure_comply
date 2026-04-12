<?php

namespace App\Http\Controllers;

use App\Enums\PolicyAssignmentStatus;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Models\Department;
use App\Models\LibraryFile;
use App\Models\PolicyAssignment;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PolicyController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && ($user->can(Permissions::VIEW_POLICIES) || $user->can(Permissions::MANAGE_POLICIES) || $user->can(Permissions::ASSIGN_POLICIES)), 403);

        $filters = $this->validateIndex($request, ['title', 'due_date', 'created_at', 'status', 'version'], [
            'tab' => ['nullable', 'in:published,assignments,my'],
            'status' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
        ]);

        $canManage = $user->can(Permissions::MANAGE_POLICIES);
        $canAssign = $user->can(Permissions::ASSIGN_POLICIES);
        $tab = $this->resolveTab($filters['tab'] ?? null, $canManage || $canAssign);

        return match ($tab) {
            'assignments' => $this->renderAssignmentsTab($request, $filters, $canManage, $canAssign),
            'published' => $this->renderPublishedTab($request, $filters, $canManage, $canAssign),
            default => $this->renderMyPoliciesTab($request, $filters, $canManage, $canAssign),
        };
    }

    protected function renderPublishedTab(Request $request, array $filters, bool $canManage, bool $canAssign): Response|RedirectResponse
    {
        $user = $request->user();

        $query = LibraryFile::query()
            ->with(['tenant:id,name', 'uploader:id,name', 'currentPolicyVersion.publisher:id,name'])
            ->visibleTo($user)
            ->publishedPolicies()
            ->withCount([
                'policyAssignments as assignments_count' => fn (Builder $builder) => $builder->whereColumn('policy_assignments.library_file_version_id', 'library_files.current_policy_version_id'),
                'policyAssignments as pending_count' => fn (Builder $builder) => $builder
                    ->whereColumn('policy_assignments.library_file_version_id', 'library_files.current_policy_version_id')
                    ->whereIn('policy_assignments.status', [
                        PolicyAssignmentStatus::Pending->value,
                        PolicyAssignmentStatus::Viewed->value,
                    ]),
                'policyAssignments as overdue_count' => fn (Builder $builder) => $builder
                    ->whereColumn('policy_assignments.library_file_version_id', 'library_files.current_policy_version_id')
                    ->where('policy_assignments.status', PolicyAssignmentStatus::Overdue->value),
                'policyAssignments as acknowledged_count' => fn (Builder $builder) => $builder
                    ->whereColumn('policy_assignments.library_file_version_id', 'library_files.current_policy_version_id')
                    ->where('policy_assignments.status', PolicyAssignmentStatus::Acknowledged->value),
            ]);

        $this->applySearch($query, $filters['search'] ?? null, ['title', 'description', 'category', 'tenant.name']);
        $this->applyFilters($query, $filters, [
            'category' => 'category',
        ]);
        $this->applySort($query, [
            'title' => 'title',
            'version' => 'current_policy_version_number',
            'created_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null, 'updated_at');

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (LibraryFile $policy) => [
                $policy->title,
                $policy->category,
                $policy->tenant?->name ?? 'Shared',
                'v'.$policy->current_policy_version_number,
                $policy->assignments_count,
                $policy->pending_count,
                $policy->overdue_count,
                $policy->acknowledged_count,
                optional($policy->currentPolicyVersion?->published_at)->toDateString(),
            ])->all();

            return $this->queueTableExport(
                $request,
                'policies-published',
                [...$filters, 'tab' => 'published'],
                ['Title', 'Category', 'Scope', 'Version', 'Assignments', 'Pending', 'Overdue', 'Acknowledged', 'Published'],
                $rows,
                'Published policies'
            );
        }

        $policies = $query
            ->paginate($this->perPage($filters))
            ->withQueryString()
            ->through(fn (LibraryFile $policy) => $this->mapPolicy($request, $policy));

        return Inertia::render('policies/index', $this->basePayload($request, $filters, 'published', $canManage, $canAssign, [
            'policies' => $policies,
        ]));
    }

    protected function renderAssignmentsTab(Request $request, array $filters, bool $canManage, bool $canAssign): Response|RedirectResponse
    {
        abort_unless($canManage || $canAssign, 403);

        $query = $this->assignmentVisibilityQuery($request->user())
            ->with([
                'libraryFile.tenant:id,name',
                'assignedTo:id,name,email,tenant_id',
                'assignedBy:id,name',
                'sourceDepartment:id,name',
                'version:id,version_number,published_at',
            ]);

        $this->applySearch($query, $filters['search'] ?? null, [
            'libraryFile.title',
            'assignedTo.name',
            'assignedTo.email',
            'sourceDepartment.name',
        ]);
        $this->applyFilters($query, $filters, [
            'status' => 'status',
        ]);
        $this->applySort($query, [
            'title' => fn (Builder $builder, string $direction) => $builder->orderBy(
                LibraryFile::query()->select('title')->whereColumn('library_files.id', 'policy_assignments.library_file_id')->limit(1),
                $direction,
            ),
            'due_date' => 'due_date',
            'status' => 'status',
            'created_at' => 'created_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null, 'due_date');

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (PolicyAssignment $assignment) => [
                $assignment->libraryFile?->title,
                'v'.($assignment->version?->version_number ?? '?'),
                $assignment->assignedTo?->name,
                $assignment->assignedTo?->email,
                $assignment->sourceDepartment?->name ?? ucfirst($assignment->source_type),
                $assignment->status?->value,
                optional($assignment->due_date)->toDateString(),
                optional($assignment->acknowledged_at)->toDateString(),
                $assignment->view_count,
            ])->all();

            return $this->queueTableExport(
                $request,
                'policies-assignments',
                [...$filters, 'tab' => 'assignments'],
                ['Policy', 'Version', 'Assignee', 'Email', 'Source', 'Status', 'Due date', 'Acknowledged', 'Views'],
                $rows,
                'Policy assignments'
            );
        }

        $assignments = $query
            ->paginate($this->perPage($filters))
            ->withQueryString()
            ->through(fn (PolicyAssignment $assignment) => $this->mapAssignment($assignment, false));

        return Inertia::render('policies/index', $this->basePayload($request, $filters, 'assignments', $canManage, $canAssign, [
            'assignments' => $assignments,
        ]));
    }

    protected function renderMyPoliciesTab(Request $request, array $filters, bool $canManage, bool $canAssign): Response|RedirectResponse
    {
        $query = PolicyAssignment::query()
            ->with([
                'libraryFile.tenant:id,name',
                'assignedBy:id,name',
                'sourceDepartment:id,name',
                'version:id,version_number,published_at',
            ])
            ->where('assigned_to_user_id', $request->user()->id);

        $this->applySearch($query, $filters['search'] ?? null, [
            'libraryFile.title',
            'assignedBy.name',
            'sourceDepartment.name',
        ]);
        $this->applyFilters($query, $filters, [
            'status' => 'status',
        ]);
        $this->applySort($query, [
            'title' => fn (Builder $builder, string $direction) => $builder->orderBy(
                LibraryFile::query()->select('title')->whereColumn('library_files.id', 'policy_assignments.library_file_id')->limit(1),
                $direction,
            ),
            'due_date' => 'due_date',
            'status' => 'status',
            'created_at' => 'created_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null, 'due_date');

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (PolicyAssignment $assignment) => [
                $assignment->libraryFile?->title,
                'v'.($assignment->version?->version_number ?? '?'),
                $assignment->status?->value,
                optional($assignment->due_date)->toDateString(),
                optional($assignment->first_viewed_at)?->toDateTimeString(),
                optional($assignment->acknowledged_at)?->toDateTimeString(),
                $assignment->view_count,
            ])->all();

            return $this->queueTableExport(
                $request,
                'policies-my',
                [...$filters, 'tab' => 'my'],
                ['Policy', 'Version', 'Status', 'Due date', 'First viewed', 'Acknowledged', 'Views'],
                $rows,
                'My policy acknowledgments'
            );
        }

        $myPolicies = $query
            ->paginate($this->perPage($filters))
            ->withQueryString()
            ->through(fn (PolicyAssignment $assignment) => $this->mapAssignment($assignment, true, $request->user()));

        return Inertia::render('policies/index', $this->basePayload($request, $filters, 'my', $canManage, $canAssign, [
            'myPolicies' => $myPolicies,
        ]));
    }

    protected function basePayload(Request $request, array $filters, string $tab, bool $canManage, bool $canAssign, array $data): array
    {
        $user = $request->user();
        $statsBase = $canManage || $canAssign
            ? $this->assignmentVisibilityQuery($user)
            : PolicyAssignment::query()->where('assigned_to_user_id', $user->id);

        $publishedBase = LibraryFile::query()->visibleTo($user)->publishedPolicies();

        return [
            'tab' => $tab,
            'filters' => [
                ...$filters,
                'tab' => $tab,
            ],
            'stats' => [
                'published' => (clone $publishedBase)->count(),
                'pending' => (clone $statsBase)->whereIn('status', [
                    PolicyAssignmentStatus::Pending->value,
                    PolicyAssignmentStatus::Viewed->value,
                ])->count(),
                'overdue' => (clone $statsBase)->where('status', PolicyAssignmentStatus::Overdue->value)->count(),
                'acknowledged' => (clone $statsBase)->where('status', PolicyAssignmentStatus::Acknowledged->value)->count(),
            ],
            'categoryOptions' => collect(LibraryFile::categoryOptions())->map(fn (string $category) => [
                'label' => $category,
                'value' => $category,
            ])->values(),
            'statusOptions' => collect(PolicyAssignmentStatus::cases())->map(fn (PolicyAssignmentStatus $status) => [
                'label' => str($status->value)->replace('_', ' ')->title()->toString(),
                'value' => $status->value,
            ])->values(),
            'users' => ($canManage || $canAssign) ? $this->assignableUsers($user) : [],
            'departments' => ($canManage || $canAssign) ? $this->assignableDepartments($user) : [],
            'canManage' => $canManage,
            'canAssign' => $canAssign,
            'canAcknowledge' => $user->can(Permissions::ACKNOWLEDGE_POLICIES),
            'isSuperAdmin' => $user->isSuperAdmin(),
            ...$data,
        ];
    }

    protected function mapPolicy(Request $request, LibraryFile $policy): array
    {
        return [
            'id' => $policy->id,
            'title' => $policy->title,
            'description' => $policy->description,
            'category' => $policy->category,
            'scope' => $policy->tenant_id ? 'tenant' : 'shared',
            'scope_label' => $policy->tenant?->name ?? 'Shared',
            'tenant' => $policy->tenant ? [
                'id' => $policy->tenant->id,
                'name' => $policy->tenant->name,
            ] : null,
            'original_name' => $policy->original_name,
            'file_type' => strtoupper(pathinfo($policy->original_name, PATHINFO_EXTENSION) ?: 'FILE'),
            'current_version_number' => $policy->current_policy_version_number,
            'policy_state' => $policy->policy_state?->value,
            'published_at' => optional($policy->currentPolicyVersion?->published_at)->toIso8601String(),
            'published_by' => $policy->currentPolicyVersion?->publisher ? [
                'id' => $policy->currentPolicyVersion->publisher->id,
                'name' => $policy->currentPolicyVersion->publisher->name,
            ] : null,
            'assignments_count' => (int) $policy->assignments_count,
            'pending_count' => (int) $policy->pending_count,
            'overdue_count' => (int) $policy->overdue_count,
            'acknowledged_count' => (int) $policy->acknowledged_count,
            'abilities' => [
                'canAssign' => $request->user()?->can(Permissions::ASSIGN_POLICIES) ?? false,
                'canRepublish' => $request->user()?->can('republishPolicy', $policy) ?? false,
                'canArchive' => $request->user()?->can('archivePolicy', $policy) ?? false,
            ],
        ];
    }

    protected function mapAssignment(PolicyAssignment $assignment, bool $forAssignee, ?User $user = null): array
    {
        return [
            'id' => $assignment->id,
            'library_file_id' => $assignment->library_file_id,
            'policy_title' => $assignment->libraryFile?->title ?? 'Policy',
            'policy_scope_label' => $assignment->libraryFile?->tenant?->name ?? 'Shared',
            'version_number' => $assignment->version?->version_number,
            'status' => $assignment->status?->value,
            'due_date' => optional($assignment->due_date)->toDateString(),
            'source_type' => $assignment->source_type,
            'source_department' => $assignment->sourceDepartment ? [
                'id' => $assignment->sourceDepartment->id,
                'name' => $assignment->sourceDepartment->name,
            ] : null,
            'assigned_to' => $assignment->assignedTo ? [
                'id' => $assignment->assignedTo->id,
                'name' => $assignment->assignedTo->name,
                'email' => $assignment->assignedTo->email,
            ] : null,
            'assigned_by' => $assignment->assignedBy ? [
                'id' => $assignment->assignedBy->id,
                'name' => $assignment->assignedBy->name,
            ] : null,
            'first_viewed_at' => optional($assignment->first_viewed_at)->toIso8601String(),
            'last_viewed_at' => optional($assignment->last_viewed_at)->toIso8601String(),
            'acknowledged_at' => optional($assignment->acknowledged_at)->toIso8601String(),
            'view_count' => $assignment->view_count,
            'open_url' => route('policy-assignments.open', $assignment, false),
            'acknowledge_url' => route('policy-assignments.acknowledge', $assignment, false),
            'abilities' => [
                'canAcknowledge' => $forAssignee && $user?->can('acknowledge', $assignment),
            ],
        ];
    }

    protected function resolveTab(?string $requested, bool $canManageWorkspace): string
    {
        if (! $requested) {
            return $canManageWorkspace ? 'published' : 'my';
        }

        if (! $canManageWorkspace && in_array($requested, ['published', 'assignments'], true)) {
            return 'my';
        }

        return $requested;
    }

    protected function assignmentVisibilityQuery(User $user): Builder
    {
        $query = PolicyAssignment::query();

        if (! $user->isSuperAdmin()) {
            $query->where('tenant_id', $user->tenant_id);
        }

        return $query;
    }

    protected function assignableUsers(User $user): array
    {
        $query = User::query()
            ->withoutGlobalScopes()
            ->with('tenant:id,name')
            ->where('status', 'active')
            ->whereDoesntHave('roles', fn (Builder $builder) => $builder->where('name', 'super_admin'));

        if (! $user->isSuperAdmin()) {
            $query->where('tenant_id', $user->tenant_id);
        }

        return $query
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'tenant_id'])
            ->map(fn (User $candidate) => [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'email' => $candidate->email,
                'tenant_id' => $candidate->tenant_id,
                'tenant_name' => $candidate->tenant?->name,
            ])
            ->all();
    }

    protected function assignableDepartments(User $user): array
    {
        $query = Department::query()
            ->withoutGlobalScopes()
            ->with('tenant:id,name');

        if (! $user->isSuperAdmin()) {
            $query->where('tenant_id', $user->tenant_id);
        }

        return $query
            ->orderBy('name')
            ->get(['id', 'name', 'tenant_id'])
            ->map(fn (Department $department) => [
                'id' => $department->id,
                'name' => $department->name,
                'tenant_id' => $department->tenant_id,
                'tenant_name' => $department->tenant?->name,
            ])
            ->all();
    }
}
