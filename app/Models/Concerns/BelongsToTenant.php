<?php

namespace App\Models\Concerns;

use App\Models\Tenant;
use App\Services\CurrentTenantResolver;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::creating(function (Model $model) {
            if (! $model->tenant_id && current_tenant()) {
                $model->tenant_id = current_tenant()?->id;
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenant = app(CurrentTenantResolver::class)->current();
            $user = auth()->user();

            if (! $tenant || ($user && $user->isSuperAdmin())) {
                return;
            }

            $builder->where($builder->qualifyColumn('tenant_id'), $tenant->id);
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scopeForCurrentTenant(Builder $query): Builder
    {
        if ($tenant = current_tenant()) {
            $query->where($query->qualifyColumn('tenant_id'), $tenant->id);
        }

        return $query;
    }
}
