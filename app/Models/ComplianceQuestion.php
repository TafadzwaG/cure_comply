<?php

namespace App\Models;

use App\Enums\ComplianceAnswerType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceQuestion extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'compliance_section_id',
        'code',
        'question_text',
        'answer_type',
        'weight',
        'requires_evidence',
        'guidance_text',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'answer_type' => ComplianceAnswerType::class,
            'requires_evidence' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(ComplianceSection::class, 'compliance_section_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(ComplianceResponse::class);
    }
}
