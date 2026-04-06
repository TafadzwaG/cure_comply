<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class CoursePolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COURSES) || $user->can(Permissions::ASSIGN_TRAINING);
    }

    public function view(User $user, Course $course): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }

    public function update(User $user, Course $course): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }

    public function delete(User $user, Course $course): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }
}
