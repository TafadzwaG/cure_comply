<?php

namespace App\Policies;

use App\Models\EvidenceReview;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class EvidenceReviewPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::REVIEW_EVIDENCE);
    }

    public function view(User $user, EvidenceReview $evidenceReview): bool
    {
        return $user->can(Permissions::REVIEW_EVIDENCE)
            && $evidenceReview->evidenceFile
            && $this->sameTenant($user, $evidenceReview->evidenceFile);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::REVIEW_EVIDENCE);
    }

    public function update(User $user, EvidenceReview $evidenceReview): bool
    {
        return $this->view($user, $evidenceReview);
    }
}
