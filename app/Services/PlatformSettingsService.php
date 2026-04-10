<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Collection;

class PlatformSettingsService
{
    public const TENANT_REGISTRATION_RECIPIENTS_KEY = 'tenant_registration_recipients';

    public function getTenantRegistrationRecipients(): array
    {
        $setting = SystemSetting::query()
            ->where('key', self::TENANT_REGISTRATION_RECIPIENTS_KEY)
            ->value('value');

        $payload = is_array($setting) ? $setting : [];

        return [
            'recipient_user_ids' => collect($payload['recipient_user_ids'] ?? [])
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values()
                ->all(),
            'recipient_emails' => collect($payload['recipient_emails'] ?? [])
                ->map(fn ($email) => mb_strtolower(trim((string) $email)))
                ->filter()
                ->unique()
                ->values()
                ->all(),
        ];
    }

    public function saveTenantRegistrationRecipients(array $recipientUserIds, array $recipientEmails): SystemSetting
    {
        return SystemSetting::query()->updateOrCreate(
            ['key' => self::TENANT_REGISTRATION_RECIPIENTS_KEY],
            [
                'value' => [
                    'recipient_user_ids' => collect($recipientUserIds)->map(fn ($id) => (int) $id)->unique()->values()->all(),
                    'recipient_emails' => collect($recipientEmails)
                        ->map(fn ($email) => mb_strtolower(trim((string) $email)))
                        ->filter()
                        ->unique()
                        ->values()
                        ->all(),
                ],
            ],
        );
    }

    public function registrationRecipientUsers(): Collection
    {
        $recipientIds = $this->getTenantRegistrationRecipients()['recipient_user_ids'];

        if ($recipientIds === []) {
            return collect();
        }

        return User::query()
            ->whereIn('id', $recipientIds)
            ->orderBy('name')
            ->get();
    }

    public function registrationRecipientEmails(): array
    {
        return $this->getTenantRegistrationRecipients()['recipient_emails'];
    }
}
