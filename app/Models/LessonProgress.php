<?php

namespace App\Models;

use App\Enums\CourseAssignmentStatus;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonProgress extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected $table = 'lesson_progress';

    protected $fillable = [
        'tenant_id',
        'lesson_id',
        'user_id',
        'completed_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
            'status' => CourseAssignmentStatus::class,
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
