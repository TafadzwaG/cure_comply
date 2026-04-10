<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use App\Notifications\TenantActivatedNotification;
use App\Notifications\TenantDeactivatedNotification;
use App\Notifications\TenantRegistrationReceivedNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;

class TenantLifecycleService
{
    public function __construct(
        protected AppNotificationService $appNotificationService,
        protected PlatformSettingsService $platformSettingsService,
    ) {
    }

    public function notifyRegistrationSubmitted(Tenant $tenant): void
    {
        $actionUrl = route('tenants.show', $tenant, false);
        $title = "New tenant registration: {$tenant->name}";
        $message = 'A new company registration is waiting for activation review.';

        foreach ($this->platformSettingsService->registrationRecipientUsers() as $recipient) {
            $this->appNotificationService->sendToUser(
                $recipient,
                'tenant_registered',
                $title,
                $message,
                $actionUrl,
                [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'status' => $tenant->status?->value,
                ],
            );

            Notification::route('mail', $recipient->email)->notify(
                new TenantRegistrationReceivedNotification($tenant, $actionUrl)
            );
        }

        foreach ($this->platformSettingsService->registrationRecipientEmails() as $email) {
            Notification::route('mail', $email)->notify(
                new TenantRegistrationReceivedNotification($tenant, $actionUrl)
            );
        }
    }

    public function notifyActivated(Tenant $tenant): void
    {
        $actionUrl = route('dashboard', absolute: false);
        $title = "{$tenant->name} has been activated";
        $message = 'Your tenant workspace is now active. You can sign in and continue setup inside the platform.';

        $primaryAdmin = $this->primaryAdmin($tenant);

        if ($primaryAdmin) {
            $this->appNotificationService->sendToUser(
                $primaryAdmin,
                'tenant_activated',
                $title,
                $message,
                $actionUrl,
                [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'status' => $tenant->status?->value,
                ],
            );
        }

        foreach ($this->tenantEmailRecipients($tenant, $primaryAdmin) as $email) {
            Notification::route('mail', $email)->notify(
                new TenantActivatedNotification($tenant, $actionUrl)
            );
        }
    }

    public function notifyDeactivated(Tenant $tenant): void
    {
        $actionUrl = route('tenant.activation.pending', absolute: false);
        $title = "{$tenant->name} has been deactivated";
        $message = 'Workspace access is paused. Contact your platform administrator if you need the tenant restored.';

        $primaryAdmin = $this->primaryAdmin($tenant);

        if ($primaryAdmin) {
            $this->appNotificationService->sendToUser(
                $primaryAdmin,
                'tenant_deactivated',
                $title,
                $message,
                $actionUrl,
                [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'status' => $tenant->status?->value,
                ],
            );
        }

        foreach ($this->tenantEmailRecipients($tenant, $primaryAdmin) as $email) {
            Notification::route('mail', $email)->notify(
                new TenantDeactivatedNotification($tenant, $actionUrl)
            );
        }
    }

    protected function primaryAdmin(Tenant $tenant): ?User
    {
        return User::query()
            ->where('tenant_id', $tenant->id)
            ->whereHas('roles', fn ($query) => $query->where('name', 'company_admin'))
            ->orderBy('id')
            ->first();
    }

    protected function tenantEmailRecipients(Tenant $tenant, ?User $primaryAdmin): Collection
    {
        return collect([
            $tenant->contact_email,
            $primaryAdmin?->email,
        ])->filter()->unique()->values();
    }
}
