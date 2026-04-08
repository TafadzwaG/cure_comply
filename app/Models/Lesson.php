<?php

namespace App\Models;

use App\Enums\LessonStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $appends = ['file_url', 'embed_url'];

    protected $fillable = [
        'course_module_id',
        'title',
        'content_type',
        'content_body',
        'file_path',
        'video_url',
        'sort_order',
        'estimated_minutes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => LessonStatus::class,
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'course_module_id');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->file_path) : null;
    }

    public function getEmbedUrlAttribute(): ?string
    {
        return \App\Support\TrustedVideoEmbed::normalize($this->video_url);
    }
}
