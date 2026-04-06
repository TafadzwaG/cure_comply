<?php

namespace App\Models;

use App\Enums\EvidenceReviewStatus;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvidenceFile extends Model
{
    use BelongsToTenant;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'compliance_submission_id',
        'compliance_response_id',
        'file_name',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
        'uploaded_by',
        'uploaded_at',
        'review_status',
    ];

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
            'review_status' => EvidenceReviewStatus::class,
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(ComplianceSubmission::class, 'compliance_submission_id');
    }

    public function response(): BelongsTo
    {
        return $this->belongsTo(ComplianceResponse::class, 'compliance_response_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(EvidenceReview::class);
    }
}
