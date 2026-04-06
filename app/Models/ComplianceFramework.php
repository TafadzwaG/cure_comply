<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceFramework extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'version',
        'description',
        'status',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(ComplianceSection::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ComplianceSubmission::class);
    }
}
