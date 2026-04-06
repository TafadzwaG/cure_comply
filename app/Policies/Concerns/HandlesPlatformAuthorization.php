<?php

namespace App\Policies\Concerns;

use App\Models\User;

trait HandlesPlatformAuthorization
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    protected function sameTenant(User $user, mixed $record): bool
    {
        return isset($record->tenant_id) && (int) $record->tenant_id === (int) $user->tenant_id;
    }
}
