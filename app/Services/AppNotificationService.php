<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\User;
use App\Notifications\GenericActionMailNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class AppNotificationService
{
    public function __construct(protected AuditLogService $auditLogService)
    {
    }

    public function sendToUser(
        User $user,
        string $type,
        string $title,
        string $message,
        ?string $actionUrl = null,
        array $meta = [],
        bool $sendMail = false,
        ?string $mailSubject = null,
        ?string $mailActionLabel = null,
    ): AppNotification {
        $notification = AppNotification::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
            'meta' => $meta ?: null,
        ]);

        $this->auditLogService->logModelCreated('notification_created', $notification);

        if ($sendMail) {
            $mailUrl = $actionUrl && ! Str::startsWith($actionUrl, ['http://', 'https://']) ? url($actionUrl) : $actionUrl;

            Notification::route('mail', $user->email)->notify(
                new GenericActionMailNotification(
                    $mailSubject ?? $title,
                    $title,
                    $message,
                    $mailUrl,
                    $mailActionLabel ?? 'Open'
                )
            );
        }

        return $notification;
    }
}
