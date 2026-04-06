<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogImpersonationActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasSession() && $request->session()->has('impersonated_by')) {
            AuditLog::query()->firstOrCreate([
                'tenant_id' => $request->user()?->tenant_id,
                'user_id' => $request->user()?->id,
                'action' => 'impersonation_active',
                'entity_type' => 'user',
                'entity_id' => $request->user()?->id,
            ], [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return $next($request);
    }
}
