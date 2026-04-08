<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvidenceFileVersion extends Model
{
    protected $fillable = [
        'evidence_file_id',
        'version_number',
        'file_name',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
        'uploaded_by',
        'uploaded_at',
        'review_status',
        'review_comment',
    ];

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
            'version_number' => 'integer',
            'file_size' => 'integer',
        ];
    }

    public function evidenceFile(): BelongsTo
    {
        return $this->belongsTo(EvidenceFile::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
