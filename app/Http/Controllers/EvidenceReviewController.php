<?php

namespace App\Http\Controllers;

use App\Http\Requests\EvidenceReviewRequest;
use App\Models\EvidenceFile;
use App\Models\EvidenceReview;
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
            $this->complianceScoringService->scoreSubmission($evidenceFile->submission()->firstOrFail(), $request->user()?->id);
        });

        return back()->with('success', 'Evidence reviewed.');
    }
}
