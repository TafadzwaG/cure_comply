<?php

namespace App\Services;

use App\Enums\ComplianceRating;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceResponse;
use App\Models\ComplianceScore;
use App\Models\ComplianceSectionScore;
use App\Models\ComplianceSubmission;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ComplianceScoringService
{
    public function scoreSubmission(ComplianceSubmission $submission, ?int $userId = null): ComplianceScore
    {
        $submission->loadMissing('framework.sections.questions', 'responses.evidenceFiles.reviews');

        if (! $submission->framework) {
            Log::error('Cannot score submission without a framework', ['submission_id' => $submission->id]);
            throw new \RuntimeException('Submission has no associated framework.');
        }

        return DB::transaction(function () use ($submission, $userId) {
            $responses = $submission->responses->keyBy('compliance_question_id');
            $sectionScores = [];

            foreach ($submission->framework->sections as $section) {
                $weightedTotal = 0;
                $weightSum = 0;

                foreach ($section->questions as $question) {
                    $response = $responses->get($question->id);
                    $score = $this->scoreResponse($question, $response);

                    if ($response) {
                        $response->update(['response_score' => $score]);
                    }

                    $weightedTotal += $score * (float) $question->weight;
                    $weightSum += (float) $question->weight;
                }

                $sectionScore = $weightSum > 0 ? round($weightedTotal / $weightSum, 2) : 0;
                $sectionScores[] = [
                    'section_id' => $section->id,
                    'score' => $sectionScore,
                    'weight' => (float) $section->weight,
                    'rating' => $this->ratingFor($sectionScore),
                ];
            }

            ComplianceSectionScore::query()
                ->where('compliance_submission_id', $submission->id)
                ->delete();

            foreach ($sectionScores as $sectionScore) {
                ComplianceSectionScore::query()->create([
                    'compliance_submission_id' => $submission->id,
                    'compliance_section_id' => $sectionScore['section_id'],
                    'score' => $sectionScore['score'],
                    'rating' => $sectionScore['rating'],
                    'calculated_at' => now(),
                ]);
            }

            $overallScore = $this->calculateOverallScore(collect($sectionScores));

            return ComplianceScore::query()->updateOrCreate(
                [
                    'compliance_submission_id' => $submission->id,
                ],
                [
                    'tenant_id' => $submission->tenant_id,
                    'overall_score' => $overallScore,
                    'rating' => $this->ratingFor($overallScore),
                    'calculated_at' => now(),
                    'calculated_by' => $userId,
                ]
            );
        });
    }

    public function scoreResponse(ComplianceQuestion $question, ?ComplianceResponse $response): float
    {
        if (! $response) {
            return 0;
        }

        $baseScore = match ($response->answer_value) {
            'yes' => 100,
            'partial' => 50,
            'no' => 0,
            default => 0,
        };

        $evidenceFiles = $response->evidenceFiles;

        if ($question->requires_evidence && $evidenceFiles->isEmpty()) {
            return min($baseScore, 40);
        }

        if ($evidenceFiles->isNotEmpty() && $evidenceFiles->every(fn ($file) => $file->review_status?->value === 'rejected')) {
            return 20;
        }

        return $baseScore;
    }

    public function ratingFor(float $score): string
    {
        return match (true) {
            $score >= 80 => ComplianceRating::Green->value,
            $score >= 50 => ComplianceRating::Amber->value,
            default => ComplianceRating::Red->value,
        };
    }

    protected function calculateOverallScore(Collection $sectionScores): float
    {
        $weightedTotal = $sectionScores->sum(fn (array $score) => $score['score'] * $score['weight']);
        $weightSum = $sectionScores->sum('weight');

        return $weightSum > 0 ? round($weightedTotal / $weightSum, 2) : 0;
    }
}
