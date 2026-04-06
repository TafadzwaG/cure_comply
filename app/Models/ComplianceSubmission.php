<?php

namespace App\Models;

use App\Enums\ComplianceSubmissionStatus;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceSubmission extends Model
{
    use BelongsToTenant;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'compliance_framework_id',
        'title',
        'reporting_period',
        'status',
        'submitted_by',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'status' => ComplianceSubmissionStatus::class,
        ];
    }

    public function framework(): BelongsTo
    {
        return $this->belongsTo(ComplianceFramework::class, 'compliance_framework_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(ComplianceResponse::class);
    }

    public function evidenceFiles(): HasMany
    {
        return $this->hasMany(EvidenceFile::class);
    }

    public function score(): HasOne
    {
        return $this->hasOne(ComplianceScore::class);
    }

    public function sectionScores(): HasMany
    {
        return $this->hasMany(ComplianceSectionScore::class);
    }
}
