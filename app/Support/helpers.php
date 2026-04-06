<?php

use App\Models\Tenant;
use App\Services\CurrentTenantResolver;

if (! function_exists('current_tenant')) {
    function current_tenant(): ?Tenant
    {
        return app(CurrentTenantResolver::class)->current();
    }
}
