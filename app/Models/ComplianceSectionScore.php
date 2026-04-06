<?php

namespace App\Models;

use App\Enums\ComplianceRating;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceSectionScore extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'compliance_submission_id',
        'compliance_section_id',
        'score',
        'rating',
        'calculated_at',
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

    public function section(): BelongsTo
    {
        return $this->belongsTo(ComplianceSection::class, 'compliance_section_id');
    }
}
