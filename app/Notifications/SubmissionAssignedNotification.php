<?php

namespace App\Notifications;

use App\Models\ComplianceSubmission;
use App\Models\User;
use App\Support\TenantBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubmissionAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected ComplianceSubmission $submission,
        protected ?User $assigner = null,
    ) {
        $this->queue = 'mail';
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tenant = $this->submission->tenant;
        $actionUrl = route('submissions.show', $this->submission);
        $frameworkName = $this->submission->framework?->name ?: 'Compliance framework';
        $reportingPeriod = $this->submission->reporting_period ?: 'Not specified';
        $status = str($this->submission->status?->value ?? 'draft')->replace('_', ' ')->title()->toString();

        return (new MailMessage())
            ->subject(sprintf('Submission assigned: %s | Privacy Cure Compliance', $this->submission->title))
            ->view('emails.submission-assigned', [
                'tenant' => $tenant,
                'branding' => $tenant?->branding ?? TenantBranding::payload(null),
                'recipientName' => $notifiable->name,
                'title' => 'A submission has been assigned to you',
                'summary' => sprintf(
                    'You have been assigned the submission "%s" under %s. Open it to review the framework scope, complete your responses, and upload supporting evidence.',
                    $this->submission->title,
                    $frameworkName
                ),
                'eyebrow' => 'Submission assignment',
                'actionUrl' => $actionUrl,
                'actionLabel' => 'Open submission',
                'details' => array_filter([
                    'Workspace' => $tenant?->name ?: 'Privacy Cure Compliance',
                    'Submission' => $this->submission->title,
                    'Framework' => $frameworkName,
                    'Reporting period' => $reportingPeriod,
                    'Assigned by' => $this->assigner?->name,
                    'Current status' => $status,
                ]),
                'footer' => 'If you were not expecting this assignment, contact your company administrator or platform support before taking action.',
            ]);
    }
}
