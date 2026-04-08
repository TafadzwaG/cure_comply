<?php

namespace App\Http\Controllers;

use App\Enums\TestAttemptResultStatus;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Models\ComplianceFramework;
use App\Models\Tenant;
use App\Models\Test;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TestAttemptController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        abort_unless($request->user()?->can('manage tests'), 403);

        $filters = $this->validateIndex($request, ['submitted_at', 'percentage', 'attempt_number'], [
            'result_status' => ['nullable', 'string'],
            'test_id' => ['nullable', 'integer'],
            'tenant_id' => ['nullable', 'integer'],
        ]);

        $query = TestAttempt::query()->with(['test:id,title', 'user:id,name,email', 'tenant:id,name']);
        $this->applySearch($query, $filters['search'] ?? null, ['user.name', 'user.email', 'test.title']);
        $this->applyFilters($query, $filters, [
            'result_status' => 'result_status',
            'test_id' => 'test_id',
            'tenant_id' => 'tenant_id',
        ]);
        $this->applySort($query, [
            'submitted_at' => 'submitted_at',
            'percentage' => 'percentage',
            'attempt_number' => 'attempt_number',
        ], $filters['sort'] ?? null, $filters['direction'] ?? 'desc');

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (TestAttempt $a) => [
                $a->user?->name,
                $a->user?->email,
                $a->tenant?->name ?: 'Platform',
                $a->test?->title,
                $a->attempt_number,
                $a->percentage,
                $a->result_status?->value,
                optional($a->submitted_at)->toDateTimeString(),
            ])->all();

            return $this->exportTable('test-attempts.xlsx',
                ['User', 'Email', 'Tenant', 'Test', 'Attempt', 'Score %', 'Result', 'Submitted'],
                $rows,
            );
        }

        return Inertia::render('test-attempts/index', [
            'attempts' => $query->paginate($this->perPage($filters))->withQueryString(),
            'tests' => Test::query()->orderBy('title')->get(['id', 'title']),
            'tenants' => $request->user()?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : [],
            'isSuperAdmin' => $request->user()?->isSuperAdmin() ?? false,
            'filters' => $filters,
            'stats' => [
                'total' => TestAttempt::query()->count(),
                'passed' => TestAttempt::query()->where('result_status', 'passed')->count(),
                'failed' => TestAttempt::query()->where('result_status', 'failed')->count(),
                'pending' => TestAttempt::query()->where('result_status', 'pending_review')->count(),
            ],
        ]);
    }

    public function create(Test $test): Response
    {
        $this->authorize('view', $test);

        $user = request()->user();
        $previousAttempts = TestAttempt::query()
            ->where('test_id', $test->id)
            ->where('user_id', $user?->id)
            ->count();

        if ($test->max_attempts !== null && $previousAttempts >= $test->max_attempts) {
            return Inertia::render('tests/show', [
                'test' => $test->load(['course', 'questions.options']),
                'attempts' => TestAttempt::query()
                    ->where('test_id', $test->id)
                    ->where('user_id', $user?->id)
                    ->orderByDesc('attempt_number')
                    ->get(['id', 'attempt_number', 'score', 'percentage', 'result_status', 'submitted_at']),
                'canTake' => false,
                'attemptsUsed' => $previousAttempts,
                'maxAttempts' => $test->max_attempts,
            ]);
        }

        return Inertia::render('tests/take', [
            'test' => $test->load(['questions' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'), 'questions.options' => fn ($q) => $q->orderBy('sort_order')]),
            'attemptNumber' => $previousAttempts + 1,
            'maxAttempts' => $test->max_attempts,
        ]);
    }

    public function store(Request $request, Test $test): RedirectResponse
    {
        $request->validate([
            'answers' => ['required', 'array'],
            'started_at' => ['nullable', 'date'],
            'time_spent_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        $attempt = DB::transaction(function () use ($request, $test) {
            $startedAt = $request->input('started_at') ? \Carbon\Carbon::parse($request->input('started_at')) : now();
            $submittedAt = now();
            $timeSpent = $request->input('time_spent_seconds');
            if ($timeSpent === null) {
                $timeSpent = max(0, $submittedAt->diffInSeconds($startedAt));
            }

            $attempt = TestAttempt::query()->create([
                'tenant_id' => $request->user()?->tenant_id,
                'test_id' => $test->id,
                'user_id' => $request->user()?->id,
                'attempt_number' => TestAttempt::query()->where('test_id', $test->id)->where('user_id', $request->user()?->id)->count() + 1,
                'started_at' => $startedAt,
                'submitted_at' => $submittedAt,
                'time_spent_seconds' => $timeSpent,
                'result_status' => TestAttemptResultStatus::PendingReview,
            ]);

            $score = 0;
            $availableMarks = 0;

            foreach ($test->questions as $question) {
                $answerPayload = collect($request->input('answers'))->firstWhere('question_id', $question->id);
                $selectedOptionId = data_get($answerPayload, 'selected_option_id');
                $selectedOption = $question->options->firstWhere('id', $selectedOptionId);
                $isCorrect = $selectedOption?->is_correct;
                $marksAwarded = $isCorrect ? $question->marks : 0;
                $availableMarks += $question->marks;
                $score += $marksAwarded;

                TestAnswer::query()->create([
                    'test_attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'selected_option_id' => $selectedOptionId,
                    'answer_text' => data_get($answerPayload, 'answer_text'),
                    'is_correct' => $isCorrect,
                    'marks_awarded' => $marksAwarded,
                ]);
            }

            $percentage = $availableMarks > 0 ? round(($score / $availableMarks) * 100, 2) : 0;
            $attempt->update([
                'score' => $score,
                'percentage' => $percentage,
                'result_status' => $percentage >= $test->pass_mark ? TestAttemptResultStatus::Passed : TestAttemptResultStatus::Failed,
            ]);

            return $attempt;
        });

        return to_route('tests.attempts.show', [$test, $attempt])->with('success', 'Test submitted.');
    }

    public function analytics(Request $request): Response
    {
        abort_unless($request->user()?->can('manage tests'), 403);

        // Per-framework roll-up
        $rows = TestAttempt::query()
            ->join('tests', 'tests.id', '=', 'test_attempts.test_id')
            ->leftJoin('compliance_frameworks', 'compliance_frameworks.id', '=', 'tests.compliance_framework_id')
            ->selectRaw('
                COALESCE(compliance_frameworks.id, 0) as framework_id,
                COALESCE(compliance_frameworks.name, "Unassigned") as framework_name,
                COUNT(test_attempts.id) as total_attempts,
                SUM(CASE WHEN test_attempts.result_status = "passed" THEN 1 ELSE 0 END) as passed,
                SUM(CASE WHEN test_attempts.result_status = "failed" THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN test_attempts.result_status = "pending_review" THEN 1 ELSE 0 END) as pending,
                AVG(test_attempts.percentage) as avg_score,
                AVG(test_attempts.time_spent_seconds) as avg_time_seconds
            ')
            ->whereNotNull('test_attempts.submitted_at')
            ->groupBy('framework_id', 'framework_name')
            ->orderByDesc('total_attempts')
            ->get();

        $overall = [
            'total' => (int) TestAttempt::query()->count(),
            'passed' => (int) TestAttempt::query()->where('result_status', 'passed')->count(),
            'failed' => (int) TestAttempt::query()->where('result_status', 'failed')->count(),
            'pending' => (int) TestAttempt::query()->where('result_status', 'pending_review')->count(),
            'avg_score' => round((float) TestAttempt::query()->avg('percentage'), 2),
            'avg_time_seconds' => (int) round((float) TestAttempt::query()->avg('time_spent_seconds')),
        ];

        return Inertia::render('test-attempts/analytics', [
            'frameworks' => $rows->map(fn ($r) => [
                'framework_id' => (int) $r->framework_id,
                'framework_name' => $r->framework_name,
                'total_attempts' => (int) $r->total_attempts,
                'passed' => (int) $r->passed,
                'failed' => (int) $r->failed,
                'pending' => (int) $r->pending,
                'pass_rate' => $r->total_attempts > 0 ? round(($r->passed / $r->total_attempts) * 100, 1) : 0,
                'avg_score' => round((float) $r->avg_score, 2),
                'avg_time_seconds' => (int) round((float) $r->avg_time_seconds),
            ]),
            'overall' => $overall,
        ]);
    }

    public function show(Test $test, TestAttempt $testAttempt): Response
    {
        abort_unless($testAttempt->user_id === request()->user()?->id || request()->user()?->can('manage tests'), 403);

        return Inertia::render('tests/result', [
            'test' => $test,
            'attempt' => $testAttempt->load('answers.question', 'answers.selectedOption'),
        ]);
    }
}
