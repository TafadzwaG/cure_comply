<?php

namespace App\Notifications;

use App\Models\ComplianceSubmission;
use App\Models\User;
use App\Support\TenantBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Symfony\Component\Mime\Email;

class SubmissionSubmittedForReviewNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private const REVIEW_COPY_EMAIL = 'gashiratafadzwa@gmail.com';

    public function __construct(
        protected ComplianceSubmission $submission,
        protected ?User $submittedBy = null,
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
        $status = str($this->submission->status?->value ?? 'submitted')->replace('_', ' ')->title()->toString();
        $submittedAt = $this->submission->submitted_at?->timezone(config('app.timezone'))->format('d M Y, H:i T');

        return (new MailMessage())
            ->subject(sprintf('Submission ready for review: %s | Privacy Cure Compliance', $this->submission->title))
            ->view('emails.submission-submitted-for-review', [
                'tenant' => $tenant,
                'branding' => $tenant?->branding ?? TenantBranding::payload(null),
                'recipientName' => $notifiable->name,
                'title' => 'A submission you assigned is ready for review',
                'summary' => sprintf(
                    '%s has submitted "%s" for review. Open the submission to validate responses, review evidence, and move it through the next review step.',
                    $this->submittedBy?->name ?: 'A user',
                    $this->submission->title,
                ),
                'eyebrow' => 'Review ready',
                'actionUrl' => $actionUrl,
                'actionLabel' => 'Open submission',
                'details' => array_filter([
                    'Workspace' => $tenant?->name ?: 'Privacy Cure Compliance',
                    'Submission' => $this->submission->title,
                    'Framework' => $frameworkName,
                    'Reporting period' => $reportingPeriod,
                    'Submitted by' => $this->submittedBy?->name,
                    'Submitted at' => $submittedAt,
                    'Current status' => $status,
                ]),
                'footer' => 'This notice was generated because you assigned this submission. Review the content and supporting evidence before taking the next decision.',
            ])
            ->withSymfonyMessage(function (Email $message) use ($notifiable) {
                if (! filled($notifiable->email) || strcasecmp((string) $notifiable->email, self::REVIEW_COPY_EMAIL) === 0) {
                    return;
                }

                $message->cc(self::REVIEW_COPY_EMAIL);
            });
    }
}
