<?php

namespace App\Http\Middleware;

use App\Services\CurrentTenantResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveCurrentTenant
{
    public function __construct(protected CurrentTenantResolver $resolver)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $this->resolver->set($request->user()?->tenant);

        return $next($request);
    }
}
