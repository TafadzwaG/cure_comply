<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppNotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AppNotification::class);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'in:created_at,title,type'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'in:10,25,50,100'],
        ]);

        $query = AppNotification::query()
            ->with('tenant')
            ->where('user_id', $request->user()?->id);

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($builder) => $builder
                ->where('title', 'like', "%{$search}%")
                ->orWhere('message', 'like', "%{$search}%")
                ->orWhere('type', 'like', "%{$search}%"));
        }

        if (($filters['status'] ?? null) === 'unread') {
            $query->where('is_read', false);
        }

        if (($filters['status'] ?? null) === 'read') {
            $query->where('is_read', true);
        }

        if ($type = ($filters['type'] ?? null)) {
            $query->where('type', $type);
        }

        $query->orderBy($filters['sort'] ?? 'created_at', ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc');

        return Inertia::render('notifications/index', [
            'notifications' => $query->paginate((int) ($filters['per_page'] ?? 25))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => AppNotification::query()->where('user_id', $request->user()?->id)->count(),
                'unread' => AppNotification::query()->where('user_id', $request->user()?->id)->where('is_read', false)->count(),
                'recent' => AppNotification::query()->where('user_id', $request->user()?->id)->where('created_at', '>=', now()->subDays(7))->count(),
                'read' => AppNotification::query()->where('user_id', $request->user()?->id)->where('is_read', true)->count(),
            ],
            'types' => AppNotification::query()->where('user_id', $request->user()?->id)->select('type')->distinct()->orderBy('type')->pluck('type')->values(),
        ]);
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        AppNotification::query()
            ->where('user_id', $request->user()?->id)
            ->where('is_read', false)
            ->update($this->readPayload());

        return back()->with('success', 'All notifications marked as read.');
    }

    public function open(AppNotification $appNotification): RedirectResponse
    {
        $this->authorize('update', $appNotification);

        if (! $appNotification->is_read) {
            $appNotification->update($this->readPayload());
        }

        return $appNotification->action_url
            ? redirect()->to($appNotification->action_url)
            : redirect()->route('notifications.index');
    }

    public function update(AppNotification $appNotification): RedirectResponse
    {
        $this->authorize('update', $appNotification);
        $appNotification->update($this->readPayload());

        return back()->with('success', 'Notification marked as read.');
    }

    protected function readPayload(): array
    {
        return [
            'is_read' => true,
            'read_at' => now(),
        ];
    }
}
