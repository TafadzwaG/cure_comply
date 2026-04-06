<?php

namespace App\Policies;

use App\Models\AppNotification;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;

class AppNotificationPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, AppNotification $appNotification): bool
    {
        return $appNotification->user_id === $user->id;
    }

    public function update(User $user, AppNotification $appNotification): bool
    {
        return $appNotification->user_id === $user->id;
    }
}
