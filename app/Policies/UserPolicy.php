<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class UserPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function view(User $user, User $model): bool
    {
        return $this->canManageTenantUser($user, $model);
    }

    public function update(User $user, User $model): bool
    {
        return $this->canManageTenantUser($user, $model);
    }

    public function updatePassword(User $user, User $model): bool
    {
        return $this->canManageTenantUser($user, $model);
    }

    public function updateAccess(User $user, User $model): bool
    {
        return false;
    }

    public function deactivate(User $user, User $model): bool
    {
        if (! $this->canManageTenantUser($user, $model)) {
            return false;
        }

        return $user->id !== $model->id && ! $model->isInactive();
    }

    public function reactivate(User $user, User $model): bool
    {
        if (! $this->canManageTenantUser($user, $model)) {
            return false;
        }

        return $user->id !== $model->id && $model->isInactive();
    }

    protected function canManageTenantUser(User $user, User $model): bool
    {
        return $user->can(Permissions::MANAGE_USERS)
            && ! $model->isSuperAdmin()
            && $this->sameTenant($user, $model);
    }
}
