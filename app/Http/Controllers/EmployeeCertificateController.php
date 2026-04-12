<?php

namespace App\Http\Controllers;

use App\Enums\CourseAssignmentStatus;
use App\Enums\LessonStatus;
use App\Enums\TestAttemptResultStatus;
use App\Models\CourseAssignment;
use App\Models\LessonProgress;
use App\Models\TestAttempt;
use App\Support\Permissions;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeCertificateController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can(Permissions::TAKE_TESTS), 403);

        $courseCertificates = $this->courseCertificates($request);
        $testCertificates = $this->testCertificates($request);

        return Inertia::render('certificates/index', [
            'stats' => [
                'total' => $courseCertificates->count() + $testCertificates->count(),
                'courses' => $courseCertificates->count(),
                'tests' => $testCertificates->count(),
                'latestIssuedAt' => $courseCertificates
                    ->concat($testCertificates)
                    ->pluck('issued_at')
                    ->filter()
                    ->sortDesc()
                    ->first(),
            ],
            'courseCertificates' => $courseCertificates->values(),
            'testCertificates' => $testCertificates->values(),
        ]);
    }

    public function showCourse(Request $request, CourseAssignment $assignment): Response
    {
        abort_unless($request->user()?->can(Permissions::TAKE_TESTS), 403);
        abort_unless((int) $assignment->assigned_to_user_id === (int) $request->user()?->id, 403);

        $certificate = $this->courseCertificate($assignment, $request->user()->id);
        abort_unless((bool) $certificate['is_earned'], 403);

        return Inertia::render('certificates/show', [
            'certificate' => [
                ...$certificate,
                'type' => 'course',
                'recipient' => $request->user()->name,
                'tenant' => $request->user()->tenant?->name,
                'certificate_number' => sprintf('PC-C-%06d', $assignment->id),
            ],
        ]);
    }

    public function showTest(Request $request, TestAttempt $testAttempt): Response
    {
        abort_unless($request->user()?->can(Permissions::TAKE_TESTS), 403);
        abort_unless((int) $testAttempt->user_id === (int) $request->user()?->id, 403);
        abort_unless($testAttempt->result_status === TestAttemptResultStatus::Passed, 403);

        $testAttempt->load('test:id,title,description,pass_mark');

        return Inertia::render('certificates/show', [
            'certificate' => [
                'id' => $testAttempt->id,
                'type' => 'test',
                'title' => $testAttempt->test?->title ?? 'Assessment',
                'description' => $testAttempt->test?->description,
                'recipient' => $request->user()->name,
                'tenant' => $request->user()->tenant?->name,
                'issued_at' => optional($testAttempt->submitted_at)->toDateString(),
                'score' => round((float) $testAttempt->percentage, 1),
                'certificate_number' => sprintf('PC-T-%06d', $testAttempt->id),
                'detail' => sprintf('Passed attempt %d with a score of %s%%.', $testAttempt->attempt_number, round((float) $testAttempt->percentage, 1)),
                'source_url' => route('tests.attempts.show', [$testAttempt->test_id, $testAttempt->id]),
            ],
        ]);
    }

    protected function courseCertificates(Request $request)
    {
        return CourseAssignment::query()
            ->with(['course:id,title,description,estimated_minutes'])
            ->where('assigned_to_user_id', $request->user()?->id)
            ->latest('updated_at')
            ->get()
            ->map(fn (CourseAssignment $assignment) => $this->courseCertificate($assignment, $request->user()->id))
            ->filter(fn (array $certificate) => $certificate['is_earned'])
            ->values();
    }

    protected function courseCertificate(CourseAssignment $assignment, int $userId): array
    {
        $lessonIds = $assignment->course?->modules()
            ->whereHas('lessons', fn (Builder $query) => $query->where('status', LessonStatus::Published))
            ->with(['lessons' => fn ($query) => $query->where('status', LessonStatus::Published)->select('id', 'course_module_id')])
            ->get()
            ->flatMap(fn ($module) => $module->lessons->pluck('id'))
            ->values() ?? collect();

        $completed = LessonProgress::query()
            ->where('user_id', $userId)
            ->whereIn('lesson_id', $lessonIds)
            ->whereNotNull('completed_at')
            ->count();

        $total = $lessonIds->count();
        $percentage = $total > 0 ? (int) round(($completed / $total) * 100) : 0;
        $isEarned = $assignment->status === CourseAssignmentStatus::Completed || ($total > 0 && $completed >= $total);
        $issuedAt = LessonProgress::query()
            ->where('user_id', $userId)
            ->whereIn('lesson_id', $lessonIds)
            ->whereNotNull('completed_at')
            ->max('completed_at') ?: $assignment->updated_at;

        return [
            'id' => $assignment->id,
            'title' => $assignment->course?->title ?? 'Course',
            'description' => $assignment->course?->description,
            'issued_at' => $issuedAt ? Carbon::parse($issuedAt)->toDateString() : null,
            'score' => $percentage,
            'completed_lessons' => $completed,
            'total_lessons' => $total,
            'estimated_minutes' => $assignment->course?->estimated_minutes,
            'is_earned' => $isEarned,
            'detail' => sprintf('Completed %d of %d published lessons.', $completed, $total),
            'source_url' => route('assignments.show', $assignment),
            'certificate_url' => route('certificates.course.show', $assignment),
        ];
    }

    protected function testCertificates(Request $request)
    {
        return TestAttempt::query()
            ->with('test:id,title,description,pass_mark')
            ->where('user_id', $request->user()?->id)
            ->where('result_status', TestAttemptResultStatus::Passed)
            ->latest('submitted_at')
            ->get()
            ->map(fn (TestAttempt $attempt) => [
                'id' => $attempt->id,
                'title' => $attempt->test?->title ?? 'Assessment',
                'description' => $attempt->test?->description,
                'issued_at' => optional($attempt->submitted_at)->toDateString(),
                'score' => round((float) $attempt->percentage, 1),
                'attempt_number' => $attempt->attempt_number,
                'detail' => sprintf('Passed attempt %d with a score of %s%%.', $attempt->attempt_number, round((float) $attempt->percentage, 1)),
                'source_url' => route('tests.attempts.show', [$attempt->test_id, $attempt->id]),
                'certificate_url' => route('certificates.test.show', $attempt),
            ])
            ->values();
    }
}
