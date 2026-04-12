<?php

namespace App\Policies;

use App\Models\ExportRequest;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class ExportRequestPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::EXPORT_REPORTS);
    }

    public function view(User $user, ExportRequest $exportRequest): bool
    {
        return $user->can(Permissions::EXPORT_REPORTS)
            && ($exportRequest->user_id === $user->id || $user->isSuperAdmin())
            && ($user->isSuperAdmin() || $this->sameTenant($user, $exportRequest));
    }
}
