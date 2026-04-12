<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\CourseRequest;
use App\Enums\CourseAssignmentStatus;
use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\User;
use App\Services\EmployeeCourseWorkspaceService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CourseController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request, EmployeeCourseWorkspaceService $workspaceService): Response|StreamedResponse
    {
        $this->authorize('viewAny', Course::class);

        if ($this->shouldShowEmployeeWorkspace($request->user())) {
            return Inertia::render('courses/index', [
                'employeeWorkspace' => $workspaceService->for($request->user()),
            ]);
        }

        $filters = $this->validateIndex($request, ['title', 'status', 'estimated_minutes', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
        ]);

        $query = Course::query()->withCount(['modules', 'tests']);
        $this->applySearch($query, $filters['search'] ?? null, ['title', 'description']);
        $this->applyFilters($query, $filters, ['status' => 'status']);
        $this->applySort($query, [
            'title' => 'title',
            'status' => 'status',
            'estimated_minutes' => 'estimated_minutes',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (Course $course) => [
                $course->title,
                $course->estimated_minutes ?: 0,
                $course->modules_count,
                $course->tests_count,
                $course->status->value,
            ])->all();

            return $this->queueTableExport($request, 'courses.index', $filters, ['Title', 'Minutes', 'Modules', 'Tests', 'Status'], $rows, 'Courses');
        }

        return Inertia::render('courses/index', [
            'courses' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => Course::query()->count(),
                'published' => Course::query()->where('status', 'published')->count(),
                'draft' => Course::query()->where('status', 'draft')->count(),
                'archived' => Course::query()->where('status', 'archived')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Course::class);

        return Inertia::render('courses/create');
    }

    public function store(CourseRequest $request): RedirectResponse
    {
        $this->authorize('create', Course::class);

        $data = $request->validated();
        unset($data['image'], $data['remove_image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('courses', 'public');
        }

        $course = Course::query()->create([
            ...$data,
            'slug' => Str::slug($request->string('title')).'-'.Str::lower(Str::random(6)),
            'created_by' => $request->user()?->id,
        ]);
        app(\App\Services\AuditLogService::class)->logModelCreated('course_created', $course);

        return redirect()
            ->route('courses.show', ['course' => $course, 'tab' => 'modules'])
            ->with('success', 'Course created. Continue building modules and lessons.');
    }

    public function show(Course $course): Response
    {
        $this->authorize('view', $course);

        return Inertia::render('courses/show', [
            'course' => $course->load([
                'modules' => fn ($query) => $query->orderBy('sort_order'),
                'modules.lessons' => fn ($query) => $query->orderBy('sort_order'),
                'tests.questions.options',
            ]),
            'canManage' => request()->user()?->can('manage courses') ?? false,
        ]);
    }

    public function update(CourseRequest $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $data = $request->validated();
        $removeImage = (bool) ($data['remove_image'] ?? false);
        unset($data['image'], $data['remove_image']);

        if ($request->hasFile('image')) {
            if ($course->image_path) {
                Storage::disk('public')->delete($course->image_path);
            }
            $data['image_path'] = $request->file('image')->store('courses', 'public');
        } elseif ($removeImage && $course->image_path) {
            Storage::disk('public')->delete($course->image_path);
            $data['image_path'] = null;
        }

        $oldValues = $course->toArray();
        $course->update($data);
        app(\App\Services\AuditLogService::class)->logModelUpdated('course_updated', $course, $oldValues);

        return back()->with('success', 'Course updated.');
    }

    public function publish(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        if ($course->status === CourseStatus::Published) {
            return back()->with('success', 'Course is already published.');
        }

        $oldValues = $course->toArray();
        $course->update([
            'status' => CourseStatus::Published,
        ]);
        app(\App\Services\AuditLogService::class)->logModelUpdated('course_published', $course, $oldValues);

        return back()->with('success', 'Course published successfully.');
    }

    public function selfAssign(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('selfAssign', $course);

        $user = $request->user();

        $mandatoryAssignment = CourseAssignment::query()
            ->where('course_id', $course->id)
            ->where('assigned_to_user_id', $user->id)
            ->where(fn ($query) => $query->whereNull('assigned_by')->orWhere('assigned_by', '<>', $user->id))
            ->latest('assigned_at')
            ->first();

        if ($mandatoryAssignment) {
            return redirect()
                ->route('assignments.show', $mandatoryAssignment)
                ->with('success', 'Opening your mandatory course assignment.');
        }

        $assignment = CourseAssignment::query()->firstOrCreate(
            [
                'course_id' => $course->id,
                'assigned_to_user_id' => $user->id,
                'assigned_by' => $user->id,
            ],
            [
                'tenant_id' => $user->tenant_id,
                'assigned_at' => now(),
                'due_date' => null,
                'status' => CourseAssignmentStatus::Assigned,
            ]
        );

        if ($assignment->wasRecentlyCreated) {
            app(\App\Services\AuditLogService::class)->logModelCreated('public_course_started', $assignment);
        }

        return redirect()
            ->route('assignments.show', $assignment)
            ->with('success', $assignment->wasRecentlyCreated ? 'Public course started.' : 'Continuing public course.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);
        $oldValues = $course->toArray();
        $course->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('course_deleted', $course, $oldValues);

        return back()->with('success', 'Course deleted.');
    }

    protected function shouldShowEmployeeWorkspace(?User $user): bool
    {
        return $user !== null
            && $user->can(Permissions::TAKE_TESTS)
            && ! $user->can(Permissions::ASSIGN_TRAINING)
            && ! $user->can(Permissions::MANAGE_COURSES);
    }
}
