<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\ComplianceResponseRequest;
use App\Http\Requests\ComplianceSubmissionRequest;
use App\Models\ComplianceFramework;
use App\Models\ComplianceResponse;
use App\Models\ComplianceSubmission;
use App\Models\Tenant;
use App\Models\User;
use App\Services\AppNotificationService;
use App\Services\ComplianceScoringService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ComplianceSubmissionController extends Controller
{
    use InteractsWithIndexTables;

    public function __construct(protected ComplianceScoringService $complianceScoringService)
    {
    }

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', ComplianceSubmission::class);

        $filters = $this->validateIndex($request, ['title', 'status', 'reporting_period', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
            'framework_id' => ['nullable', 'integer'],
            'tenant_id' => ['nullable', 'integer'],
        ]);

        $query = ComplianceSubmission::query()->with(['framework', 'score', 'tenant:id,name']);
        $this->applySearch($query, $filters['search'] ?? null, ['title', 'framework.name', 'reporting_period', 'tenant.name']);
        $this->applyFilters($query, $filters, [
            'status' => 'status',
            'framework_id' => 'compliance_framework_id',
            'tenant_id' => 'tenant_id',
        ]);
        $this->applySort($query, [
            'title' => 'title',
            'status' => 'status',
            'reporting_period' => 'reporting_period',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (ComplianceSubmission $submission) => [
                $submission->title,
                $submission->tenant?->name ?: 'Platform',
                $submission->framework?->name,
                $submission->reporting_period ?: 'N/A',
                $submission->score?->overall_score ?: 'Not scored',
                $submission->status->value,
            ])->all();

            return $this->queueTableExport($request, 'submissions.index', $filters, ['Title', 'Tenant', 'Framework', 'Period', 'Score', 'Status'], $rows, 'Submissions');
        }

        return Inertia::render('submissions/index', [
            'submissions' => $query->paginate($this->perPage($filters))->withQueryString(),
            'frameworks' => ComplianceFramework::query()->orderBy('name')->get(),
            'filters' => $filters,
            'isSuperAdmin' => $request->user()?->isSuperAdmin() ?? false,
            'tenants' => $request->user()?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : [],
            'stats' => [
                'total' => ComplianceSubmission::query()->count(),
                'submitted' => ComplianceSubmission::query()->where('status', 'submitted')->count(),
                'inReview' => ComplianceSubmission::query()->where('status', 'in_review')->count(),
                'scored' => ComplianceSubmission::query()->where('status', 'scored')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ComplianceSubmission::class);

        return Inertia::render('submissions/create', [
            'frameworks' => ComplianceFramework::query()->orderBy('name')->get(),
        ]);
    }

    public function store(ComplianceSubmissionRequest $request): RedirectResponse
    {
        $this->authorize('create', ComplianceSubmission::class);

        $submission = ComplianceSubmission::query()->create([
            ...$request->validated(),
            'status' => $request->input('status', 'draft'),
        ]);
        app(\App\Services\AuditLogService::class)->logModelCreated('submission_created', $submission);

        return redirect()->route('submissions.show', $submission)->with('success', 'Submission created.');
    }

    public function show(ComplianceSubmission $complianceSubmission): Response
    {
        $this->authorize('view', $complianceSubmission);

        $complianceSubmission->load([
            'tenant:id,name',
            'framework.sections.questions' => fn ($query) => $query->orderBy('sort_order'),
            'responses.evidenceFiles.uploader',
            'responses.evidenceFiles.reviews.reviewer',
            'score',
            'sectionScores.section',
        ]);

        $responses = $complianceSubmission->responses->keyBy('compliance_question_id');
        $questions = $complianceSubmission->framework?->sections?->flatMap->questions ?? collect();
        $answeredCount = $questions->filter(fn ($question) => filled(optional($responses->get($question->id))->answer_value) || filled(optional($responses->get($question->id))->answer_text))->count();
        $totalQuestions = $questions->count();
        $completionPercentage = $totalQuestions > 0 ? (int) round(($answeredCount / $totalQuestions) * 100) : 0;

        return Inertia::render('submissions/show', [
            'submission' => $complianceSubmission,
            'meta' => [
                'completionPercentage' => $completionPercentage,
                'answeredCount' => $answeredCount,
                'totalQuestions' => $totalQuestions,
            ],
        ]);
    }

    public function update(ComplianceSubmissionRequest $request, ComplianceSubmission $complianceSubmission): RedirectResponse
    {
        $this->authorize('update', $complianceSubmission);
        $oldValues = $complianceSubmission->toArray();
        $complianceSubmission->update($request->validated());
        app(\App\Services\AuditLogService::class)->logModelUpdated('submission_updated', $complianceSubmission, $oldValues);

        return back()->with('success', 'Submission updated.');
    }

    public function saveResponses(ComplianceResponseRequest $request, ComplianceSubmission $complianceSubmission): RedirectResponse
    {
        $this->authorize('update', $complianceSubmission);

        try {
            DB::transaction(function () use ($request, $complianceSubmission) {
                foreach ($request->validated('responses') as $payload) {
                    ComplianceResponse::query()->updateOrCreate(
                        [
                            'tenant_id' => $complianceSubmission->tenant_id,
                            'compliance_submission_id' => $complianceSubmission->id,
                            'compliance_question_id' => $payload['compliance_question_id'],
                        ],
                        [
                            'answer_value' => $payload['answer_value'] ?? null,
                            'answer_text' => $payload['answer_text'] ?? null,
                            'comment_text' => $payload['comment_text'] ?? null,
                            'status' => filled($payload['answer_value'] ?? null) || filled($payload['answer_text'] ?? null) ? 'completed' : 'draft',
                            'answered_by' => $request->user()?->id,
                            'answered_at' => now(),
                        ]
                    );
                }
            });
            app(\App\Services\AuditLogService::class)->logModel('submission_draft_saved', $complianceSubmission, [], [
                'response_count' => count($request->validated('responses')),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to save compliance responses', [
                'submission_id' => $complianceSubmission->id,
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to save responses. Please try again.');
        }

        return back()->with('success', 'Submission draft saved.');
    }

    public function submit(ComplianceSubmission $complianceSubmission): RedirectResponse
    {
        $this->authorize('update', $complianceSubmission);

        try {
            $complianceSubmission->update([
                'status' => 'submitted',
                'submitted_by' => request()->user()?->id,
                'submitted_at' => now(),
            ]);

            $this->complianceScoringService->scoreSubmission($complianceSubmission->fresh(), request()->user()?->id);
            app(\App\Services\AuditLogService::class)->logModel('submission_submitted', $complianceSubmission);

            $reviewers = User::query()
                ->where('tenant_id', $complianceSubmission->tenant_id)
                ->role('reviewer')
                ->get();

            foreach ($reviewers as $reviewer) {
                app(AppNotificationService::class)->sendToUser(
                    $reviewer,
                    'submission_submitted',
                    'A submission is ready for review',
                    sprintf('%s has been submitted for review.', $complianceSubmission->title),
                    route('submissions.show', $complianceSubmission, false),
                    ['submission_id' => $complianceSubmission->id]
                );
            }
        } catch (\Throwable $e) {
            Log::error('Compliance submission failed', [
                'submission_id' => $complianceSubmission->id,
                'user_id' => request()->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to submit. Please try again.');
        }

        return back()->with('success', 'Submission sent for review.');
    }

    public function recalculate(ComplianceSubmission $complianceSubmission): RedirectResponse
    {
        $this->authorize('update', $complianceSubmission);

        try {
            $this->complianceScoringService->scoreSubmission($complianceSubmission, request()->user()?->id);
            app(\App\Services\AuditLogService::class)->logModel('submission_recalculated', $complianceSubmission);
        } catch (\Throwable $e) {
            Log::error('Compliance score recalculation failed', [
                'submission_id' => $complianceSubmission->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to recalculate score. Please try again.');
        }

        return back()->with('success', 'Compliance score recalculated.');
    }

    public function exportPdf(Request $request, ComplianceSubmission $complianceSubmission): RedirectResponse
    {
        $this->authorize('view', $complianceSubmission);
        app(\App\Services\AuditLogService::class)->logModel('submission_pdf_requested', $complianceSubmission);

        return $this->queuePdfExport($request, 'submissions.pdf', ['submission_id' => $complianceSubmission->id], [
            'submission_id' => $complianceSubmission->id,
            'title' => $complianceSubmission->title,
        ]);
    }
}
