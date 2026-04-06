<?php

namespace App\Policies;

use App\Models\EvidenceFile;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class EvidenceFilePolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::UPLOAD_EVIDENCE) || $user->can(Permissions::REVIEW_EVIDENCE);
    }

    public function view(User $user, EvidenceFile $evidenceFile): bool
    {
        return ($user->can(Permissions::UPLOAD_EVIDENCE) || $user->can(Permissions::REVIEW_EVIDENCE))
            && $this->sameTenant($user, $evidenceFile);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::UPLOAD_EVIDENCE);
    }

    public function update(User $user, EvidenceFile $evidenceFile): bool
    {
        return $user->can(Permissions::UPLOAD_EVIDENCE) && $this->sameTenant($user, $evidenceFile);
    }

    public function delete(User $user, EvidenceFile $evidenceFile): bool
    {
        return $user->can(Permissions::UPLOAD_EVIDENCE) && $this->sameTenant($user, $evidenceFile);
    }
}
