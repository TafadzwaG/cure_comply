<?php

namespace App\Notifications;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TenantDeactivatedNotification extends Notification implements ShouldQueue
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
            ->subject("Tenant deactivated: {$this->tenant->name}")
            ->view('email-tenant-lifecycle', [
                'tenant' => $this->tenant,
                'eyebrow' => 'Tenant deactivated',
                'title' => "{$this->tenant->name} access is paused",
                'summary' => 'Your workspace has been set to inactive and normal platform access is currently unavailable.',
                'body' => [
                    'The tenant remains on file, but dashboards and workflow access are paused until a super admin reactivates the workspace.',
                ],
                'details' => [
                    'Tenant name' => $this->tenant->name,
                    'Status' => 'Inactive',
                    'Primary contact' => $this->tenant->contact_name ?: 'Not provided',
                ],
                'actionLabel' => 'View workspace status',
                'actionUrl' => url($this->actionUrl),
                'footer' => 'Contact your platform administrator if this workspace should be restored.',
            ]);
    }
}
