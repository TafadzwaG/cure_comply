<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryFileVersion extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'library_file_id',
        'version_number',
        'title',
        'description',
        'category',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
        'published_at',
        'published_by',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function libraryFile(): BelongsTo
    {
        return $this->belongsTo(LibraryFile::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(PolicyAssignment::class, 'library_file_version_id');
    }
}
