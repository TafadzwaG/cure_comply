<?php

namespace App\Models;

use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Lab404\Impersonate\Models\Impersonate;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasRoles;
    use Impersonate;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'status',
        'last_login_at',
        'last_password_changed_at',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'display_role',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'last_password_changed_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function employeeProfile(): HasOne
    {
        return $this->hasOne(EmployeeProfile::class);
    }

    public function assignedCourses(): HasMany
    {
        return $this->hasMany(CourseAssignment::class, 'assigned_to_user_id');
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function testAttempts(): HasMany
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function complianceSubmissions(): HasMany
    {
        return $this->hasMany(ComplianceSubmission::class, 'submitted_by');
    }

    public function complianceResponses(): HasMany
    {
        return $this->hasMany(ComplianceResponse::class, 'answered_by');
    }

    public function uploadedEvidence(): HasMany
    {
        return $this->hasMany(EvidenceFile::class, 'uploaded_by');
    }

    public function evidenceReviews(): HasMany
    {
        return $this->hasMany(EvidenceReview::class, 'reviewer_id');
    }

    public function notificationsFeed(): HasMany
    {
        return $this->hasMany(AppNotification::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function requiresProfileCompletion(): bool
    {
        if ($this->isSuperAdmin()) {
            return false;
        }

        $profile = $this->employeeProfile;

        if (! $profile) {
            return true;
        }

        if (blank($this->name)) {
            return true;
        }

        return blank($profile->job_title)
            || blank($profile->branch)
            || blank($profile->phone);
    }

    public function canImpersonate(): bool
    {
        return $this->isSuperAdmin();
    }

    public function canBeImpersonated(): bool
    {
        return ! $this->isSuperAdmin();
    }

    protected function displayRole(): Attribute
    {
        return Attribute::get(fn () => $this->roles->pluck('name')->first());
    }
}
