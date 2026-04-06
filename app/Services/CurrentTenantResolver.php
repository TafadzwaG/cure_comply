<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Http\Request;

class CurrentTenantResolver
{
    protected ?Tenant $tenant = null;

    public function current(): ?Tenant
    {
        if ($this->tenant) {
            return $this->tenant;
        }

        /** @var Request $request */
        $request = app('request');
        $user = $request->user();

        if ($user?->tenant_id) {
            $this->tenant = $user->tenant;
        }

        return $this->tenant;
    }

    public function set(?Tenant $tenant): void
    {
        $this->tenant = $tenant;
    }
}
