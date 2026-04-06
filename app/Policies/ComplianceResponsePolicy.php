<?php

namespace App\Policies;

use App\Models\ComplianceResponse;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class ComplianceResponsePolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS) || $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS);
    }

    public function view(User $user, ComplianceResponse $complianceResponse): bool
    {
        return ($user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS) || $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS))
            && $this->sameTenant($user, $complianceResponse);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS) || $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS);
    }

    public function update(User $user, ComplianceResponse $complianceResponse): bool
    {
        return ($user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS) || $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS))
            && $this->sameTenant($user, $complianceResponse);
    }
}
