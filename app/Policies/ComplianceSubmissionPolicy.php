<?php

namespace App\Policies;

use App\Models\ComplianceSubmission;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class ComplianceSubmissionPolicy
{
    use HandlesPlatformAuthorization {
        before as protected platformBefore;
    }

    public function before(User $user, string $ability): ?bool
    {
        if ($ability === 'respond') {
            return null;
        }

        return $this->platformBefore($user, $ability);
    }

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS) || $user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS);
    }

    public function view(User $user, ComplianceSubmission $complianceSubmission): bool
    {
        if ($user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS)) {
            return $this->sameTenant($user, $complianceSubmission);
        }

        return $user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS)
            && $this->sameTenant($user, $complianceSubmission)
            && $this->assignedToUserByManager($user, $complianceSubmission);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS);
    }

    public function update(User $user, ComplianceSubmission $complianceSubmission): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS) && $this->sameTenant($user, $complianceSubmission);
    }

    public function respond(User $user, ComplianceSubmission $complianceSubmission): bool
    {
        if (! $this->sameTenant($user, $complianceSubmission)) {
            return false;
        }

        if ($user->hasRole('company_admin')) {
            return true;
        }

        return $user->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS)
            && $this->sameTenant($user, $complianceSubmission)
            && $this->assignedToUserByManager($user, $complianceSubmission);
    }

    public function delete(User $user, ComplianceSubmission $complianceSubmission): bool
    {
        return $user->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS) && $this->sameTenant($user, $complianceSubmission);
    }

    protected function assignedToUserByManager(User $user, ComplianceSubmission $complianceSubmission): bool
    {
        return $complianceSubmission->assignments()
            ->where('assigned_to_user_id', $user->id)
            ->whereHas('assigner', fn ($query) => $query->role(['company_admin', 'super_admin']))
            ->exists();
    }
}
