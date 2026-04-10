<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PlatformSettingsUpdateRequest;
use App\Models\Tenant;
use App\Models\User;
use App\Services\PlatformSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformSettingsController extends Controller
{
    public function __construct(protected PlatformSettingsService $platformSettingsService)
    {
    }

    public function edit(Request $request): Response
    {
        abort_unless($request->user()?->isSuperAdmin(), 403);

        return Inertia::render('settings/platform', [
            'settings' => $this->platformSettingsService->getTenantRegistrationRecipients(),
            'recipientUsers' => User::query()
                ->whereHas('roles', fn ($query) => $query->where('name', 'super_admin'))
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'pendingTenants' => Tenant::query()
                ->where('status', 'pending')
                ->latest()
                ->limit(8)
                ->get(['id', 'name', 'contact_name', 'contact_email', 'status', 'created_at']),
        ]);
    }

    public function update(PlatformSettingsUpdateRequest $request): RedirectResponse
    {
        abort_unless($request->user()?->isSuperAdmin(), 403);

        $validated = $request->validated();

        $this->platformSettingsService->saveTenantRegistrationRecipients(
            $validated['recipient_user_ids'] ?? [],
            $validated['recipient_emails'] ?? [],
        );

        return back()->with('success', 'Platform notification settings updated.');
    }
}
