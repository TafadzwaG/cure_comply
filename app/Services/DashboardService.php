<?php

namespace App\Services;

use App\Enums\ComplianceRating;
use App\Enums\ComplianceResponseStatus;
use App\Enums\ComplianceSubmissionStatus;
use App\Enums\CourseAssignmentStatus;
use App\Enums\EvidenceReviewStatus;
use App\Enums\TenantStatus;
use App\Enums\TestAttemptResultStatus;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\ComplianceResponse;
use App\Models\ComplianceScore;
use App\Models\ComplianceSubmission;
use App\Models\CourseAssignment;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\EvidenceFile;
use App\Models\EvidenceReview;
use App\Models\Invitation;
use App\Models\LessonProgress;
use App\Models\Tenant;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class DashboardService
{
    public function for(User $user): array
    {
        if ($user->isSuperAdmin()) {
            $data = $this->forSuperAdmin();
        } elseif ($user->hasRole('company_admin')) {
            $data = $this->forCompanyAdmin($user);
        } elseif ($user->hasRole('reviewer')) {
            $data = $this->forReviewer($user);
        } else {
            $data = $this->forEmployee($user);
        }

        $data['pendingItems'] = $this->pendingItems($user);

        return $data;
    }

    public function pendingItems(User $user): array
    {
        $items = collect();
        $tenantId = $user->tenant_id;

        if ($user->isSuperAdmin()) {
            $items = $items->concat(
                Tenant::query()
                    ->where('status', TenantStatus::Pending)
                    ->limit(10)
                    ->get()
                    ->map(fn (Tenant $tenant) => [
                        'type' => 'tenant_approval',
                        'id' => $tenant->id,
                        'title' => $tenant->name,
                        'description' => 'Pending tenant activation',
                        'status' => 'pending',
                        'priority' => 'high',
                        'href' => "/tenants/{$tenant->id}",
                        'due_date' => null,
                        'created_at' => optional($tenant->created_at)?->diffForHumans(),
                    ])
            );
            $items = $items->concat(
                ComplianceSubmission::query()
                    ->whereIn('status', [ComplianceSubmissionStatus::Submitted, ComplianceSubmissionStatus::InReview])
                    ->with('framework:id,name')
                    ->limit(10)
                    ->get()
                    ->map(fn (ComplianceSubmission $s) => [
                        'type' => 'compliance_submission',
                        'id' => $s->id,
                        'title' => $s->title,
                        'description' => ($s->framework?->name ?? 'Framework') . ' — ' . $this->enumValue($s->status),
                        'status' => $this->enumValue($s->status),
                        'priority' => 'medium',
                        'href' => "/submissions/{$s->id}",
                        'due_date' => null,
                        'created_at' => optional($s->submitted_at ?? $s->created_at)?->diffForHumans(),
                    ])
            );
        }

        if (! $user->isSuperAdmin() && $tenantId) {
            // Course assignments pending/overdue
            $items = $items->concat(
                CourseAssignment::query()
                    ->where('tenant_id', $tenantId)
                    ->when(! $user->hasRole('company_admin'), fn (Builder $q) => $q->where('assigned_to_user_id', $user->id))
                    ->whereIn('status', [CourseAssignmentStatus::Assigned, CourseAssignmentStatus::InProgress])
                    ->with(['course:id,title', 'assignedTo:id,name'])
                    ->orderBy('due_date')
                    ->limit(10)
                    ->get()
                    ->map(fn (CourseAssignment $a) => [
                        'type' => 'course_assignment',
                        'id' => $a->id,
                        'title' => $a->course?->title ?? 'Course assignment',
                        'description' => $user->hasRole('company_admin')
                            ? 'Assigned to ' . ($a->assignedTo?->name ?? 'unassigned')
                            : ($a->due_date?->isPast() ? 'Overdue' : 'Due ' . optional($a->due_date)?->format('D, j M')),
                        'status' => $this->enumValue($a->status),
                        'priority' => ($a->due_date && $a->due_date->isPast()) ? 'high' : 'medium',
                        'href' => "/assignments/{$a->id}",
                        'due_date' => $a->due_date?->toDateString(),
                        'created_at' => optional($a->assigned_at ?? $a->created_at)?->diffForHumans(),
                    ])
            );

            // Compliance submissions in draft/submitted/in-review
            $items = $items->concat(
                ComplianceSubmission::query()
                    ->where('tenant_id', $tenantId)
                    ->whereIn('status', [ComplianceSubmissionStatus::Draft, ComplianceSubmissionStatus::Submitted, ComplianceSubmissionStatus::InReview])
                    ->with('framework:id,name')
                    ->limit(10)
                    ->get()
                    ->map(fn (ComplianceSubmission $s) => [
                        'type' => 'compliance_submission',
                        'id' => $s->id,
                        'title' => $s->title,
                        'description' => ($s->framework?->name ?? 'Framework') . ' — ' . $this->enumValue($s->status),
                        'status' => $this->enumValue($s->status),
                        'priority' => $s->status === ComplianceSubmissionStatus::Draft ? 'medium' : 'high',
                        'href' => "/submissions/{$s->id}",
                        'due_date' => null,
                        'created_at' => optional($s->submitted_at ?? $s->created_at)?->diffForHumans(),
                    ])
            );

            // Evidence files awaiting review (for reviewers and company admins)
            if ($user->hasRole('reviewer') || $user->hasRole('company_admin')) {
                $items = $items->concat(
                    EvidenceFile::query()
                        ->where('tenant_id', $tenantId)
                        ->where('review_status', EvidenceReviewStatus::Pending)
                        ->with('response.question:id,question_text')
                        ->orderBy('uploaded_at')
                        ->limit(10)
                        ->get()
                        ->map(fn (EvidenceFile $f) => [
                            'type' => 'evidence_review',
                            'id' => $f->id,
                            'title' => $f->original_name,
                            'description' => $f->response?->question?->question_text ?? 'Evidence awaiting review',
                            'status' => 'pending',
                            'priority' => ($f->uploaded_at && $f->uploaded_at->diffInDays(now()) > 3) ? 'high' : 'medium',
                            'href' => "/evidence",
                            'due_date' => null,
                            'created_at' => optional($f->uploaded_at)?->diffForHumans(),
                        ])
                );
            }
        }

        return $items->take(15)->values()->all();
    }

    public function pendingFrameworks(User $user): array
    {
        $tenantId = $user->tenant_id;

        if (! $tenantId) {
            return [];
        }

        return ComplianceSubmission::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('status', [
                ComplianceSubmissionStatus::Draft,
                ComplianceSubmissionStatus::Submitted,
                ComplianceSubmissionStatus::InReview,
            ])
            ->with('framework:id,name,version')
            ->get()
            ->groupBy('compliance_framework_id')
            ->map(function ($submissions, $frameworkId) {
                $framework = $submissions->first()->framework;

                return [
                    'id' => (int) $frameworkId,
                    'name' => $framework?->name ?? 'Framework',
                    'version' => $framework?->version,
                    'pending_count' => $submissions->count(),
                    'submissions' => $submissions->map(fn (ComplianceSubmission $s) => [
                        'id' => $s->id,
                        'title' => $s->title,
                        'status' => $s->status->value,
                        'href' => "/submissions/{$s->id}",
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();
    }

    public function forSuperAdmin(): array
    {
        $tenantCount = Tenant::query()->count();
        $activeTenants = Tenant::query()->where('status', TenantStatus::Active)->count();
        $pendingTenants = Tenant::query()->where('status', TenantStatus::Pending)->count();
        $suspendedTenants = Tenant::query()->where('status', TenantStatus::Suspended)->count();
        $activeUsers = User::query()->where('status', UserStatus::Active)->count();
        $openSubmissions = ComplianceSubmission::query()
            ->whereIn('status', [ComplianceSubmissionStatus::Submitted, ComplianceSubmissionStatus::InReview])
            ->count();
        $pendingEvidence = EvidenceFile::query()->where('review_status', EvidenceReviewStatus::Pending)->count();
        $approvedEvidence = EvidenceFile::query()->where('review_status', EvidenceReviewStatus::Approved)->count();
        $rejectedEvidence = EvidenceFile::query()->where('review_status', EvidenceReviewStatus::Rejected)->count();
        $averageComplianceScore = round((float) ComplianceScore::query()->avg('overall_score'), 1);
        $greenScores = ComplianceScore::query()->where('rating', ComplianceRating::Green)->count();
        $amberScores = ComplianceScore::query()->where('rating', ComplianceRating::Amber)->count();
        $redScores = ComplianceScore::query()->where('rating', ComplianceRating::Red)->count();
        $scoredSubmissions = max(1, ComplianceScore::query()->count());

        $monthlyTrend = collect(range(5, 0))
            ->map(function (int $monthsAgo) {
                $month = now()->startOfMonth()->subMonths($monthsAgo);
                $nextMonth = $month->copy()->addMonth();

                return [
                    'label' => $month->format('M'),
                    'tenants' => Tenant::query()->whereBetween('created_at', [$month, $nextMonth])->count(),
                    'users' => User::query()->whereBetween('created_at', [$month, $nextMonth])->count(),
                    'submissions' => ComplianceSubmission::query()->whereBetween('created_at', [$month, $nextMonth])->count(),
                ];
            })
            ->values();

        $topTenants = Tenant::query()
            ->withCount([
                'users',
                'submissions',
                'submissions as open_submissions_count' => fn (Builder $query) => $query->whereIn('status', [
                    ComplianceSubmissionStatus::Submitted,
                    ComplianceSubmissionStatus::InReview,
                ]),
            ])
            ->orderByDesc('submissions_count')
            ->limit(6)
            ->get()
            ->map(function (Tenant $tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'status' => $tenant->status->value,
                    'industry' => $tenant->industry,
                    'users_count' => $tenant->users_count,
                    'submissions_count' => $tenant->submissions_count,
                    'open_submissions_count' => $tenant->open_submissions_count,
                    'pending_evidence_count' => EvidenceFile::query()
                        ->where('tenant_id', $tenant->id)
                        ->where('review_status', EvidenceReviewStatus::Pending)
                        ->count(),
                    'average_score' => round((float) ComplianceScore::query()
                        ->where('tenant_id', $tenant->id)
                        ->avg('overall_score'), 1),
                ];
            })
            ->values();

        return [
            'stats' => [
                'tenantCount' => $tenantCount,
                'activeTenants' => $activeTenants,
                'pendingTenants' => $pendingTenants,
                'suspendedTenants' => $suspendedTenants,
                'activeUsers' => $activeUsers,
                'openSubmissions' => $openSubmissions,
                'pendingEvidence' => $pendingEvidence,
                'averageComplianceScore' => $averageComplianceScore,
                'greenRate' => round(($greenScores / $scoredSubmissions) * 100, 1),
            ],
            'tenantStatusBreakdown' => [
                ['label' => 'Active', 'value' => $activeTenants],
                ['label' => 'Pending', 'value' => $pendingTenants],
                ['label' => 'Suspended', 'value' => $suspendedTenants],
                ['label' => 'Inactive', 'value' => Tenant::query()->where('status', TenantStatus::Inactive)->count()],
            ],
            'userRoleBreakdown' => [
                ['label' => 'Super Admin', 'value' => User::role('super_admin')->count()],
                ['label' => 'Company Admin', 'value' => User::role('company_admin')->count()],
                ['label' => 'Employee', 'value' => User::role('employee')->count()],
                ['label' => 'Reviewer', 'value' => User::role('reviewer')->count()],
            ],
            'submissionStatusBreakdown' => [
                ['label' => 'Draft', 'value' => ComplianceSubmission::query()->where('status', ComplianceSubmissionStatus::Draft)->count()],
                ['label' => 'Submitted', 'value' => ComplianceSubmission::query()->where('status', ComplianceSubmissionStatus::Submitted)->count()],
                ['label' => 'In Review', 'value' => ComplianceSubmission::query()->where('status', ComplianceSubmissionStatus::InReview)->count()],
                ['label' => 'Scored', 'value' => ComplianceSubmission::query()->where('status', ComplianceSubmissionStatus::Scored)->count()],
                ['label' => 'Closed', 'value' => ComplianceSubmission::query()->where('status', ComplianceSubmissionStatus::Closed)->count()],
            ],
            'evidenceStatusBreakdown' => [
                ['label' => 'Pending', 'value' => $pendingEvidence],
                ['label' => 'Approved', 'value' => $approvedEvidence],
                ['label' => 'Rejected', 'value' => $rejectedEvidence],
            ],
            'scoreDistribution' => [
                ['label' => 'Green', 'value' => $greenScores],
                ['label' => 'Amber', 'value' => $amberScores],
                ['label' => 'Red', 'value' => $redScores],
            ],
            'monthlyTrend' => $monthlyTrend,
            'topTenants' => $topTenants,
            'recentActivity' => $this->recentActivity(),
            'attentionItems' => $this->attentionItems(
                pendingTenants: $pendingTenants,
                openSubmissions: $openSubmissions,
                pendingEvidence: $pendingEvidence,
                rejectedEvidence: $rejectedEvidence,
                averageComplianceScore: $averageComplianceScore,
            ),
        ];
    }

    public function forCompanyAdmin(User $user): array
    {
        $tenantId = $user->tenant_id;
        $latestScore = ComplianceScore::query()
            ->where('tenant_id', $tenantId)
            ->latest('calculated_at')
            ->first();

        $assignmentQuery = CourseAssignment::query()->where('tenant_id', $tenantId);
        $submissionQuery = ComplianceSubmission::query()->where('tenant_id', $tenantId);
        $evidenceQuery = EvidenceFile::query()->where('tenant_id', $tenantId);
        $testAttemptQuery = TestAttempt::query()->where('tenant_id', $tenantId);
        $employeeQuery = User::query()->where('tenant_id', $tenantId);

        $totalAssignments = (clone $assignmentQuery)->count();
        $completedAssignments = (clone $assignmentQuery)->where('status', CourseAssignmentStatus::Completed)->count();
        $overdueAssignments = (clone $assignmentQuery)
            ->whereDate('due_date', '<', today())
            ->where('status', '!=', CourseAssignmentStatus::Completed)
            ->count();

        $latestScoredSubmission = ComplianceSubmission::query()
            ->where('tenant_id', $tenantId)
            ->with(['sectionScores.section'])
            ->whereHas('score')
            ->latest('submitted_at')
            ->first();

        // KPI: average evidence review time (seconds) across the whole tenant
        $avgReviewSeconds = $this->averageEvidenceReviewSeconds($tenantId);

        $pendingEvidenceCount = (clone $evidenceQuery)->where('review_status', EvidenceReviewStatus::Pending)->count();
        $totalEvidenceCount = (clone $evidenceQuery)->count();

        $reviewedLast30 = (int) DB::table('evidence_reviews')
            ->join('evidence_files', 'evidence_files.id', '=', 'evidence_reviews.evidence_file_id')
            ->where('evidence_files.tenant_id', $tenantId)
            ->where('evidence_reviews.reviewed_at', '>=', now()->subDays(30))
            ->count();

        return [
            'hero' => [
                'score' => round((float) ($latestScore?->overall_score ?? 0), 1),
                'rating' => $latestScore?->rating?->value ?? 'Awaiting score',
                'activeSubmissions' => (clone $submissionQuery)
                    ->whereIn('status', [ComplianceSubmissionStatus::Submitted, ComplianceSubmissionStatus::InReview])
                    ->count(),
                'pendingEvidence' => $pendingEvidenceCount,
                'overdueTraining' => $overdueAssignments,
            ],
            'kpis' => [
                'compliance' => [
                    'score' => round((float) ($latestScore?->overall_score ?? 0), 1),
                    'rating' => $latestScore?->rating?->value ?? 'Awaiting score',
                    'updated_at' => optional($latestScore?->calculated_at)->diffForHumans(),
                ],
                'overdueAssignments' => [
                    'count' => $overdueAssignments,
                    'total' => $totalAssignments,
                    'percentage' => $this->percentage($overdueAssignments, max(1, $totalAssignments)),
                ],
                'evidenceBacklog' => [
                    'pending' => $pendingEvidenceCount,
                    'total' => $totalEvidenceCount,
                    'percentage' => $this->percentage($pendingEvidenceCount, max(1, $totalEvidenceCount)),
                    'reviewed_last_30_days' => $reviewedLast30,
                ],
                'avgReviewTime' => [
                    'seconds' => (int) round($avgReviewSeconds),
                    'hours' => round($avgReviewSeconds / 3600, 1),
                    'human' => $avgReviewSeconds > 0
                        ? ($avgReviewSeconds >= 3600
                            ? round($avgReviewSeconds / 3600, 1).' h'
                            : max(1, (int) round($avgReviewSeconds / 60)).' m')
                        : '—',
                ],
            ],
            'stats' => [
                'employees' => $employeeQuery->count(),
                'activeAssignments' => (clone $assignmentQuery)
                    ->whereIn('status', [CourseAssignmentStatus::Assigned, CourseAssignmentStatus::InProgress])
                    ->count(),
                'courseCompletionRate' => $this->percentage($completedAssignments, $totalAssignments),
                'averageTestScore' => round((float) ((clone $testAttemptQuery)->avg('percentage') ?? 0), 1),
                'activeSubmissions' => (clone $submissionQuery)
                    ->whereIn('status', [ComplianceSubmissionStatus::Submitted, ComplianceSubmissionStatus::InReview])
                    ->count(),
                'pendingEvidence' => (clone $evidenceQuery)->where('review_status', EvidenceReviewStatus::Pending)->count(),
            ],
            'employeeStatusBreakdown' => [
                ['label' => 'Active', 'value' => User::query()->where('tenant_id', $tenantId)->where('status', UserStatus::Active)->count()],
                ['label' => 'Invited', 'value' => User::query()->where('tenant_id', $tenantId)->where('status', UserStatus::Invited)->count()],
                ['label' => 'Inactive', 'value' => User::query()->where('tenant_id', $tenantId)->where('status', UserStatus::Inactive)->count()],
            ],
            'submissionStatusBreakdown' => [
                ['label' => 'Draft', 'value' => ComplianceSubmission::query()->where('tenant_id', $tenantId)->where('status', ComplianceSubmissionStatus::Draft)->count()],
                ['label' => 'Submitted', 'value' => ComplianceSubmission::query()->where('tenant_id', $tenantId)->where('status', ComplianceSubmissionStatus::Submitted)->count()],
                ['label' => 'In Review', 'value' => ComplianceSubmission::query()->where('tenant_id', $tenantId)->where('status', ComplianceSubmissionStatus::InReview)->count()],
                ['label' => 'Scored', 'value' => ComplianceSubmission::query()->where('tenant_id', $tenantId)->where('status', ComplianceSubmissionStatus::Scored)->count()],
                ['label' => 'Closed', 'value' => ComplianceSubmission::query()->where('tenant_id', $tenantId)->where('status', ComplianceSubmissionStatus::Closed)->count()],
            ],
            'sectionScores' => $latestScoredSubmission?->sectionScores
                ->sortBy('section.sort_order')
                ->map(fn ($score) => [
                    'label' => $score->section?->name ?? 'Section',
                    'value' => round((float) $score->score, 1),
                ])
                ->values()
                ->all() ?? [],
            'monthlyTrend' => $this->monthlyTrend(5, function (Carbon $start, Carbon $end) use ($tenantId) {
                return [
                    'label' => $start->format('M'),
                    'primary' => CourseAssignment::query()
                        ->where('tenant_id', $tenantId)
                        ->where('status', CourseAssignmentStatus::Completed)
                        ->whereBetween('updated_at', [$start, $end])
                        ->count(),
                    'secondary' => TestAttempt::query()
                        ->where('tenant_id', $tenantId)
                        ->whereBetween('submitted_at', [$start, $end])
                        ->count(),
                    'tertiary' => ComplianceSubmission::query()
                        ->where('tenant_id', $tenantId)
                        ->whereBetween('created_at', [$start, $end])
                        ->count(),
                ];
            }),
            'latestSubmissions' => ComplianceSubmission::query()
                ->where('tenant_id', $tenantId)
                ->with(['framework:id,name', 'score'])
                ->latest('created_at')
                ->limit(6)
                ->get()
                ->map(fn (ComplianceSubmission $submission) => [
                    'id' => $submission->id,
                    'title' => $submission->title,
                    'framework' => $submission->framework?->name,
                    'status' => $this->enumValue($submission->status),
                    'score' => round((float) ($submission->score?->overall_score ?? 0), 1),
                    'submitted_at' => optional($submission->submitted_at ?? $submission->created_at)?->diffForHumans(),
                ])
                ->values()
                ->all(),
            'recentTestOutcomes' => TestAttempt::query()
                ->where('tenant_id', $tenantId)
                ->with(['user:id,name', 'test:id,title'])
                ->latest('submitted_at')
                ->limit(6)
                ->get()
                ->map(fn (TestAttempt $attempt) => [
                    'id' => $attempt->id,
                    'employee' => $attempt->user?->name ?? 'Unknown user',
                    'test' => $attempt->test?->title ?? 'Assessment',
                    'percentage' => round((float) $attempt->percentage, 1),
                    'result_status' => $this->enumValue($attempt->result_status),
                    'submitted_at' => optional($attempt->submitted_at)?->diffForHumans(),
                ])
                ->values()
                ->all(),
            'departmentHealth' => $this->departmentHealth($tenantId),
            'peopleSnapshot' => $this->peopleSnapshot($tenantId),
            'operations' => [
                'pendingInvitations' => Invitation::query()
                    ->where('tenant_id', $tenantId)
                    ->whereNull('accepted_at')
                    ->count(),
                'upcomingDeadlines' => CourseAssignment::query()
                    ->where('tenant_id', $tenantId)
                    ->with(['assignedTo:id,name', 'course:id,title'])
                    ->whereDate('due_date', '>=', today())
                    ->orderBy('due_date')
                    ->limit(6)
                    ->get()
                    ->map(fn (CourseAssignment $assignment) => [
                        'id' => $assignment->id,
                        'title' => $assignment->course?->title ?? 'Course assignment',
                        'owner' => $assignment->assignedTo?->name ?? 'Unassigned',
                        'status' => $this->enumValue($assignment->status),
                        'due_date' => optional($assignment->due_date)?->format('D, j M'),
                    ])
                    ->values()
                    ->all(),
            ],
            'recentActivity' => $this->tenantActivity($tenantId, limit: 6),
        ];
    }

    public function forReviewer(User $user): array
    {
        $tenantId = $user->tenant_id;
        $today = now()->startOfDay();

        $reviewedTodayQuery = EvidenceReview::query()
            ->where('reviewer_id', $user->id)
            ->whereDate('reviewed_at', $today);

        $reviewsForTurnaround = EvidenceReview::query()
            ->where('reviewer_id', $user->id)
            ->with('evidenceFile:id,uploaded_at')
            ->latest('reviewed_at')
            ->limit(25)
            ->get();

        $averageTurnaroundHours = round((float) ($reviewsForTurnaround
            ->filter(fn (EvidenceReview $review) => $review->reviewed_at && $review->evidenceFile?->uploaded_at)
            ->avg(fn (EvidenceReview $review) => $review->reviewed_at->diffInHours($review->evidenceFile->uploaded_at)) ?? 0), 1);

        return [
            'hero' => [
                'pendingEvidence' => EvidenceFile::query()->where('tenant_id', $tenantId)->where('review_status', EvidenceReviewStatus::Pending)->count(),
                'submissionsInReview' => ComplianceSubmission::query()
                    ->where('tenant_id', $tenantId)
                    ->where('status', ComplianceSubmissionStatus::InReview)
                    ->count(),
                'reviewsCompletedToday' => $reviewedTodayQuery->count(),
                'rejectedRate' => $this->percentage(
                    EvidenceFile::query()->where('tenant_id', $tenantId)->where('review_status', EvidenceReviewStatus::Rejected)->count(),
                    EvidenceFile::query()->where('tenant_id', $tenantId)->count()
                ),
            ],
            'stats' => [
                'pendingEvidence' => EvidenceFile::query()->where('tenant_id', $tenantId)->where('review_status', EvidenceReviewStatus::Pending)->count(),
                'approvedToday' => EvidenceReview::query()
                    ->where('reviewer_id', $user->id)
                    ->where('review_status', EvidenceReviewStatus::Approved)
                    ->whereDate('reviewed_at', $today)
                    ->count(),
                'rejectedToday' => EvidenceReview::query()
                    ->where('reviewer_id', $user->id)
                    ->where('review_status', EvidenceReviewStatus::Rejected)
                    ->whereDate('reviewed_at', $today)
                    ->count(),
                'flaggedResponses' => ComplianceResponse::query()
                    ->where('tenant_id', $tenantId)
                    ->where('status', ComplianceResponseStatus::Flagged)
                    ->count(),
                'submissionsInReview' => ComplianceSubmission::query()
                    ->where('tenant_id', $tenantId)
                    ->where('status', ComplianceSubmissionStatus::InReview)
                    ->count(),
                'averageTurnaroundHours' => $averageTurnaroundHours,
            ],
            'weeklyTrend' => collect(range(5, 0))
                ->map(function (int $weeksAgo) use ($tenantId) {
                    $start = now()->startOfWeek()->subWeeks($weeksAgo);
                    $end = $start->copy()->endOfWeek();

                    return [
                        'label' => $start->format('d M'),
                        'primary' => EvidenceReview::query()
                            ->whereBetween('reviewed_at', [$start, $end])
                            ->where('review_status', EvidenceReviewStatus::Approved)
                            ->count(),
                        'secondary' => EvidenceReview::query()
                            ->whereBetween('reviewed_at', [$start, $end])
                            ->where('review_status', EvidenceReviewStatus::Rejected)
                            ->count(),
                        'tertiary' => EvidenceFile::query()
                            ->where('tenant_id', $tenantId)
                            ->where('review_status', EvidenceReviewStatus::Pending)
                            ->whereBetween('created_at', [$start, $end])
                            ->count(),
                    ];
                })
                ->values()
                ->all(),
            'evidenceStatusBreakdown' => [
                ['label' => 'Pending', 'value' => EvidenceFile::query()->where('tenant_id', $tenantId)->where('review_status', EvidenceReviewStatus::Pending)->count()],
                ['label' => 'Approved', 'value' => EvidenceFile::query()->where('tenant_id', $tenantId)->where('review_status', EvidenceReviewStatus::Approved)->count()],
                ['label' => 'Rejected', 'value' => EvidenceFile::query()->where('tenant_id', $tenantId)->where('review_status', EvidenceReviewStatus::Rejected)->count()],
            ],
            'reviewQueue' => EvidenceFile::query()
                ->where('tenant_id', $tenantId)
                ->where('review_status', EvidenceReviewStatus::Pending)
                ->with(['response.question.section.framework:id,name', 'uploader:id,name'])
                ->orderBy('uploaded_at')
                ->limit(7)
                ->get()
                ->map(fn (EvidenceFile $file) => [
                    'id' => $file->id,
                    'file' => $file->original_name,
                    'framework' => $file->response?->question?->section?->framework?->name ?? 'Framework',
                    'question' => $file->response?->question?->question_text ?? 'Evidence item',
                    'uploader' => $file->uploader?->name ?? 'Unknown user',
                    'waiting' => optional($file->uploaded_at)?->diffForHumans(),
                ])
                ->values()
                ->all(),
            'recentDecisions' => EvidenceReview::query()
                ->where('reviewer_id', $user->id)
                ->with(['evidenceFile.response.question.section.framework:id,name'])
                ->latest('reviewed_at')
                ->limit(6)
                ->get()
                ->map(fn (EvidenceReview $review) => [
                    'id' => $review->id,
                    'framework' => $review->evidenceFile?->response?->question?->section?->framework?->name ?? 'Framework',
                    'question' => $review->evidenceFile?->response?->question?->question_text ?? 'Evidence review',
                    'review_status' => $this->enumValue($review->review_status),
                    'comment' => $review->review_comment,
                    'reviewed_at' => optional($review->reviewed_at)?->diffForHumans(),
                ])
                ->values()
                ->all(),
            'submissionHotspots' => ComplianceSubmission::query()
                ->where('tenant_id', $tenantId)
                ->with(['framework:id,name'])
                ->withCount([
                    'evidenceFiles as pending_evidence_count' => fn (Builder $query) => $query->where('review_status', EvidenceReviewStatus::Pending),
                    'evidenceFiles as rejected_evidence_count' => fn (Builder $query) => $query->where('review_status', EvidenceReviewStatus::Rejected),
                ])
                ->whereIn('status', [ComplianceSubmissionStatus::Submitted, ComplianceSubmissionStatus::InReview])
                ->orderByDesc('pending_evidence_count')
                ->limit(6)
                ->get()
                ->map(fn (ComplianceSubmission $submission) => [
                    'id' => $submission->id,
                    'title' => $submission->title,
                    'framework' => $submission->framework?->name,
                    'status' => $this->enumValue($submission->status),
                    'pending_evidence_count' => $submission->pending_evidence_count,
                    'rejected_evidence_count' => $submission->rejected_evidence_count,
                ])
                ->values()
                ->all(),
            'attentionItems' => [
                [
                    'title' => 'Stale queue items',
                    'value' => EvidenceFile::query()
                        ->where('tenant_id', $tenantId)
                        ->where('review_status', EvidenceReviewStatus::Pending)
                        ->where('uploaded_at', '<', now()->subDays(3))
                        ->count(),
                    'description' => 'Evidence waiting more than three days for a reviewer decision.',
                ],
                [
                    'title' => 'Flagged responses',
                    'value' => ComplianceResponse::query()
                        ->where('tenant_id', $tenantId)
                        ->where('status', ComplianceResponseStatus::Flagged)
                        ->count(),
                    'description' => 'Responses already marked as weak or requiring extra scrutiny.',
                ],
                [
                    'title' => 'Reviews completed today',
                    'value' => EvidenceReview::query()->where('reviewer_id', $user->id)->whereDate('reviewed_at', $today)->count(),
                    'description' => 'Personal reviewer throughput for the current day.',
                ],
            ],
            'recentActivity' => $this->tenantActivity($tenantId, $user->id, 6),
        ];
    }

    public function forEmployee(User $user): array
    {
        $tenantId = $user->tenant_id;
        $userId = $user->id;

        $assignmentQuery = CourseAssignment::query()->where('assigned_to_user_id', $userId);
        $totalAssignments = (clone $assignmentQuery)->count();
        $completedAssignments = (clone $assignmentQuery)->where('status', CourseAssignmentStatus::Completed)->count();
        $trainingCompletion = $this->percentage($completedAssignments, $totalAssignments);

        $assignedCourseIds = CourseAssignment::query()
            ->where('assigned_to_user_id', $userId)
            ->pluck('course_id')
            ->filter()
            ->unique()
            ->values();

        $availableTests = Test::query()
            ->whereIn('course_id', $assignedCourseIds)
            ->with('course:id,title')
            ->limit(6)
            ->get();

        $latestScore = ComplianceScore::query()
            ->where('tenant_id', $tenantId)
            ->latest('calculated_at')
            ->first();

        $missingEvidenceResponses = ComplianceResponse::query()
            ->where('tenant_id', $tenantId)
            ->where('answered_by', $userId)
            ->whereHas('question', fn (Builder $query) => $query->where('requires_evidence', true))
            ->whereDoesntHave('evidenceFiles')
            ->count();

        return [
            'hero' => [
                'trainingCompletion' => $trainingCompletion,
                'activeAssignments' => (clone $assignmentQuery)
                    ->whereIn('status', [CourseAssignmentStatus::Assigned, CourseAssignmentStatus::InProgress])
                    ->count(),
                'pendingTests' => $availableTests->filter(function (Test $test) use ($userId) {
                    return ! TestAttempt::query()
                        ->where('user_id', $userId)
                        ->where('test_id', $test->id)
                        ->exists();
                })->count(),
                'complianceTasks' => $missingEvidenceResponses + ComplianceResponse::query()
                    ->where('tenant_id', $tenantId)
                    ->where('answered_by', $userId)
                    ->where('status', ComplianceResponseStatus::Draft)
                    ->count(),
            ],
            'stats' => [
                'assignedCourses' => $totalAssignments,
                'completedLessons' => LessonProgress::query()->where('user_id', $userId)->whereNotNull('completed_at')->count(),
                'testsPassed' => TestAttempt::query()->where('user_id', $userId)->where('result_status', TestAttemptResultStatus::Passed)->count(),
                'pendingResponses' => ComplianceResponse::query()
                    ->where('tenant_id', $tenantId)
                    ->where('answered_by', $userId)
                    ->where('status', ComplianceResponseStatus::Draft)
                    ->count(),
                'evidenceTasks' => $missingEvidenceResponses + EvidenceFile::query()
                    ->where('tenant_id', $tenantId)
                    ->where('uploaded_by', $userId)
                    ->where('review_status', EvidenceReviewStatus::Pending)
                    ->count(),
                'latestScore' => round((float) ($latestScore?->overall_score ?? 0), 1),
            ],
            'latestRating' => $latestScore?->rating?->value ?? 'Awaiting score',
            'monthlyTrend' => $this->monthlyTrend(5, function (Carbon $start, Carbon $end) use ($tenantId, $userId) {
                return [
                    'label' => $start->format('M'),
                    'primary' => LessonProgress::query()
                        ->where('tenant_id', $tenantId)
                        ->where('user_id', $userId)
                        ->whereBetween('completed_at', [$start, $end])
                        ->count(),
                    'secondary' => TestAttempt::query()
                        ->where('tenant_id', $tenantId)
                        ->where('user_id', $userId)
                        ->whereBetween('submitted_at', [$start, $end])
                        ->count(),
                    'tertiary' => ComplianceResponse::query()
                        ->where('tenant_id', $tenantId)
                        ->where('answered_by', $userId)
                        ->whereBetween('answered_at', [$start, $end])
                        ->count(),
                ];
            }),
            'nextActions' => $this->employeeNextActions($user),
            'currentCourses' => CourseAssignment::query()
                ->where('assigned_to_user_id', $userId)
                ->with('course:id,title')
                ->latest('assigned_at')
                ->limit(6)
                ->get()
                ->map(function (CourseAssignment $assignment) use ($userId) {
                    $courseId = $assignment->course_id;
                    $totalLessons = \App\Models\Lesson::query()->whereHas('module', fn (Builder $query) => $query->where('course_id', $courseId))->count();
                    $completedLessons = LessonProgress::query()
                        ->where('user_id', $userId)
                        ->whereHas('lesson.module', fn (Builder $query) => $query->where('course_id', $courseId))
                        ->whereNotNull('completed_at')
                        ->count();

                    return [
                        'id' => $assignment->id,
                        'course' => $assignment->course?->title ?? 'Course',
                        'status' => $this->enumValue($assignment->status),
                        'progress' => $this->percentage($completedLessons, $totalLessons),
                        'due_date' => optional($assignment->due_date)?->format('D, j M'),
                    ];
                })
                ->values()
                ->all(),
            'assessments' => [
                'available' => $availableTests->map(function (Test $test) use ($userId) {
                    $attempts = TestAttempt::query()->where('user_id', $userId)->where('test_id', $test->id)->get();

                    return [
                        'id' => $test->id,
                        'title' => $test->title,
                        'course' => $test->course?->title,
                        'attempts' => $attempts->count(),
                        'best_score' => round((float) ($attempts->max('percentage') ?? 0), 1),
                    ];
                })->values()->all(),
                'recentAttempts' => TestAttempt::query()
                    ->where('user_id', $userId)
                    ->with('test:id,title')
                    ->latest('submitted_at')
                    ->limit(6)
                    ->get()
                    ->map(fn (TestAttempt $attempt) => [
                        'id' => $attempt->id,
                        'test' => $attempt->test?->title ?? 'Assessment',
                        'percentage' => round((float) $attempt->percentage, 1),
                        'result_status' => $this->enumValue($attempt->result_status),
                        'submitted_at' => optional($attempt->submitted_at)?->diffForHumans(),
                    ])
                    ->values()
                    ->all(),
            ],
            'compliance' => [
                'draftResponses' => ComplianceResponse::query()
                    ->where('tenant_id', $tenantId)
                    ->where('answered_by', $userId)
                    ->where('status', ComplianceResponseStatus::Draft)
                    ->count(),
                'completedResponses' => ComplianceResponse::query()
                    ->where('tenant_id', $tenantId)
                    ->where('answered_by', $userId)
                    ->where('status', ComplianceResponseStatus::Completed)
                    ->count(),
                'evidenceTasks' => $missingEvidenceResponses,
                'items' => ComplianceResponse::query()
                    ->where('tenant_id', $tenantId)
                    ->where('answered_by', $userId)
                    ->with(['question.section.framework:id,name', 'submission:id,title'])
                    ->latest('updated_at')
                    ->limit(6)
                    ->get()
                    ->map(fn (ComplianceResponse $response) => [
                        'id' => $response->id,
                        'question' => $response->question?->question_text ?? 'Compliance response',
                        'framework' => $response->question?->section?->framework?->name ?? 'Framework',
                        'submission' => $response->submission?->title ?? 'Submission',
                        'status' => $this->enumValue($response->status),
                        'response_score' => round((float) ($response->response_score ?? 0), 1),
                    ])
                    ->values()
                    ->all(),
            ],
            'recentActivity' => $this->tenantActivity($tenantId, $userId, 6),
        ];
    }

    protected function departmentHealth(?int $tenantId): array
    {
        $profiles = EmployeeProfile::query()
            ->where('tenant_id', $tenantId)
            ->get(['id', 'department_id', 'user_id']);

        $assignments = CourseAssignment::query()
            ->where('tenant_id', $tenantId)
            ->get(['assigned_to_user_id', 'status']);

        return Department::query()
            ->where('tenant_id', $tenantId)
            ->withCount('employeeProfiles')
            ->get()
            ->map(function (Department $department) use ($profiles, $assignments) {
                $userIds = $profiles->where('department_id', $department->id)->pluck('user_id');
                $departmentAssignments = $assignments->whereIn('assigned_to_user_id', $userIds);
                $completed = $departmentAssignments->where('status', CourseAssignmentStatus::Completed)->count();
                $overdue = $departmentAssignments->where('status', CourseAssignmentStatus::Overdue)->count();

                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'employee_count' => $department->employee_profiles_count,
                    'completion_rate' => $this->percentage($completed, $departmentAssignments->count()),
                    'overdue_assignments' => $overdue,
                ];
            })
            ->values()
            ->all();
    }

    protected function peopleSnapshot(?int $tenantId): array
    {
        $profiles = EmployeeProfile::query()
            ->where('tenant_id', $tenantId)
            ->with(['user:id,name,last_login_at', 'department:id,name'])
            ->get();

        $overdueCounts = CourseAssignment::query()
            ->where('tenant_id', $tenantId)
            ->where('status', CourseAssignmentStatus::Overdue)
            ->get()
            ->countBy('assigned_to_user_id');

        $riskWeights = ['high' => 3, 'medium' => 2, 'low' => 1];

        return $profiles
            ->sortByDesc(function (EmployeeProfile $profile) use ($overdueCounts, $riskWeights) {
                $riskWeight = $riskWeights[strtolower((string) $profile->risk_level)] ?? 0;

                return ($riskWeight * 100) + ($overdueCounts[$profile->user_id] ?? 0);
            })
            ->take(6)
            ->map(function (EmployeeProfile $profile) use ($overdueCounts) {
                return [
                    'id' => $profile->id,
                    'name' => $profile->user?->name ?? 'Unknown user',
                    'department' => $profile->department?->name ?? 'Unassigned',
                    'risk_level' => $profile->risk_level ?? 'Unspecified',
                    'overdue_assignments' => $overdueCounts[$profile->user_id] ?? 0,
                    'last_login_at' => optional($profile->user?->last_login_at)?->diffForHumans() ?? 'Never',
                ];
            })
            ->values()
            ->all();
    }

    protected function employeeNextActions(User $user): array
    {
        $assignments = CourseAssignment::query()
            ->where('assigned_to_user_id', $user->id)
            ->with('course:id,title')
            ->orderBy('due_date')
            ->limit(3)
            ->get()
            ->map(fn (CourseAssignment $assignment) => [
                'id' => $assignment->id,
                'title' => $assignment->course?->title ?? 'Course assignment',
                'description' => 'Continue learning progress and keep your training on schedule.',
                'meta' => optional($assignment->due_date)?->isPast() ? 'Overdue training item' : 'Training due soon',
                'created_at' => optional($assignment->due_date)?->format('D, j M'),
            ]);

        $tests = Test::query()
            ->whereIn('course_id', CourseAssignment::query()->where('assigned_to_user_id', $user->id)->pluck('course_id'))
            ->limit(2)
            ->get()
            ->filter(fn (Test $test) => ! TestAttempt::query()->where('user_id', $user->id)->where('test_id', $test->id)->exists())
            ->map(fn (Test $test) => [
                'id' => $test->id,
                'title' => $test->title,
                'description' => 'Start your next assessment attempt and record a passing score.',
                'meta' => 'Assessment available',
                'created_at' => null,
            ]);

        $responses = ComplianceResponse::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('answered_by', $user->id)
            ->where('status', ComplianceResponseStatus::Draft)
            ->with('question:id,question_text')
            ->limit(2)
            ->get()
            ->map(fn (ComplianceResponse $response) => [
                'id' => $response->id,
                'title' => $response->question?->question_text ?? 'Draft compliance response',
                'description' => 'Finish your draft response and attach evidence where it is required.',
                'meta' => 'Compliance draft',
                'created_at' => optional($response->updated_at)?->diffForHumans(),
            ]);

        return $assignments
            ->concat($tests)
            ->concat($responses)
            ->take(6)
            ->values()
            ->all();
    }

    protected function averageEvidenceReviewSeconds(?int $tenantId): float
    {
        $query = DB::table('evidence_reviews')
            ->join('evidence_files', 'evidence_files.id', '=', 'evidence_reviews.evidence_file_id')
            ->where('evidence_files.tenant_id', $tenantId)
            ->whereNotNull('evidence_reviews.reviewed_at')
            ->whereNotNull('evidence_files.uploaded_at');

        $driver = DB::connection()->getDriverName();

        $expression = match ($driver) {
            'sqlite' => 'AVG((julianday(evidence_reviews.reviewed_at) - julianday(evidence_files.uploaded_at)) * 86400)',
            'pgsql' => 'AVG(EXTRACT(EPOCH FROM (evidence_reviews.reviewed_at - evidence_files.uploaded_at)))',
            default => 'AVG(TIMESTAMPDIFF(SECOND, evidence_files.uploaded_at, evidence_reviews.reviewed_at))',
        };

        return (float) ($query->selectRaw($expression.' as avg_seconds')->value('avg_seconds') ?? 0);
    }

    protected function tenantActivity(?int $tenantId, ?int $userId = null, int $limit = 6): array
    {
        return AuditLog::query()
            ->with(['user:id,name', 'tenant:id,name'])
            ->when($tenantId, fn (Builder $query) => $query->where('tenant_id', $tenantId))
            ->when($userId, fn (Builder $query) => $query->where('user_id', $userId))
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'title' => $log->action,
                'description' => sprintf('%s in %s', $log->user?->name ?? 'System', $log->tenant?->name ?? 'Platform'),
                'meta' => $log->entity_type,
                'created_at' => optional($log->created_at)?->diffForHumans(),
            ])
            ->values()
            ->all();
    }

    protected function monthlyTrend(int $months, callable $callback): array
    {
        return collect(range($months, 0))
            ->map(function (int $monthsAgo) use ($callback) {
                $start = now()->startOfMonth()->subMonths($monthsAgo);
                $end = $start->copy()->endOfMonth();

                return $callback($start, $end);
            })
            ->values()
            ->all();
    }

    protected function recentActivity(): Collection
    {
        return AuditLog::query()
            ->with(['user:id,name', 'tenant:id,name'])
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'tenant' => $log->tenant?->name ?? 'Platform',
                'user' => $log->user?->name ?? 'System',
                'created_at' => optional($log->created_at)?->diffForHumans(),
            ]);
    }

    protected function attentionItems(
        int $pendingTenants,
        int $openSubmissions,
        int $pendingEvidence,
        int $rejectedEvidence,
        float $averageComplianceScore,
    ): array {
        return [
            [
                'title' => 'Tenant approvals waiting',
                'value' => $pendingTenants,
                'description' => 'Companies registered but still pending platform activation.',
            ],
            [
                'title' => 'Submissions in active review',
                'value' => $openSubmissions,
                'description' => 'Compliance submissions currently submitted or in review.',
            ],
            [
                'title' => 'Evidence queue',
                'value' => $pendingEvidence,
                'description' => 'Evidence files still awaiting reviewer action.',
            ],
            [
                'title' => 'Rejected evidence',
                'value' => $rejectedEvidence,
                'description' => 'Files rejected and likely forcing provisional or reduced scores.',
            ],
            [
                'title' => 'Average compliance score',
                'value' => $averageComplianceScore,
                'description' => 'Platform-wide average across scored submissions.',
            ],
        ];
    }

    protected function percentage(float|int $numerator, float|int $denominator, int $precision = 1): float
    {
        if ($denominator <= 0) {
            return 0;
        }

        return round(($numerator / $denominator) * 100, $precision);
    }

    protected function enumValue(mixed $value): string
    {
        if ($value instanceof \BackedEnum) {
            return $value->value;
        }

        return (string) $value;
    }
}
