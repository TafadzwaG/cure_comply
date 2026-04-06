<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmployeeProfileIsComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user()?->loadMissing('employeeProfile');

        if (! $user || ! $user->requiresProfileCompletion()) {
            return $next($request);
        }

        if ($request->routeIs('employee-profile.complete.*')) {
            return $next($request);
        }

        return redirect()->route('employee-profile.complete.edit');
    }
}
