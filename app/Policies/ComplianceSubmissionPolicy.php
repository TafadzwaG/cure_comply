<?php

namespace App\Policies;

use App\Models\ComplianceSubmission;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class ComplianceSubmissionPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS) || $user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS);
    }

    public function view(User $user, ComplianceSubmission $complianceSubmission): bool
    {
        return ($user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS) || $user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS))
            && $this->sameTenant($user, $complianceSubmission);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS);
    }

    public function update(User $user, ComplianceSubmission $complianceSubmission): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS) && $this->sameTenant($user, $complianceSubmission);
    }

    public function delete(User $user, ComplianceSubmission $complianceSubmission): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS) && $this->sameTenant($user, $complianceSubmission);
    }
}
