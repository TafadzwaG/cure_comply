<?php

namespace App\Notifications;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Invitation $invitation)
    {
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tenantName = $this->invitation->tenant?->name;
        $role = str($this->invitation->role)->replace('_', ' ')->title()->toString();
        $intro = $this->invitation->role === 'super_admin'
            ? 'You have been invited as a platform administrator for Privacy Cure Compliance.'
            : "You have been invited as {$role}" . ($tenantName ? " for {$tenantName}." : '.');

        return (new MailMessage())
            ->subject('You have been invited to Privacy Cure Compliance')
            ->greeting("Hello {$this->invitation->name},")
            ->line($intro)
            ->action('Accept Invitation', route('invitations.accept.show', $this->invitation->token))
            ->line('Complete your account setup to access your workspace.')
            ->line('This invite expires in 7 days.');
    }
}
