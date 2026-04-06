<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class AuditLogPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::VIEW_AUDIT_LOGS);
    }

    public function view(User $user, AuditLog $auditLog): bool
    {
        return $user->can(Permissions::VIEW_AUDIT_LOGS) && $this->sameTenant($user, $auditLog);
    }
}
