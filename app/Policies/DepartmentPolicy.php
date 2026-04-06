<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class DepartmentPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_DEPARTMENTS);
    }

    public function view(User $user, Department $department): bool
    {
        return $user->can(Permissions::MANAGE_DEPARTMENTS) && $this->sameTenant($user, $department);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_DEPARTMENTS);
    }

    public function update(User $user, Department $department): bool
    {
        return $user->can(Permissions::MANAGE_DEPARTMENTS) && $this->sameTenant($user, $department);
    }

    public function delete(User $user, Department $department): bool
    {
        return $user->can(Permissions::MANAGE_DEPARTMENTS) && $this->sameTenant($user, $department);
    }
}
