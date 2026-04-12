<?php

namespace App\Http\Controllers;

use App\Enums\CourseAssignmentStatus;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\CourseAssignmentRequest;
use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\LessonProgress;
use App\Models\Tenant;
use App\Models\User;
use App\Services\AppNotificationService;
use App\Services\EmployeeCourseWorkspaceService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CourseAssignmentController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request, EmployeeCourseWorkspaceService $workspaceService): Response|StreamedResponse
    {
        $this->authorize('viewAny', CourseAssignment::class);

        if ($this->shouldShowEmployeeWorkspace($request->user())) {
            return Inertia::render('assignments/index', [
                'employeeWorkspace' => $workspaceService->for($request->user()),
            ]);
        }

        $filters = $this->validateIndex($request, ['status', 'due_date', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
            'due_state' => ['nullable', 'string'],
            'course_id' => ['nullable', 'integer'],
            'tenant_id' => ['nullable', 'integer'],
        ]);

        $query = CourseAssignment::query()->with(['course', 'assignedTo', 'assignedBy', 'tenant:id,name']);
        $this->applySearch($query, $filters['search'] ?? null, ['course.title', 'assignedTo.name', 'assignedTo.email', 'tenant.name']);
        $this->applyFilters($query, $filters, [
            'status' => 'status',
            'course_id' => 'course_id',
            'tenant_id' => 'tenant_id',
            'due_state' => function ($builder, $value) {
                if ($value === 'overdue') {
                    $builder->whereDate('due_date', '<', now())->whereNotIn('status', ['completed']);
                }

                if ($value === 'upcoming') {
                    $builder->whereDate('due_date', '>=', now());
                }
            },
        ]);
        $this->applySort($query, [
            'status' => 'status',
            'due_date' => 'due_date',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (CourseAssignment $assignment) => [
                $assignment->assignedTo?->name,
                $assignment->assignedTo?->email,
                $assignment->tenant?->name ?: 'Platform',
                $assignment->course?->title,
                optional($assignment->due_date)?->format('Y-m-d') ?: 'None',
                $assignment->status->value,
            ])->all();

            return $this->queueTableExport($request, 'assignments.index', $filters, ['Employee', 'Email', 'Tenant', 'Course', 'Due Date', 'Status'], $rows, 'Assignments');
        }

        return Inertia::render('assignments/index', [
            'assignments' => $query->paginate($this->perPage($filters))->withQueryString(),
            'courses' => Course::query()->orderBy('title')->get(),
            'users' => User::query()->where('tenant_id', current_tenant()?->id)->orderBy('name')->get(),
            'tenants' => $request->user()?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : [],
            'isSuperAdmin' => $request->user()?->isSuperAdmin() ?? false,
            'filters' => $filters,
            'stats' => [
                'total' => CourseAssignment::query()->count(),
                'inProgress' => CourseAssignment::query()->where('status', 'in_progress')->count(),
                'completed' => CourseAssignment::query()->where('status', 'completed')->count(),
                'overdue' => CourseAssignment::query()->whereDate('due_date', '<', now())->whereNotIn('status', ['completed'])->count(),
            ],
        ]);
    }

    public function show(CourseAssignment $assignment): Response
    {
        $this->authorize('view', $assignment);

        $assignment->load([
            'course.modules' => fn ($q) => $q->orderBy('sort_order'),
            'course.modules.lessons' => fn ($q) => $q->where('status', 'published')->orderBy('sort_order'),
            'assignedTo:id,name,email',
            'assignedBy:id,name',
        ]);

        $userId = $assignment->assigned_to_user_id;

        $lessonIds = $assignment->course?->modules
            ->flatMap(fn ($m) => $m->lessons->pluck('id'))
            ->all() ?? [];

        $completedLessons = LessonProgress::query()
            ->where('user_id', $userId)
            ->whereIn('lesson_id', $lessonIds)
            ->whereNotNull('completed_at')
            ->pluck('lesson_id')
            ->all();

        $totalLessons = count($lessonIds);
        $completedCount = count($completedLessons);

        return Inertia::render('assignments/show', [
            'assignment' => $assignment,
            'completedLessonIds' => $completedLessons,
            'progress' => [
                'total' => $totalLessons,
                'completed' => $completedCount,
                'percentage' => $totalLessons > 0 ? round(($completedCount / $totalLessons) * 100) : 0,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', CourseAssignment::class);

        return Inertia::render('assignments/create', [
            'courses' => Course::query()->orderBy('title')->get(),
            'users' => User::query()
                ->select(['id', 'tenant_id', 'name', 'email'])
                ->role('employee')
                ->when(! auth()->user()?->isSuperAdmin(), fn ($query) => $query->where('tenant_id', auth()->user()?->tenant_id))
                ->orderBy('name')
                ->get(),
            'tenants' => auth()->user()?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : [],
            'isSuperAdmin' => auth()->user()?->isSuperAdmin() ?? false,
        ]);
    }

    public function store(CourseAssignmentRequest $request): RedirectResponse
    {
        $this->authorize('create', CourseAssignment::class);

        $validated = $request->validated();
        $assignee = User::query()->findOrFail($validated['assigned_to_user_id']);
        $tenantId = $this->assignmentTenantId($request, $assignee);

        unset($validated['tenant_id']);

        $assignment = CourseAssignment::query()->create([
            ...$validated,
            'tenant_id' => $tenantId,
            'assigned_by' => $request->user()?->id,
            'assigned_at' => now(),
            'status' => $request->input('status', 'assigned'),
        ]);
        app(\App\Services\AuditLogService::class)->logModelCreated('assignment_created', $assignment);

        if ($assignedUser = $assignment->assignedTo()->first()) {
            app(AppNotificationService::class)->sendToUser(
                $assignedUser,
                'assignment_created',
                'New training assignment',
                sprintf('You have been assigned %s.', $assignment->course()->first()?->title ?? 'a training course'),
                route('assignments.show', $assignment, false),
                ['assignment_id' => $assignment->id]
            );
        }

        $isSelf = (int) $assignment->assigned_to_user_id === (int) $request->user()?->id;

        if ($isSelf) {
            return redirect()
                ->route('assignments.show', $assignment->id)
                ->with('success', 'Assignment created. Start your training below.');
        }

        return redirect()
            ->route('assignments.index')
            ->with('success', 'Assignment created successfully.');
    }

    public function resume(Request $request, CourseAssignment $assignment): RedirectResponse
    {
        $this->authorize('view', $assignment);

        abort_unless($request->user()?->id === $assignment->assigned_to_user_id, 403);

        $data = $request->validate([
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
        ]);

        $oldValues = ['last_lesson_id' => $assignment->last_lesson_id];
        $assignment->update(['last_lesson_id' => $data['lesson_id']]);
        app(\App\Services\AuditLogService::class)->logModelUpdated('assignment_resumed', $assignment, $oldValues);

        return back();
    }

    public function update(CourseAssignmentRequest $request, CourseAssignment $courseAssignment): RedirectResponse
    {
        $this->authorize('update', $courseAssignment);
        $oldValues = $courseAssignment->toArray();
        $courseAssignment->update($request->validated());
        app(\App\Services\AuditLogService::class)->logModelUpdated('assignment_updated', $courseAssignment, $oldValues);

        return back()->with('success', 'Assignment updated.');
    }

    public function destroy(CourseAssignment $courseAssignment): RedirectResponse
    {
        $this->authorize('delete', $courseAssignment);
        $oldValues = $courseAssignment->toArray();
        $courseAssignment->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('assignment_deleted', $courseAssignment, $oldValues);

        return back()->with('success', 'Assignment deleted.');
    }

    protected function shouldShowEmployeeWorkspace(?User $user): bool
    {
        return $user !== null
            && $user->can(Permissions::TAKE_TESTS)
            && ! $user->can(Permissions::ASSIGN_TRAINING);
    }

    protected function assignmentTenantId(CourseAssignmentRequest $request, User $assignee): int
    {
        if (! $assignee->tenant_id) {
            throw ValidationException::withMessages([
                'assigned_to_user_id' => 'The selected employee is not attached to a tenant.',
            ]);
        }

        if (! $request->user()?->isSuperAdmin() && (int) $assignee->tenant_id !== (int) $request->user()?->tenant_id) {
            throw ValidationException::withMessages([
                'assigned_to_user_id' => 'You can only assign employees in your own tenant.',
            ]);
        }

        if ($request->user()?->isSuperAdmin() && $request->filled('tenant_id') && (int) $request->integer('tenant_id') !== (int) $assignee->tenant_id) {
            throw ValidationException::withMessages([
                'assigned_to_user_id' => 'The selected employee must belong to the selected tenant.',
            ]);
        }

        return (int) $assignee->tenant_id;
    }
}
