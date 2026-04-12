<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Tenant;
use App\Models\User;
use App\Services\PlatformSettingsService;
use App\Support\TenantBranding;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(protected PlatformSettingsService $platformSettingsService)
    {
    }

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = (bool) $user?->isSuperAdmin();
        $canManageBranding = (bool) ($isSuperAdmin || $user?->hasRole('company_admin'));
        $selectedBrandingTenant = $this->resolveBrandingTenant($request);

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'settingsAccess' => [
                'canManageTenantNotifications' => $isSuperAdmin,
                'canManageBranding' => $canManageBranding,
            ],
            'platformNotificationSettings' => $isSuperAdmin
                ? $this->platformSettingsService->getTenantRegistrationRecipients()
                : null,
            'platformRecipientUsers' => $isSuperAdmin
                ? User::query()
                    ->whereHas('roles', fn ($query) => $query->where('name', 'super_admin'))
                    ->orderBy('name')
                    ->get(['id', 'name', 'email'])
                : [],
            'pendingTenantCount' => $isSuperAdmin
                ? Tenant::query()->where('status', 'pending')->count()
                : 0,
            'brandingSelectedTenant' => $selectedBrandingTenant
                ? [
                    ...$selectedBrandingTenant->only(['id', 'name', 'status', 'logo_url', 'logo_path', 'primary_color']),
                    'branding' => TenantBranding::payload($selectedBrandingTenant),
                ]
                : null,
            'brandingTenantOptions' => $isSuperAdmin
                ? Tenant::query()->orderBy('name')->get(['id', 'name', 'status'])
                : [],
            'brandingDefaults' => TenantBranding::payload(null),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    protected function resolveBrandingTenant(Request $request): ?Tenant
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        if ($user->isSuperAdmin()) {
            $tenantId = $request->integer('branding_tenant_id');

            return $tenantId ? Tenant::query()->find($tenantId) : null;
        }

        return $user->tenant;
    }
}
