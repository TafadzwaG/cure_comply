<?php

namespace App\Policies;

use App\Models\EmployeeProfile;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class EmployeeProfilePolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function view(User $user, EmployeeProfile $employeeProfile): bool
    {
        return $employeeProfile->user_id === $user->id
            || ($user->can(Permissions::MANAGE_USERS) && $this->sameTenant($user, $employeeProfile));
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function update(User $user, EmployeeProfile $employeeProfile): bool
    {
        return $user->can(Permissions::MANAGE_USERS) && $this->sameTenant($user, $employeeProfile);
    }

    public function delete(User $user, EmployeeProfile $employeeProfile): bool
    {
        return $user->can(Permissions::MANAGE_USERS) && $this->sameTenant($user, $employeeProfile);
    }
}
