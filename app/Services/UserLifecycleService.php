<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserLifecycleService
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {
    }

    public function deactivate(User $user): User
    {
        return DB::transaction(function () use ($user) {
            $user->refresh();

            $oldValues = $user->toArray();
            $archivedEmail = $user->hasPlaceholderEmail()
                ? ($user->archived_email ?: null)
                : $user->email;

            $user->forceFill([
                'archived_email' => $archivedEmail,
                'email' => User::makeDeactivatedEmail($user->id),
                'status' => UserStatus::Inactive,
                'deactivated_at' => now(),
                'remember_token' => null,
            ])->save();

            if ($profile = $user->employeeProfile) {
                $profile->update(['status' => UserStatus::Inactive]);
            }

            DB::table('sessions')->where('user_id', $user->id)->delete();

            $this->auditLogService->logModelUpdated('user_deactivated', $user, $oldValues);

            return $user->fresh(['employeeProfile']);
        });
    }

    public function reactivate(User $user): User
    {
        return DB::transaction(function () use ($user) {
            $user->refresh();

            $oldValues = $user->toArray();

            $user->forceFill([
                'archived_email' => null,
                'status' => UserStatus::Active,
                'deactivated_at' => null,
            ])->save();

            if ($profile = $user->employeeProfile) {
                $profile->update(['status' => UserStatus::Active]);
            }

            $this->auditLogService->logModelUpdated('user_reactivated', $user, $oldValues);

            return $user->fresh(['employeeProfile']);
        });
    }
}
