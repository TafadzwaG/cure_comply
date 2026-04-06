<?php

namespace App\Services;

use App\Models\ComplianceSubmission;
use App\Models\CourseAssignment;
use App\Models\EvidenceFile;
use App\Models\TestAttempt;

class ReportService
{
    public function employeeTraining(array $filters): array
    {
        return CourseAssignment::query()
            ->with(['assignedTo.employeeProfile.department', 'course'])
            ->when(data_get($filters, 'employee_id'), fn ($query, $employeeId) => $query->where('assigned_to_user_id', $employeeId))
            ->get()
            ->map(fn ($assignment) => [
                'employee_name' => $assignment->assignedTo?->name,
                'department' => $assignment->assignedTo?->employeeProfile?->department?->name,
                'course' => $assignment->course?->title,
                'progress' => $assignment->status,
                'completion_status' => $assignment->status,
                'due_date' => optional($assignment->due_date)->format('Y-m-d'),
            ])
            ->all();
    }

    public function testPerformance(array $filters): array
    {
        return TestAttempt::query()
            ->with(['user', 'test'])
            ->when(data_get($filters, 'employee_id'), fn ($query, $employeeId) => $query->where('user_id', $employeeId))
            ->get()
            ->groupBy(fn ($attempt) => $attempt->user?->name.'-'.$attempt->test?->title)
            ->map(fn ($attempts) => [
                'employee' => $attempts->first()?->user?->name,
                'test' => $attempts->first()?->test?->title,
                'attempts' => $attempts->count(),
                'best_score' => $attempts->max('percentage'),
                'latest_score' => $attempts->sortByDesc('submitted_at')->first()?->percentage,
                'pass_fail' => $attempts->sortByDesc('submitted_at')->first()?->result_status?->value,
            ])
            ->values()
            ->all();
    }

    public function complianceSummary(array $filters): array
    {
        return ComplianceSubmission::query()
            ->with(['framework', 'score', 'sectionScores.section'])
            ->when(data_get($filters, 'framework_id'), fn ($query, $frameworkId) => $query->where('compliance_framework_id', $frameworkId))
            ->get()
            ->map(fn ($submission) => [
                'framework' => $submission->framework?->name,
                'submission' => $submission->title,
                'section_scores' => $submission->sectionScores->map(fn ($score) => [
                    'section' => $score->section?->name,
                    'score' => $score->score,
                    'rating' => $score->rating?->value ?? $score->rating,
                ])->all(),
                'overall_score' => $submission->score?->overall_score,
                'rating' => $submission->score?->rating?->value ?? $submission->score?->rating,
            ])
            ->all();
    }

    public function evidenceStatus(array $filters): array
    {
        return EvidenceFile::query()
            ->with(['response.question', 'reviews'])
            ->get()
            ->groupBy('compliance_response_id')
            ->map(fn ($files) => [
                'question' => $files->first()?->response?->question?->question_text,
                'evidence_count' => $files->count(),
                'review_status' => $files->pluck('review_status')->implode(', '),
                'reviewer_comments_summary' => $files->flatMap(fn ($file) => $file->reviews->pluck('review_comment'))->filter()->implode(' | '),
            ])
            ->values()
            ->all();
    }
}
