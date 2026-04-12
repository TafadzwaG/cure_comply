<?php

namespace App\Models;

use App\Enums\PolicyAssignmentStatus;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PolicyAssignment extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'library_file_id',
        'library_file_version_id',
        'assigned_to_user_id',
        'assigned_by',
        'source_type',
        'source_department_id',
        'due_date',
        'status',
        'first_viewed_at',
        'last_viewed_at',
        'acknowledged_at',
        'last_reminded_at',
        'view_count',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'status' => PolicyAssignmentStatus::class,
            'first_viewed_at' => 'datetime',
            'last_viewed_at' => 'datetime',
            'acknowledged_at' => 'datetime',
            'last_reminded_at' => 'datetime',
            'view_count' => 'integer',
        ];
    }

    public function libraryFile(): BelongsTo
    {
        return $this->belongsTo(LibraryFile::class);
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(LibraryFileVersion::class, 'library_file_version_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function sourceDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'source_department_id');
    }
}
