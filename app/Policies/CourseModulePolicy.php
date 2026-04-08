<?php

namespace App\Policies;

use App\Models\CourseModule;
use App\Models\User;
use App\Support\Permissions;

class CourseModulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COURSES) || $user->can(Permissions::ASSIGN_TRAINING);
    }

    public function view(User $user, CourseModule $courseModule): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }

    public function update(User $user, CourseModule $courseModule): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }

    public function delete(User $user, CourseModule $courseModule): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }
}
