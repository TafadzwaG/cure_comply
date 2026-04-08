<?php

namespace App\Policies;

use App\Models\Test;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class TestPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('company_admin')
            || $user->can(Permissions::MANAGE_TESTS)
            || $user->can(Permissions::TAKE_TESTS);
    }

    public function view(User $user, Test $test): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('company_admin') || $user->can(Permissions::MANAGE_TESTS);
    }

    public function update(User $user, Test $test): bool
    {
        return $user->hasRole('company_admin') || $user->can(Permissions::MANAGE_TESTS);
    }

    public function delete(User $user, Test $test): bool
    {
        return $user->hasRole('company_admin') || $user->can(Permissions::MANAGE_TESTS);
    }
}
