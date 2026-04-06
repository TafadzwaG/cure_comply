<?php

namespace App\Models;

use App\Enums\ComplianceRating;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceScore extends Model
{
    use BelongsToTenant;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'compliance_submission_id',
        'overall_score',
        'rating',
        'calculated_at',
        'calculated_by',
    ];

    protected function casts(): array
    {
        return [
            'calculated_at' => 'datetime',
            'rating' => ComplianceRating::class,
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(ComplianceSubmission::class, 'compliance_submission_id');
    }

    public function calculatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }
}
