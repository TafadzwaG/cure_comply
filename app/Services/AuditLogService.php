<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogService
{
    public function log(string $action, string $entityType, ?int $entityId = null, array $oldValues = [], array $newValues = [], ?Request $request = null): AuditLog
    {
        $request ??= request();

        return AuditLog::query()->create([
            'tenant_id' => current_tenant()?->id ?? $request->user()?->tenant_id,
            'user_id' => $request->user()?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues ?: null,
            'new_values' => $newValues ?: null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }

    public function logModel(string $action, Model $model, array $oldValues = [], array $newValues = []): AuditLog
    {
        return $this->log($action, $model::class, $model->getKey(), $oldValues, $newValues);
    }
}
