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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CourseAssignmentController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', CourseAssignment::class);

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

            return $this->exportTable('assignments.xlsx', ['Employee', 'Email', 'Tenant', 'Course', 'Due Date', 'Status'], $rows);
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
            'users' => User::query()->where('tenant_id', current_tenant()?->id)->orderBy('name')->get(),
        ]);
    }

    public function store(CourseAssignmentRequest $request): RedirectResponse
    {
        $this->authorize('create', CourseAssignment::class);

        CourseAssignment::query()->create([
            ...$request->validated(),
            'assigned_by' => $request->user()?->id,
            'assigned_at' => now(),
            'status' => $request->input('status', 'assigned'),
        ]);

        return back()->with('success', 'Assignment created.');
    }

    public function update(CourseAssignmentRequest $request, CourseAssignment $courseAssignment): RedirectResponse
    {
        $this->authorize('update', $courseAssignment);
        $courseAssignment->update($request->validated());

        return back()->with('success', 'Assignment updated.');
    }

    public function destroy(CourseAssignment $courseAssignment): RedirectResponse
    {
        $this->authorize('delete', $courseAssignment);
        $courseAssignment->delete();

        return back()->with('success', 'Assignment deleted.');
    }
}
