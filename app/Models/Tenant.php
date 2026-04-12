<?php

namespace App\Models;

use App\Enums\TenantStatus;
use App\Support\TenantBranding;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Tenant extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'registration_number',
        'industry',
        'company_size',
        'contact_name',
        'contact_email',
        'contact_phone',
        'logo_path',
        'primary_color',
        'status',
    ];

    protected $appends = [
        'logo_url',
        'branding',
    ];

    protected function casts(): array
    {
        return [
            'status' => TenantStatus::class,
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function employeeProfiles(): HasMany
    {
        return $this->hasMany(EmployeeProfile::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(CourseAssignment::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ComplianceSubmission::class);
    }

    public function policyAssignments(): HasMany
    {
        return $this->hasMany(PolicyAssignment::class);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (blank($this->logo_path)) {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    public function getBrandingAttribute(): array
    {
        return TenantBranding::payload($this);
    }
}
