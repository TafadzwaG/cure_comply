<?php

namespace App\Http\Controllers;

use App\Enums\TestStatus;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\TestRequest;
use App\Models\ComplianceFramework;
use App\Models\Course;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TestController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', Test::class);

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
