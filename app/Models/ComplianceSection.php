<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceSection extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'compliance_framework_id',
        'name',
        'description',
        'sort_order',
        'weight',
    ];

    public function framework(): BelongsTo
    {
        return $this->belongsTo(ComplianceFramework::class, 'compliance_framework_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ComplianceQuestion::class);
    }
}
