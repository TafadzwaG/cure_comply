<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\TenantBrandingUpdateRequest;
use App\Models\Tenant;
use App\Services\AuditLogService;
use App\Support\TenantBranding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TenantBrandingController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {
    }

    public function edit(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user, 403);

        $tenant = $this->resolveTenant($request);

        if ($tenant) {
            $this->authorize('updateBranding', $tenant);
        } elseif (! $user->isSuperAdmin()) {
            abort(403);
        }

        return Inertia::render('settings/branding', [
            'selectedTenant' => $tenant,
            'tenantOptions' => $user->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name', 'status'])
                : [],
            'defaults' => TenantBranding::payload(null),
        ]);
    }

    public function update(TenantBrandingUpdateRequest $request): RedirectResponse
    {
        $tenant = $request->resolvedTenant() ?? $this->resolveTenant($request);

        abort_unless($tenant, 403, 'A tenant context is required to update branding.');
        $this->authorize('updateBranding', $tenant);

        $oldValues = $tenant->toArray();
        $validated = $request->validated();

        $updates = [
            'primary_color' => $validated['primary_color'] ?? null,
        ];

        if (($validated['remove_logo'] ?? false) && $tenant->logo_path) {
            Storage::disk('public')->delete($tenant->logo_path);
            $updates['logo_path'] = null;
        }

        if ($request->hasFile('logo')) {
            if ($tenant->logo_path) {
                Storage::disk('public')->delete($tenant->logo_path);
            }

            $updates['logo_path'] = $request->file('logo')->store('tenant-branding', 'public');
        }

        $tenant->update($updates);
        $this->auditLogService->logModelUpdated('tenant_branding_updated', $tenant->fresh(), $oldValues);

        return back()->with('success', 'Tenant branding updated.');
    }

    protected function resolveTenant(Request $request): ?Tenant
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        if ($user->isSuperAdmin()) {
            $tenantId = $request->query('tenant_id');

            return $tenantId ? Tenant::query()->find($tenantId) : null;
        }

        return $user->tenant;
    }
}
