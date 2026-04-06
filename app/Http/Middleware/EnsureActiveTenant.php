<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->isSuperAdmin()) {
            return $next($request);
        }

        $tenant = current_tenant();

        abort_if(! $tenant, 403, 'Tenant context could not be resolved.');

        if ($tenant->status?->value !== 'active' && ! $request->routeIs('tenant.activation.pending')) {
            return redirect()->route('tenant.activation.pending');
        }

        return $next($request);
    }
}
