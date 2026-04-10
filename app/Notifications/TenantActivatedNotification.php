<?php

namespace App\Notifications;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TenantActivatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Tenant $tenant,
        protected string $actionUrl,
    ) {
        $this->onQueue('mail');
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Tenant activated: {$this->tenant->name}")
            ->view('email-tenant-lifecycle', [
                'tenant' => $this->tenant,
                'eyebrow' => 'Tenant activated',
                'title' => "{$this->tenant->name} is now active",
                'summary' => 'Your workspace has been activated and platform access is now available.',
                'body' => [
                    'You can now sign in, complete profile setup, and continue onboarding your company workspace.',
                ],
                'details' => [
                    'Tenant name' => $this->tenant->name,
                    'Status' => 'Active',
                    'Primary contact' => $this->tenant->contact_name ?: 'Not provided',
                ],
                'actionLabel' => 'Open dashboard',
                'actionUrl' => url($this->actionUrl),
                'footer' => 'If you were not expecting this change, contact Privacy Cure support or your platform administrator.',
            ]);
    }
}
