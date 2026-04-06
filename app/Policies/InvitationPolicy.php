<?php

namespace App\Policies;

use App\Models\Invitation;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class InvitationPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::INVITE_EMPLOYEES);
    }

    public function view(User $user, Invitation $invitation): bool
    {
        return $user->can(Permissions::INVITE_EMPLOYEES) && $this->sameTenant($user, $invitation);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::INVITE_EMPLOYEES);
    }

    public function delete(User $user, Invitation $invitation): bool
    {
        return $user->can(Permissions::INVITE_EMPLOYEES) && $this->sameTenant($user, $invitation);
    }
}
