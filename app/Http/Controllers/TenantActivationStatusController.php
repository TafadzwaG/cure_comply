<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TenantActivationStatusController extends Controller
{
    public function __invoke(): Response|RedirectResponse
    {
        $tenant = current_tenant();

        abort_if(! $tenant, 403, 'Tenant context could not be resolved.');

        if ($tenant->status?->value === 'active') {
            return to_route('dashboard');
        }

        return Inertia::render('auth/tenant-activation-pending', [
            'tenant' => [
                'name' => $tenant->name,
                'contact_name' => $tenant->contact_name,
                'contact_email' => $tenant->contact_email,
                'status' => $tenant->status?->value,
            ],
        ]);
    }
}
