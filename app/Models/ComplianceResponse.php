<?php

namespace App\Models;

use App\Enums\ComplianceResponseStatus;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceResponse extends Model
{
    use BelongsToTenant;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'compliance_submission_id',
        'compliance_question_id',
        'answer_value',
        'answer_text',
        'comment_text',
        'response_score',
        'status',
        'answered_by',
        'answered_at',
    ];

    protected function casts(): array
    {
        return [
            'answered_at' => 'datetime',
            'status' => ComplianceResponseStatus::class,
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(ComplianceSubmission::class, 'compliance_submission_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(ComplianceQuestion::class, 'compliance_question_id');
    }

    public function answeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'answered_by');
    }

    public function evidenceFiles(): HasMany
    {
        return $this->hasMany(EvidenceFile::class);
    }
}
