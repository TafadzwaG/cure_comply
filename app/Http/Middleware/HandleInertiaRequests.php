<?php

namespace App\Http\Middleware;

use App\Models\AppNotification;
use App\Models\ExportRequest;
use App\Models\User;
use App\Support\TenantBranding;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $impersonatorId = session('impersonated_by');

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user()?->loadMissing('roles', 'tenant', 'employeeProfile.department'),
                'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? [],
            ],
            'tenant' => current_tenant(),
            'branding' => fn () => TenantBranding::payload(current_tenant()),
            'impersonation' => [
                'active' => session()->has('impersonated_by'),
                'impersonator_id' => $impersonatorId,
                'impersonator_name' => $impersonatorId
                    ? User::query()->whereKey($impersonatorId)->value('name')
                    : null,
            ],
            'notifications' => fn () => $request->user()
                ? AppNotification::query()
                    ->where('user_id', $request->user()->id)
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'title', 'message', 'type', 'action_url', 'is_read', 'read_at', 'created_at'])
                : [],
            'notification_unread_count' => fn () => $request->user()
                ? AppNotification::query()->where('user_id', $request->user()->id)->where('is_read', false)->count()
                : 0,
            'recent_exports' => fn () => $request->user()
                ? ExportRequest::query()
                    ->where('user_id', $request->user()->id)
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'source', 'format', 'status', 'file_name', 'completed_at', 'created_at'])
                    ->map(fn (ExportRequest $export) => [
                        'id' => $export->id,
                        'source' => $export->source,
                        'format' => $export->format,
                        'status' => $export->status,
                        'file_name' => $export->file_name,
                        'completed_at' => optional($export->completed_at)?->toISOString(),
                        'created_at' => optional($export->created_at)?->toISOString(),
                        'download_url' => $export->status === 'completed' ? route('exports.download', $export, false) : null,
                    ])
                : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'pendingFrameworks' => fn () => $request->session()->get('pendingFrameworks'),
            ],
        ]);
    }
}
