<?php

namespace App\Notifications;

use App\Models\Invitation;
use App\Support\TenantBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Invitation $invitation)
    {
        $this->queue = 'mail';
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tenant = $this->invitation->tenant;
        $tenantName = $tenant?->name;
        $role = str($this->invitation->role)->replace('_', ' ')->title()->toString();
        $isPlatformInvitation = $this->invitation->role === 'super_admin';
        $actionUrl = route('invitations.accept.show', $this->invitation->token);
        $expiresAt = $this->invitation->expires_at?->timezone(config('app.timezone'))->format('d M Y, H:i T');

        $title = $isPlatformInvitation
            ? 'Platform access invitation'
            : 'Your workspace access is ready';

        $summary = $isPlatformInvitation
            ? 'A platform administrator account has been prepared for you in Privacy Cure Compliance. Accept the invitation to complete setup and access the full platform workspace.'
            : "You have been invited to join {$tenantName} as {$role}. Accept the invitation to complete your account setup and enter the workspace.";

        $details = array_filter([
            'Workspace' => $tenantName ?: 'Privacy Cure Compliance',
            'Access role' => $role,
            'Department' => $this->invitation->department?->name,
            'Invited by' => $this->invitation->inviter?->name,
            'Invitation email' => $this->invitation->email,
            'Expires' => $expiresAt,
        ]);

        return (new MailMessage())
            ->subject(
                $isPlatformInvitation
                    ? 'Platform administrator invitation | Privacy Cure Compliance'
                    : sprintf('You are invited to join %s | Privacy Cure Compliance', $tenantName ?: 'Privacy Cure Compliance')
            )
            ->view('emails.invitation', [
                'tenant' => $tenant,
                'branding' => $tenant?->branding ?? TenantBranding::payload(null),
                'recipientName' => $this->invitation->name,
                'title' => $title,
                'summary' => $summary,
                'eyebrow' => $isPlatformInvitation ? 'Platform invitation' : 'Workspace invitation',
                'actionUrl' => $actionUrl,
                'actionLabel' => 'Accept invitation',
                'details' => $details,
                'roleLabel' => $role,
                'workspaceName' => $tenantName ?: 'Privacy Cure Compliance',
                'isPlatformInvitation' => $isPlatformInvitation,
                'footer' => 'If you were not expecting this invitation, you can safely ignore this email. Access will remain unavailable until the invitation is accepted.',
            ]);
    }
}
