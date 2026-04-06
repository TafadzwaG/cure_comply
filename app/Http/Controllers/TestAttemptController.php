<?php

namespace App\Http\Controllers;

use App\Enums\TestAttemptResultStatus;
use App\Models\Test;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TestAttemptController extends Controller
{
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
        ]);

        $attempt = DB::transaction(function () use ($request, $test) {
            $attempt = TestAttempt::query()->create([
                'tenant_id' => $request->user()?->tenant_id,
                'test_id' => $test->id,
                'user_id' => $request->user()?->id,
                'attempt_number' => TestAttempt::query()->where('test_id', $test->id)->where('user_id', $request->user()?->id)->count() + 1,
                'started_at' => now(),
                'submitted_at' => now(),
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

    public function show(Test $test, TestAttempt $testAttempt): Response
    {
        abort_unless($testAttempt->user_id === request()->user()?->id || request()->user()?->can('manage tests'), 403);

        return Inertia::render('tests/result', [
            'test' => $test,
            'attempt' => $testAttempt->load('answers.question', 'answers.selectedOption'),
        ]);
    }
}
