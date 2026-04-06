<?php

namespace App\Policies;

use App\Models\CourseAssignment;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class CourseAssignmentPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::ASSIGN_TRAINING) || $user->can(Permissions::TAKE_TESTS);
    }

    public function view(User $user, CourseAssignment $courseAssignment): bool
    {
        return $courseAssignment->assigned_to_user_id === $user->id
            || ($user->can(Permissions::ASSIGN_TRAINING) && $this->sameTenant($user, $courseAssignment));
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::ASSIGN_TRAINING);
    }

    public function update(User $user, CourseAssignment $courseAssignment): bool
    {
        return $user->can(Permissions::ASSIGN_TRAINING) && $this->sameTenant($user, $courseAssignment);
    }

    public function delete(User $user, CourseAssignment $courseAssignment): bool
    {
        return $user->can(Permissions::ASSIGN_TRAINING) && $this->sameTenant($user, $courseAssignment);
    }
}
