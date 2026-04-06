<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AuditLog::class);

        $filters = $this->validateIndex($request, ['action', 'entity_type', 'created_at'], [
            'action' => ['nullable', 'string'],
            'entity_type' => ['nullable', 'string'],
        ]);

        $query = AuditLog::query()->with(['user', 'tenant']);
        $this->applySearch($query, $filters['search'] ?? null, ['action', 'entity_type', 'user.name']);
        $this->applyFilters($query, $filters, [
            'action' => 'action',
            'entity_type' => 'entity_type',
        ]);
        $this->applySort($query, [
            'action' => 'action',
            'entity_type' => 'entity_type',
            'created_at' => 'created_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        return Inertia::render('audit-logs/index', [
            'logs' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => AuditLog::query()->count(),
                'today' => AuditLog::query()->whereDate('created_at', today())->count(),
                'impersonation' => AuditLog::query()->where('action', 'like', '%impersonat%')->count(),
                'reviews' => AuditLog::query()->where('action', 'like', '%review%')->count(),
                'system' => AuditLog::query()->whereNull('user_id')->count(),
            ],
            'actions' => AuditLog::query()->select('action')->distinct()->orderBy('action')->pluck('action')->values(),
            'entityTypes' => AuditLog::query()->select('entity_type')->distinct()->orderBy('entity_type')->pluck('entity_type')->values(),
        ]);
    }
}
