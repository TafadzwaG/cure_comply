<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;

class UserPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }
}
