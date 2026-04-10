<?php

namespace App\Policies;

use App\Models\Tenant;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class TenantPolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TENANTS);
    }

    public function view(User $user, Tenant $tenant): bool
    {
        return $user->can(Permissions::MANAGE_TENANTS) || $tenant->id === $user->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TENANTS);
    }

    public function update(User $user, Tenant $tenant): bool
    {
        return $user->can(Permissions::MANAGE_TENANTS);
    }

    public function updateBranding(User $user, Tenant $tenant): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $tenant->id === $user->tenant_id && $user->hasRole('company_admin');
    }

    public function delete(User $user, Tenant $tenant): bool
    {
        return $user->can(Permissions::MANAGE_TENANTS);
    }

    public function activate(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin();
    }

    public function deactivate(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin();
    }
}
