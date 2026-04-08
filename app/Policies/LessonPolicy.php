<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;
use App\Support\Permissions;

class LessonPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COURSES) || $user->can(Permissions::ASSIGN_TRAINING);
    }

    public function view(User $user, Lesson $lesson): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }

    public function update(User $user, Lesson $lesson): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }

    public function delete(User $user, Lesson $lesson): bool
    {
        return $user->can(Permissions::MANAGE_COURSES);
    }
}
