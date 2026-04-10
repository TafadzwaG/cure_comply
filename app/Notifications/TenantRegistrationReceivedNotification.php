<?php

namespace App\Notifications;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TenantRegistrationReceivedNotification extends Notification implements ShouldQueue
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
            ->subject("New tenant registration: {$this->tenant->name}")
            ->view('email-tenant-lifecycle', [
                'tenant' => $this->tenant,
                'eyebrow' => 'Tenant registration',
                'title' => 'New tenant waiting for activation',
                'summary' => "{$this->tenant->name} has registered and is now waiting for platform approval.",
                'body' => [
                    "Company: {$this->tenant->name}",
                    'Review the registration details and activate the tenant when the workspace is ready.',
                ],
                'details' => [
                    'Tenant name' => $this->tenant->name,
                    'Registration status' => 'Pending activation',
                    'Primary contact' => $this->tenant->contact_name ?: 'Not provided',
                    'Contact email' => $this->tenant->contact_email ?: 'Not provided',
                ],
                'actionLabel' => 'Review tenant',
                'actionUrl' => url($this->actionUrl),
                'footer' => 'This message was sent because you are configured to receive new tenant registration alerts.',
            ]);
    }
}
