<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Models\EmployeeProfile;
use App\Models\Invitation;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\InvitationNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Throwable;

class InvitationService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected AppNotificationService $appNotificationService,
    )
    {
    }

    public function create(array $data, User $inviter): Invitation
    {
        $isPlatformAdmin = (bool) ($data['is_platform_admin'] ?? false);
        $tenantId = $this->resolveTenantId($data, $inviter, $isPlatformAdmin);
        $role = $isPlatformAdmin ? 'super_admin' : $data['role'];

        $invite = DB::transaction(function () use ($data, $inviter, $tenantId, $role) {
            $invite = Invitation::query()->create([
                'tenant_id' => $tenantId,
                'department_id' => $tenantId ? ($data['department_id'] ?? null) : null,
                'invited_by' => $inviter->id,
                'email' => $data['email'],
                'name' => $data['name'],
                'role' => $role,
                'token' => Str::uuid()->toString(),
                'expires_at' => now()->addDays(7),
            ]);

            $this->auditLogService->logModel('invitation_created', $invite, [], $invite->toArray());

            return $invite;
        });

        try {
            Notification::route('mail', $invite->email)->notify((new InvitationNotification($invite))->onQueue('mail'));

            Log::info('Invitation email queued.', [
                'invitation_id' => $invite->id,
                'tenant_id' => $invite->tenant_id,
                'email' => $invite->email,
                'queue' => 'mail',
                'invited_by' => $inviter->id,
            ]);
        } catch (Throwable $exception) {
            Log::error('Invitation email queue dispatch failed.', [
                'invitation_id' => $invite->id,
                'tenant_id' => $invite->tenant_id,
                'email' => $invite->email,
                'queue' => 'mail',
                'invited_by' => $inviter->id,
                'message' => $exception->getMessage(),
            ]);

            report($exception);
        }

        return $invite;
    }

    public function accept(Invitation $invitation, array $data): User
    {
        return DB::transaction(function () use ($invitation, $data) {
            $user = User::query()->create([
                'tenant_id' => $invitation->tenant_id,
                'name' => $data['name'] ?? $invitation->name,
                'email' => $invitation->email,
                'status' => UserStatus::Active,
                'password' => Hash::make($data['password']),
                'email_verified_at' => now(),
            ]);

            $user->assignRole($invitation->role);

            if ($invitation->role !== 'super_admin') {
                EmployeeProfile::query()->create([
                    'tenant_id' => $invitation->tenant_id,
                    'user_id' => $user->id,
                    'department_id' => $invitation->department_id,
                    'job_title' => $data['job_title'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'status' => UserStatus::Active,
                ]);
            }

            $invitation->update([
                'accepted_at' => now(),
            ]);

            $this->auditLogService->logModel('invitation_accepted', $invitation, [], ['accepted_at' => $invitation->accepted_at]);

            if ($inviter = User::query()->find($invitation->invited_by)) {
                $this->appNotificationService->sendToUser(
                    $inviter,
                    'invitation_accepted',
                    'Invitation accepted',
                    sprintf('%s accepted the invitation and now has access.', $user->name),
                    $inviter->isSuperAdmin() ? route('users.show', $user, false) : route('employees.index', [], false),
                    ['invitation_id' => $invitation->id, 'user_id' => $user->id],
                    true,
                    'Invitation accepted',
                    'Open account'
                );
            }

            return $user;
        });
    }

    protected function resolveTenantId(array $data, User $inviter, bool $isPlatformAdmin): ?int
    {
        if ($isPlatformAdmin) {
            return null;
        }

        if ($inviter->isSuperAdmin()) {
            return Tenant::query()->findOrFail($data['tenant_id'])->id;
        }

        return $inviter->tenant_id;
    }
}
