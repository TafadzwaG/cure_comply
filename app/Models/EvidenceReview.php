<?php

namespace App\Models;

use App\Enums\EvidenceReviewStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvidenceReview extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'evidence_file_id',
        'reviewer_id',
        'review_status',
        'review_comment',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'review_status' => EvidenceReviewStatus::class,
        ];
    }

    public function evidenceFile(): BelongsTo
    {
        return $this->belongsTo(EvidenceFile::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
