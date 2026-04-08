<?php

namespace App\Policies;

use App\Models\TestAssignment;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class TestAssignmentPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('company_admin')
            || $user->can(Permissions::MANAGE_TESTS)
            || $user->can(Permissions::TAKE_TESTS);
    }

    public function view(User $user, TestAssignment $assignment): bool
    {
        return $assignment->assigned_to_user_id === $user->id
            || (($user->hasRole('company_admin') || $user->can(Permissions::MANAGE_TESTS)) && $this->sameTenant($user, $assignment));
    }

    public function create(User $user): bool
    {
        return $user->hasRole('company_admin') || $user->can(Permissions::MANAGE_TESTS);
    }

    public function update(User $user, TestAssignment $assignment): bool
    {
        return ($user->hasRole('company_admin') || $user->can(Permissions::MANAGE_TESTS)) && $this->sameTenant($user, $assignment);
    }

    public function delete(User $user, TestAssignment $assignment): bool
    {
        return ($user->hasRole('company_admin') || $user->can(Permissions::MANAGE_TESTS)) && $this->sameTenant($user, $assignment);
    }
}
