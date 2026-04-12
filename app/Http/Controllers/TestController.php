<?php

namespace App\Http\Controllers;

use App\Enums\TestStatus;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\TestRequest;
use App\Models\ComplianceFramework;
use App\Models\Course;
use App\Models\Test;
use App\Models\TestAssignment;
use App\Models\TestAttempt;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TestController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', Test::class);

        $user = $request->user();

        if (
            $user
            && $user->can(Permissions::TAKE_TESTS)
            && ! $user->hasRole('company_admin')
            && ! $user->can(Permissions::MANAGE_TESTS)
        ) {
            return Inertia::render('tests/index', [
                'employeeWorkspace' => $this->employeeWorkspacePayload($user),
            ]);
        }

        $filters = $this->validateIndex($request, ['title', 'status', 'pass_mark', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
            'course_id' => ['nullable', 'integer'],
        ]);

        $query = Test::query()->with(['course', 'framework:id,name'])->withCount('questions');
        $this->applySearch($query, $filters['search'] ?? null, ['title', 'course.title']);
        $this->applyFilters($query, $filters, [
            'status' => 'status',
            'course_id' => 'course_id',
        ]);
        $this->applySort($query, [
            'title' => 'title',
            'status' => 'status',
            'pass_mark' => 'pass_mark',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (Test $test) => [
                $test->title,
                $test->course?->title ?: 'Standalone',
                $test->questions_count,
                $test->pass_mark,
                $test->status->value,
            ])->all();

            return $this->queueTableExport($request, 'tests.index', $filters, ['Title', 'Course', 'Questions', 'Pass Mark', 'Status'], $rows, 'Tests');
        }

        return Inertia::render('tests/index', [
            'tests' => $query->paginate($this->perPage($filters))->withQueryString(),
            'courses' => Course::query()->orderBy('title')->get(),
            'filters' => $filters,
            'stats' => [
                'total' => Test::query()->count(),
                'published' => Test::query()->where('status', 'published')->count(),
                'draft' => Test::query()->where('status', 'draft')->count(),
                'archived' => Test::query()->where('status', 'archived')->count(),
            ],
        ]);
    }

    protected function employeeWorkspacePayload(User $user): array
    {
        $attemptsByTest = TestAttempt::query()
            ->where('user_id', $user->id)
            ->orderByDesc('attempt_number')
            ->get(['id', 'test_id', 'attempt_number', 'percentage', 'result_status', 'submitted_at'])
            ->groupBy('test_id');

        $assignedTests = TestAssignment::query()
            ->where('assigned_to_user_id', $user->id)
            ->with([
                'test' => fn ($query) => $query->with(['course:id,title'])->withCount('questions'),
            ])
            ->latest('assigned_at')
            ->get()
            ->filter(fn (TestAssignment $assignment) => $assignment->test !== null)
            ->map(fn (TestAssignment $assignment) => $this->mapEmployeeTestRow($assignment->test, $attemptsByTest, $assignment))
            ->values();

        $publicTests = Test::query()
            ->with(['course:id,title'])
            ->withCount('questions')
            ->where('status', TestStatus::Published)
            ->whereNotIn('id', $assignedTests->pluck('id')->all())
            ->orderBy('title')
            ->get()
            ->map(fn (Test $test) => $this->mapEmployeeTestRow($test, $attemptsByTest))
            ->values();

        $recentAttempts = TestAttempt::query()
            ->where('user_id', $user->id)
            ->with('test:id,title')
            ->latest('submitted_at')
            ->limit(8)
            ->get()
            ->map(fn (TestAttempt $attempt) => [
                'id' => $attempt->id,
                'test_id' => $attempt->test_id,
                'test_title' => $attempt->test?->title ?? 'Assessment',
                'attempt_number' => $attempt->attempt_number,
                'percentage' => round((float) ($attempt->percentage ?? 0), 1),
                'result_status' => $attempt->result_status?->value,
                'submitted_at' => optional($attempt->submitted_at)?->toIso8601String(),
            ])
            ->values()
            ->all();

        return [
            'stats' => [
                'mandatory' => $assignedTests->count(),
                'public' => $publicTests->count(),
                'attempted' => $attemptsByTest->count(),
                'attempts' => $attemptsByTest->sum(fn (Collection $attempts) => $attempts->count()),
            ],
            'assignedTests' => $assignedTests->all(),
            'publicTests' => $publicTests->all(),
            'recentAttempts' => $recentAttempts,
        ];
    }

    protected function mapEmployeeTestRow(Test $test, Collection $attemptsByTest, ?TestAssignment $assignment = null): array
    {
        /** @var Collection<int, TestAttempt> $attempts */
        $attempts = $attemptsByTest->get($test->id, collect());
        /** @var TestAttempt|null $latestAttempt */
        $latestAttempt = $attempts->first();
        $attemptCount = $attempts->count();
        $maxAttempts = $test->max_attempts;
        $canTake = $test->status === TestStatus::Published
            && ($maxAttempts === null || $attemptCount < $maxAttempts);

        return [
            'id' => $test->id,
            'title' => $test->title,
            'course' => $test->course?->title,
            'questions_count' => $test->questions_count ?? 0,
            'pass_mark' => $test->pass_mark,
            'status' => $test->status->value,
            'assignment_status' => $assignment?->status,
            'due_date' => optional($assignment?->due_date)?->toDateString(),
            'attempts_count' => $attemptCount,
            'best_score' => round((float) ($attempts->max('percentage') ?? 0), 1),
            'latest_result_status' => $latestAttempt?->result_status?->value,
            'latest_attempt_id' => $latestAttempt?->id,
            'latest_submitted_at' => optional($latestAttempt?->submitted_at)?->toIso8601String(),
            'can_take' => $canTake,
            'max_attempts' => $maxAttempts,
            'is_mandatory' => $assignment !== null,
        ];
    }

    public function create(): Response
    {
        $this->authorize('create', Test::class);

        return Inertia::render('tests/create', [
            'courses' => Course::query()->orderBy('title')->get(),
            'frameworks' => ComplianceFramework::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(TestRequest $request): RedirectResponse
    {
        $this->authorize('create', Test::class);

        $test = Test::query()->create([
            ...$request->validated(),
            'created_by' => $request->user()?->id,
        ]);
        app(\App\Services\AuditLogService::class)->logModelCreated('test_created', $test);

        return redirect()->route('tests.show', $test)->with('success', 'Test created. Now add questions below.');
    }

    public function show(Test $test): Response
    {
        $this->authorize('view', $test);

        $user = request()->user();

        $attempts = TestAttempt::query()
            ->where('test_id', $test->id)
            ->where('user_id', $user?->id)
            ->orderByDesc('attempt_number')
            ->get(['id', 'attempt_number', 'score', 'percentage', 'result_status', 'submitted_at', 'started_at', 'time_spent_seconds']);

        $canTake = $test->status->value === 'published'
            && $user?->can('take tests')
            && ($test->max_attempts === null || $attempts->count() < $test->max_attempts);

        $assignableEmployees = collect();

        if (($user?->hasRole('company_admin') || $user?->can('manage tests')) && $user?->tenant_id) {
            $assignableEmployees = User::query()
                ->where('tenant_id', $user->tenant_id)
                ->whereHas('employeeProfile')
                ->orderBy('name')
                ->get(['id', 'name', 'email']);
        }

        return Inertia::render('tests/show', [
            'test' => $test->load([
                'course',
                'framework:id,name',
                'questions' => fn ($q) => $q->orderBy('sort_order'),
                'questions.options' => fn ($q) => $q->orderBy('sort_order'),
                'assignments' => fn ($q) => $q->latest('assigned_at'),
                'assignments.assignedTo:id,name,email',
                'assignments.assignedBy:id,name',
            ]),
            'frameworks' => ComplianceFramework::query()->orderBy('name')->get(['id', 'name']),
            'attempts' => $attempts,
            'canTake' => $canTake,
            'canManage' => ($user?->hasRole('company_admin') || $user?->can('manage tests')) ?? false,
            'attemptsUsed' => $attempts->count(),
            'maxAttempts' => $test->max_attempts,
            'courses' => Course::query()->orderBy('title')->get(['id', 'title']),
            'assignableEmployees' => $assignableEmployees,
        ]);
    }

    public function update(TestRequest $request, Test $test): RedirectResponse
    {
        $this->authorize('update', $test);
        $oldValues = $test->toArray();
        $test->update($request->validated());
        app(\App\Services\AuditLogService::class)->logModelUpdated('test_updated', $test, $oldValues);

        return back()->with('success', 'Test updated.');
    }

    public function publish(Request $request, Test $test): RedirectResponse
    {
        $this->authorize('update', $test);

        if ($test->status === TestStatus::Published) {
            return back()->with('success', 'Test is already published.');
        }

        $oldValues = $test->toArray();
        $test->update([
            'status' => TestStatus::Published,
        ]);
        app(\App\Services\AuditLogService::class)->logModelUpdated('test_published', $test, $oldValues);

        return back()->with('success', 'Test published successfully.');
    }

    public function destroy(Test $test): RedirectResponse
    {
        $this->authorize('delete', $test);
        $oldValues = $test->toArray();
        $test->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('test_deleted', $test, $oldValues);

        return back()->with('success', 'Test deleted.');
    }
}
