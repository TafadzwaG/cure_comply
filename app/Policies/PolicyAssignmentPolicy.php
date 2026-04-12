<?php

namespace App\Policies;

use App\Models\PolicyAssignment;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class PolicyAssignmentPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::VIEW_POLICIES)
            || $user->can(Permissions::ASSIGN_POLICIES)
            || $user->can(Permissions::MANAGE_POLICIES);
    }

    public function view(User $user, PolicyAssignment $policyAssignment): bool
    {
        if (! $this->viewAny($user)) {
            return false;
        }

        if ((int) $policyAssignment->assigned_to_user_id === (int) $user->id) {
            return true;
        }

        return $this->sameTenant($user, $policyAssignment)
            && ($user->can(Permissions::ASSIGN_POLICIES) || $user->can(Permissions::MANAGE_POLICIES));
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::ASSIGN_POLICIES);
    }

    public function acknowledge(User $user, PolicyAssignment $policyAssignment): bool
    {
        return $user->can(Permissions::ACKNOWLEDGE_POLICIES)
            && (int) $policyAssignment->assigned_to_user_id === (int) $user->id;
    }
}
