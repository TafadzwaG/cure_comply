<?php

namespace App\Policies;

use App\Models\ComplianceFramework;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class ComplianceFrameworkPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_FRAMEWORKS) || $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS);
    }

    public function view(User $user, ComplianceFramework $complianceFramework): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_FRAMEWORKS);
    }

    public function update(User $user, ComplianceFramework $complianceFramework): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_FRAMEWORKS);
    }

    public function delete(User $user, ComplianceFramework $complianceFramework): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_FRAMEWORKS);
    }
}
