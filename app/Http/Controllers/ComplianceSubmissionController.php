<?php

namespace App\Http\Controllers;

use App\Enums\ComplianceSubmissionStatus;
use App\Enums\UserStatus;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\ComplianceResponseRequest;
use App\Http\Requests\ComplianceSubmissionRequest;
use App\Models\ComplianceFramework;
use App\Models\ComplianceResponse;
use App\Models\ComplianceSubmission;
use App\Models\ComplianceSubmissionAssignment;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\SubmissionAssignedNotification;
use App\Notifications\SubmissionSubmittedForReviewNotification;
use App\Services\AppNotificationService;
use App\Services\ComplianceScoringService;
use App\Support\Permissions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
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

        $query = ComplianceSubmission::query()
            ->with([
                'framework:id,name,version',
                'framework.sections:id,compliance_framework_id',
                'framework.sections.questions:id,compliance_section_id',
                'score',
                'tenant:id,name',
                'assignments:id,compliance_submission_id,assigned_to_user_id',
                'responses:id,compliance_submission_id,compliance_question_id,answer_value,answer_text',
            ]);
        $this->scopeVisibleSubmissions($query, $request->user());
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

        $submissions = $query
            ->paginate($this->perPage($filters))
            ->through(fn (ComplianceSubmission $submission) => $this->submissionIndexItem($submission, $request->user()))
            ->withQueryString();

        return Inertia::render('submissions/index', [
            'submissions' => $submissions,
            'frameworks' => ComplianceFramework::query()->orderBy('name')->get(),
            'filters' => $filters,
            'isSuperAdmin' => $request->user()?->isSuperAdmin() ?? false,
            'canManageSubmissions' => (bool) $request->user()?->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS),
            'tenants' => $request->user()?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : [],
            'stats' => $this->submissionStats($request->user()),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', ComplianceSubmission::class);

        return Inertia::render('submissions/create', [
            'frameworks' => ComplianceFramework::query()->orderBy('name')->get(),
            'employees' => $this->availableSubmissionAssignees($request),
            'tenants' => $request->user()?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : [],
            'isSuperAdmin' => $request->user()?->isSuperAdmin() ?? false,
        ]);
    }

    public function store(ComplianceSubmissionRequest $request): RedirectResponse
    {
        $this->authorize('create', ComplianceSubmission::class);

        $validated = $request->validated();
        $assigneeIds = collect($validated['assigned_to_user_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($validated['assigned_to_user_ids']);

        $tenantId = $this->submissionTenantId($request);
        abort_if($tenantId < 1, 422, 'A tenant is required to create a submission.');
        $validated['tenant_id'] = $tenantId;

        abort_if($assigneeIds->isNotEmpty() && ! $this->assigneesBelongToTenant($assigneeIds->all(), $tenantId), 422, 'Selected assignees must belong to the submission tenant.');

        $submission = ComplianceSubmission::query()->create([
            ...$validated,
            'status' => $request->input('status', 'draft'),
        ]);

        $newlyAssignedUsers = $this->syncSubmissionAssignments($submission, $assigneeIds->all(), $request->user());
        app(\App\Services\AuditLogService::class)->logModelCreated('submission_created', $submission);
        $this->notifyAssignedUsers($submission, $newlyAssignedUsers, $request->user());

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
            'assignments.assignee:id,name,email',
            'assignments.assigner:id,name,email',
            'score',
            'sectionScores.section',
        ]);

        $progress = $this->submissionProgress($complianceSubmission);

        return Inertia::render('submissions/show', [
            'submission' => $complianceSubmission,
            'meta' => [
                'completionPercentage' => $progress['completionPercentage'],
                'answeredCount' => $progress['answeredCount'],
                'totalQuestions' => $progress['totalQuestions'],
                'isComplete' => $progress['isComplete'],
            ],
            'abilities' => $this->submissionAbilities(request()->user(), $complianceSubmission, $progress),
        ]);
    }

    public function update(ComplianceSubmissionRequest $request, ComplianceSubmission $complianceSubmission): RedirectResponse
    {
        $this->authorize('update', $complianceSubmission);
        $validated = $request->validated();
        $syncAssignments = array_key_exists('assigned_to_user_ids', $validated);
        $assigneeIds = collect($validated['assigned_to_user_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($validated['assigned_to_user_ids'], $validated['tenant_id']);

        abort_if($syncAssignments && $assigneeIds->isNotEmpty() && ! $this->assigneesBelongToTenant($assigneeIds->all(), $complianceSubmission->tenant_id), 422, 'Selected assignees must belong to the submission tenant.');

        $oldValues = [
            ...$complianceSubmission->toArray(),
            'assigned_to_user_ids' => $complianceSubmission->assignments()->pluck('assigned_to_user_id')->all(),
        ];
        $complianceSubmission->update($validated);
        $newlyAssignedUsers = collect();
        if ($syncAssignments) {
            $newlyAssignedUsers = $this->syncSubmissionAssignments($complianceSubmission, $assigneeIds->all(), $request->user());
        }
        app(\App\Services\AuditLogService::class)->logModelUpdated('submission_updated', $complianceSubmission, $oldValues);
        $this->notifyAssignedUsers($complianceSubmission, $newlyAssignedUsers, $request->user());

        return back()->with('success', 'Submission updated.');
    }

    public function saveResponses(ComplianceResponseRequest $request, ComplianceSubmission $complianceSubmission): RedirectResponse
    {
        $this->authorize('respond', $complianceSubmission);

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
        $submittedBy = request()->user();

        try {
            $complianceSubmission->update([
                'status' => 'submitted',
                'submitted_by' => $submittedBy?->id,
                'submitted_at' => now(),
            ]);

            $complianceSubmission->loadMissing([
                'tenant',
                'framework',
                'assignments.assigner',
            ]);

            $this->complianceScoringService->scoreSubmission($complianceSubmission->fresh(), $submittedBy?->id);
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

            $this->notifySubmissionAssignersOfSubmittedReview($complianceSubmission, $submittedBy);
        } catch (\Throwable $e) {
            Log::error('Compliance submission failed', [
                'submission_id' => $complianceSubmission->id,
                'user_id' => $submittedBy?->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to submit. Please try again.');
        }

        return back()->with('success', 'Submission sent for review.');
    }

    public function recalculate(ComplianceSubmission $complianceSubmission): RedirectResponse
    {
        $this->authorize('update', $complianceSubmission);

        $complianceSubmission->loadMissing([
            'framework.sections.questions',
            'responses',
        ]);

        $progress = $this->submissionProgress($complianceSubmission);

        if (! $progress['isComplete']) {
            return back()->with('error', 'Recalculation is only available after every assessment question has been answered.');
        }

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

    protected function scopeVisibleSubmissions(Builder $query, ?User $user): void
    {
        if (! $user || $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS)) {
            return;
        }

        if ($user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS)) {
            $query->whereHas('assignments', function (Builder $assignmentQuery) use ($user) {
                $assignmentQuery
                    ->where('assigned_to_user_id', $user->id)
                    ->whereHas('assigner', fn (Builder $assignerQuery) => $assignerQuery->role(['company_admin', 'super_admin']));
            });
        }
    }

    protected function submissionStats(?User $user): array
    {
        $query = ComplianceSubmission::query();
        $this->scopeVisibleSubmissions($query, $user);

        return [
            'total' => (clone $query)->count(),
            'submitted' => (clone $query)->where('status', 'submitted')->count(),
            'inReview' => (clone $query)->where('status', 'in_review')->count(),
            'scored' => (clone $query)->where('status', 'scored')->count(),
        ];
    }

    protected function availableSubmissionAssignees(Request $request)
    {
        $currentUserId = $request->user()?->id;

        return User::query()
            ->select(['id', 'tenant_id', 'name', 'email', 'status'])
            ->with('roles:id,name')
            ->where('status', UserStatus::Active)
            ->whereHas('roles', fn (Builder $query) => $query->whereIn('name', ['employee', 'company_admin']))
            ->when(! $request->user()?->isSuperAdmin(), fn (Builder $query) => $query->where('tenant_id', $request->user()?->tenant_id))
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'tenant_id' => $user->tenant_id,
                'name' => $user->name,
                'email' => $user->email,
                'role_label' => $user->hasRole('company_admin') ? 'Company Admin' : 'Employee',
                'is_current_user' => $user->id === $currentUserId,
            ])
            ->values();
    }

    protected function submissionTenantId(ComplianceSubmissionRequest $request): int
    {
        if ($request->user()?->isSuperAdmin() && $request->filled('tenant_id')) {
            return $request->integer('tenant_id');
        }

        return (int) $request->user()?->tenant_id;
    }

    protected function assigneesBelongToTenant(array $assigneeIds, int $tenantId): bool
    {
        if ($assigneeIds === []) {
            return true;
        }

        return User::query()
            ->whereIn('id', $assigneeIds)
            ->where('tenant_id', $tenantId)
            ->count() === count($assigneeIds);
    }

    protected function syncSubmissionAssignments(ComplianceSubmission $submission, array $assigneeIds, ?User $assigner)
    {
        $currentIds = $submission->assignments()->pluck('assigned_to_user_id')->all();
        $removeIds = array_diff($currentIds, $assigneeIds);
        $newIds = array_values(array_diff($assigneeIds, $currentIds));

        if ($removeIds !== []) {
            $submission->assignments()->whereIn('assigned_to_user_id', $removeIds)->delete();
        }

        foreach ($assigneeIds as $assigneeId) {
            ComplianceSubmissionAssignment::query()->updateOrCreate(
                [
                    'compliance_submission_id' => $submission->id,
                    'assigned_to_user_id' => $assigneeId,
                ],
                [
                    'tenant_id' => $submission->tenant_id,
                    'assigned_by' => $assigner?->id,
                    'assigned_at' => now(),
                ],
            );
        }

        return User::query()
            ->whereIn('id', $newIds)
            ->get();
    }

    protected function notifyAssignedUsers(ComplianceSubmission $submission, $users, ?User $assigner): void
    {
        foreach ($users as $user) {
            app(AppNotificationService::class)->sendToUser(
                $user,
                'submission_assigned',
                'A submission was assigned to you',
                sprintf('%s assigned "%s" to you.', $assigner?->name ?: 'A manager', $submission->title),
                route('submissions.show', $submission, false),
                [
                    'submission_id' => $submission->id,
                    'framework_id' => $submission->compliance_framework_id,
                    'assigned_by' => $assigner?->id,
                ]
            );

            try {
                $user->notify(new SubmissionAssignedNotification($submission->loadMissing(['tenant', 'framework']), $assigner));
            } catch (\Throwable $exception) {
                Log::error('Submission assignment email queue dispatch failed.', [
                    'submission_id' => $submission->id,
                    'tenant_id' => $submission->tenant_id,
                    'assigned_to_user_id' => $user->id,
                    'email' => $user->email,
                    'queue' => 'mail',
                    'assigned_by' => $assigner?->id,
                    'message' => $exception->getMessage(),
                ]);

                report($exception);
            }
        }
    }

    protected function notifySubmissionAssignersOfSubmittedReview(ComplianceSubmission $submission, ?User $submittedBy): void
    {
        if (! $submittedBy) {
            return;
        }

        $assignments = $submission->relationLoaded('assignments')
            ? $submission->assignments
            : $submission->assignments()->with('assigner:id,name,email')->get();

        $assigners = $assignments
            ->filter(fn (ComplianceSubmissionAssignment $assignment) => (int) $assignment->assigned_to_user_id === (int) $submittedBy->id)
            ->map(fn (ComplianceSubmissionAssignment $assignment) => $assignment->assigner)
            ->filter()
            ->unique('id')
            ->values();

        foreach ($assigners as $assigner) {
            try {
                $assigner->notify(new SubmissionSubmittedForReviewNotification(
                    $submission->loadMissing(['tenant', 'framework']),
                    $submittedBy,
                ));
            } catch (\Throwable $exception) {
                Log::error('Submission review email queue dispatch failed.', [
                    'submission_id' => $submission->id,
                    'tenant_id' => $submission->tenant_id,
                    'submitted_by' => $submittedBy->id,
                    'assigner_id' => $assigner->id,
                    'email' => $assigner->email,
                    'queue' => 'mail',
                    'message' => $exception->getMessage(),
                ]);

                report($exception);
            }
        }
    }

    protected function submissionIndexItem(ComplianceSubmission $submission, ?User $user): array
    {
        $progress = $this->submissionProgress($submission);
        $abilities = $this->submissionAbilities($user, $submission, $progress);

        return [
            'id' => $submission->id,
            'title' => $submission->title,
            'status' => $submission->status->value,
            'reporting_period' => $submission->reporting_period,
            'framework' => $submission->framework ? [
                'id' => $submission->framework->id,
                'name' => $submission->framework->name,
            ] : null,
            'score' => $submission->score ? [
                'overall_score' => $submission->score->overall_score,
            ] : null,
            'tenant' => $submission->tenant ? [
                'id' => $submission->tenant->id,
                'name' => $submission->tenant->name,
            ] : null,
            'can_respond' => $abilities['canRespond'],
            'can_recalculate' => $abilities['canRecalculate'],
            'is_assigned_to_current_user' => $abilities['isAssignedToCurrentUser'],
            'completion_percentage' => $progress['completionPercentage'],
            'answered_questions_count' => $progress['answeredCount'],
            'total_questions_count' => $progress['totalQuestions'],
        ];
    }

    protected function submissionProgress(ComplianceSubmission $submission): array
    {
        $responses = $submission->responses instanceof Collection
            ? $submission->responses->keyBy('compliance_question_id')
            : $submission->responses()->get()->keyBy('compliance_question_id');
        $questions = $submission->framework?->sections?->flatMap->questions ?? collect();
        $answeredCount = $questions
            ->filter(fn ($question) => filled(optional($responses->get($question->id))->answer_value) || filled(optional($responses->get($question->id))->answer_text))
            ->count();
        $totalQuestions = $questions->count();
        $completionPercentage = $totalQuestions > 0 ? (int) round(($answeredCount / $totalQuestions) * 100) : 0;

        return [
            'completionPercentage' => $completionPercentage,
            'answeredCount' => $answeredCount,
            'totalQuestions' => $totalQuestions,
            'isComplete' => $totalQuestions > 0 && $answeredCount === $totalQuestions,
        ];
    }

    protected function submissionAbilities(?User $user, ComplianceSubmission $submission, ?array $progress = null): array
    {
        $progress ??= $this->submissionProgress($submission);
        $canManage = (bool) $user?->can('update', $submission);
        $assignments = $submission->relationLoaded('assignments')
            ? $submission->assignments
            : $submission->assignments()->get(['assigned_to_user_id']);

        return [
            'canRespond' => (bool) $user?->can('respond', $submission),
            'canSubmit' => $canManage && $submission->status === ComplianceSubmissionStatus::Draft,
            'canRecalculate' => $canManage && $progress['isComplete'],
            'isAssignedToCurrentUser' => $user !== null
                && $assignments->contains('assigned_to_user_id', $user->id),
        ];
    }
}
