<?php

namespace App\Http\Controllers;

use App\Http\Requests\EvidenceReviewRequest;
use App\Models\EvidenceFile;
use App\Models\EvidenceReview;
use App\Models\User;
use App\Services\AppNotificationService;
use Illuminate\Support\Facades\DB;
use App\Services\ComplianceScoringService;
use Illuminate\Http\RedirectResponse;

class EvidenceReviewController extends Controller
{
    public function __construct(protected ComplianceScoringService $complianceScoringService)
    {
    }

    public function store(EvidenceReviewRequest $request, EvidenceFile $evidenceFile): RedirectResponse
    {
        $this->authorize('create', EvidenceReview::class);
        $this->authorize('view', $evidenceFile);

        DB::transaction(function () use ($request, $evidenceFile) {
            $review = EvidenceReview::query()->create([
                'evidence_file_id' => $evidenceFile->id,
                'reviewer_id' => $request->user()?->id,
                ...$request->validated(),
                'reviewed_at' => now(),
            ]);

            $evidenceFile->update(['review_status' => $review->review_status]);

            // Snapshot the reviewer decision onto the current version for diffing
            $evidenceFile->versions()
                ->where('version_number', $evidenceFile->current_version)
                ->update([
                    'review_status' => $review->review_status->value,
                    'review_comment' => $review->review_comment,
                ]);

            $this->complianceScoringService->scoreSubmission($evidenceFile->submission()->firstOrFail(), $request->user()?->id);
            app(\App\Services\AuditLogService::class)->logModelCreated('evidence_reviewed', $review);

            $submission = $evidenceFile->submission()->first();
            $recipients = User::query()
                ->where('tenant_id', $submission?->tenant_id)
                ->whereIn('id', array_filter([$evidenceFile->uploaded_by, $submission?->submitted_by]))
                ->get();

            foreach ($recipients as $recipient) {
                app(AppNotificationService::class)->sendToUser(
                    $recipient,
                    'evidence_reviewed',
                    sprintf('Evidence %s', $review->review_status->value),
                    sprintf('%s was %s by a reviewer.', $evidenceFile->original_name, $review->review_status->value),
                    route('submissions.show', $submission, false),
                    ['evidence_file_id' => $evidenceFile->id, 'review_status' => $review->review_status->value],
                    $review->review_status->value === 'rejected',
                    'Evidence review update',
                    'Open submission'
                );
            }
        });

        return back()->with('success', 'Evidence reviewed.');
    }
}
