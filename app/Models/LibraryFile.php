<?php

namespace App\Models;

use App\Enums\PolicyState;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class LibraryFile extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const CATEGORY_LAW = 'Law & Regulation';
    public const CATEGORY_POLICY = 'Policy';
    public const CATEGORY_TEMPLATE = 'Template';
    public const CATEGORY_GUIDE = 'Guide';
    public const CATEGORY_REFERENCE = 'Reference';
    public const CATEGORY_OTHER = 'Other';

    protected $fillable = [
        'tenant_id',
        'title',
        'description',
        'category',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
        'uploaded_by',
        'is_policy',
        'policy_state',
        'current_policy_version_id',
        'current_policy_version_number',
    ];

    protected function casts(): array
    {
        return [
            'is_policy' => 'boolean',
            'policy_state' => PolicyState::class,
        ];
    }

    public static function categoryOptions(): array
    {
        return [
            self::CATEGORY_LAW,
            self::CATEGORY_POLICY,
            self::CATEGORY_TEMPLATE,
            self::CATEGORY_GUIDE,
            self::CATEGORY_REFERENCE,
            self::CATEGORY_OTHER,
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function currentPolicyVersion(): BelongsTo
    {
        return $this->belongsTo(LibraryFileVersion::class, 'current_policy_version_id');
    }

    public function policyVersions(): HasMany
    {
        return $this->hasMany(LibraryFileVersion::class)->orderByDesc('version_number');
    }

    public function policyAssignments(): HasMany
    {
        return $this->hasMany(PolicyAssignment::class);
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($user) {
            $builder->whereNull('tenant_id');

            if ($user->tenant_id) {
                $builder->orWhere('tenant_id', $user->tenant_id);
            }
        });
    }

    public function scopeShared(Builder $query): Builder
    {
        return $query->whereNull('tenant_id');
    }

    public function scopeTenantScoped(Builder $query): Builder
    {
        return $query->whereNotNull('tenant_id');
    }

    public function scopePublishedPolicies(Builder $query): Builder
    {
        return $query->where('is_policy', true)->where('policy_state', PolicyState::Published->value);
    }
}
