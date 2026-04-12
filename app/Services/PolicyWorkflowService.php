<?php

namespace App\Services;

use App\Enums\PolicyAssignmentStatus;
use App\Enums\PolicyState;
use App\Enums\UserStatus;
use App\Models\Department;
use App\Models\LibraryFile;
use App\Models\LibraryFileVersion;
use App\Models\PolicyAssignment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PolicyWorkflowService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected AppNotificationService $appNotificationService,
    ) {
    }

    public function publish(LibraryFile $libraryFile, User $actor): LibraryFile
    {
        $this->assertPublishableDocumentType($libraryFile);

        return DB::transaction(function () use ($libraryFile, $actor) {
            $version = $this->createVersionSnapshot($libraryFile, $actor);

            $oldValues = $libraryFile->toArray();

            $libraryFile->update([
                'is_policy' => true,
                'policy_state' => PolicyState::Published,
                'current_policy_version_id' => $version->id,
                'current_policy_version_number' => $version->version_number,
            ]);

            $this->auditLogService->logModelUpdated('policy_published', $libraryFile->fresh(), $oldValues);

            return $libraryFile->fresh(['currentPolicyVersion']);
        });
    }

    public function republish(LibraryFile $libraryFile, User $actor, string $dueDate): LibraryFile
    {
        $this->assertPublishableDocumentType($libraryFile);

        if (! $libraryFile->is_policy || ! $libraryFile->current_policy_version_id) {
            throw ValidationException::withMessages([
                'policy' => 'This file must already be published as a policy before it can be republished.',
            ]);
        }

        return DB::transaction(function () use ($libraryFile, $actor, $dueDate) {
            $previousVersionId = $libraryFile->current_policy_version_id;
            $version = $this->createVersionSnapshot($libraryFile, $actor);

            $oldValues = $libraryFile->toArray();

            $libraryFile->update([
                'is_policy' => true,
                'policy_state' => PolicyState::Published,
                'current_policy_version_id' => $version->id,
                'current_policy_version_number' => $version->version_number,
            ]);

            $this->auditLogService->logModelUpdated('policy_republished', $libraryFile->fresh(), $oldValues);

            PolicyAssignment::query()
                ->withoutGlobalScopes()
                ->where('library_file_version_id', $previousVersionId)
                ->get()
                ->unique('assigned_to_user_id')
                ->each(function (PolicyAssignment $assignment) use ($libraryFile, $version, $dueDate, $actor) {
                    $this->createAssignment(
                        $libraryFile,
                        $version,
                        User::query()->find($assignment->assigned_to_user_id),
                        $actor,
                        $dueDate,
                        $assignment->source_type,
                        $assignment->source_department_id,
                    );
                });

            return $libraryFile->fresh(['currentPolicyVersion']);
        });
    }

    public function archive(LibraryFile $libraryFile, User $actor): LibraryFile
    {
        if (! $libraryFile->is_policy) {
            throw ValidationException::withMessages([
                'policy' => 'Only published policies can be archived.',
            ]);
        }

        $oldValues = $libraryFile->toArray();
        $libraryFile->update([
            'policy_state' => PolicyState::Archived,
        ]);

        $this->auditLogService->logModelUpdated('policy_archived', $libraryFile->fresh(), $oldValues);

        return $libraryFile->fresh();
    }

    /**
     * @return array{created:int, updated:int}
     */
    public function assign(LibraryFile $libraryFile, User $actor, array $userIds, array $departmentIds, string $dueDate): array
    {
        if (! $libraryFile->is_policy || ! $libraryFile->currentPolicyVersion || $libraryFile->policy_state !== PolicyState::Published) {
            throw ValidationException::withMessages([
                'library_file_id' => 'Only published policies can be assigned.',
            ]);
        }

        $targets = $this->resolveAssignees($libraryFile, $actor, $userIds, $departmentIds);

        if ($targets->isEmpty()) {
            throw ValidationException::withMessages([
                'assigned_to_user_ids' => 'Select at least one active user or department member.',
            ]);
        }

        $created = 0;
        $updated = 0;

        DB::transaction(function () use ($targets, $libraryFile, $actor, $dueDate, &$created, &$updated) {
            $targets->each(function (array $target) use ($libraryFile, $actor, $dueDate, &$created, &$updated) {
                [$assignment, $wasCreated] = $this->createAssignment(
                    $libraryFile,
                    $libraryFile->currentPolicyVersion,
                    $target['user'],
                    $actor,
                    $dueDate,
                    $target['source_type'],
                    $target['source_department_id'],
                );

                if ($wasCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            });
        });

        return [
            'created' => $created,
            'updated' => $updated,
        ];
    }

    public function openAssignment(PolicyAssignment $policyAssignment): PolicyAssignment
    {
        $now = now();
        $oldValues = $policyAssignment->toArray();

        $policyAssignment->forceFill([
            'first_viewed_at' => $policyAssignment->first_viewed_at ?? $now,
            'last_viewed_at' => $now,
            'view_count' => $policyAssignment->view_count + 1,
            'status' => $policyAssignment->acknowledged_at
                ? PolicyAssignmentStatus::Acknowledged
                : ($policyAssignment->due_date->isPast() ? PolicyAssignmentStatus::Overdue : PolicyAssignmentStatus::Viewed),
        ])->save();

        $this->auditLogService->logModelUpdated('policy_viewed', $policyAssignment->fresh(), $oldValues);

        return $policyAssignment->fresh(['version']);
    }

    public function acknowledgeAssignment(PolicyAssignment $policyAssignment): PolicyAssignment
    {
        if ($policyAssignment->view_count < 1) {
            throw ValidationException::withMessages([
                'confirmed' => 'Open the policy document before acknowledging it.',
            ]);
        }

        $oldValues = $policyAssignment->toArray();
        $policyAssignment->forceFill([
            'status' => PolicyAssignmentStatus::Acknowledged,
            'acknowledged_at' => now(),
        ])->save();

        $this->auditLogService->logModelUpdated('policy_acknowledged', $policyAssignment->fresh(), $oldValues);

        return $policyAssignment->fresh();
    }

    public function sendOverdueReminders(): int
    {
        $sent = 0;

        PolicyAssignment::query()
            ->withoutGlobalScopes()
            ->with(['assignedTo:id,name,email,status', 'libraryFile:id,title', 'version:id,version_number'])
            ->whereIn('status', [
                PolicyAssignmentStatus::Pending,
                PolicyAssignmentStatus::Viewed,
                PolicyAssignmentStatus::Overdue,
            ])
            ->whereDate('due_date', '<', today())
            ->get()
            ->each(function (PolicyAssignment $assignment) use (&$sent) {
                $user = $assignment->assignedTo;

                if (! $user || $user->status !== UserStatus::Active) {
                    return;
                }

                $wasOverdue = $assignment->status === PolicyAssignmentStatus::Overdue;
                $shouldSend = ! $assignment->last_reminded_at || ! $assignment->last_reminded_at->isToday();

                $assignment->forceFill([
                    'status' => PolicyAssignmentStatus::Overdue,
                    'last_reminded_at' => $shouldSend ? now() : $assignment->last_reminded_at,
                ])->save();

                if (! $shouldSend) {
                    return;
                }

                $type = $wasOverdue ? 'policy_reminder_sent' : 'policy_overdue';
                $title = $wasOverdue ? 'Policy acknowledgment reminder' : 'Policy acknowledgment overdue';
                $message = $wasOverdue
                    ? sprintf('A reminder was sent for %s.', $assignment->libraryFile?->title ?? 'an assigned policy')
                    : sprintf('%s is overdue for acknowledgment.', $assignment->libraryFile?->title ?? 'An assigned policy');

                $this->appNotificationService->sendToUser(
                    $user,
                    $type,
                    $title,
                    $message,
                    route('policy-assignments.open', $assignment, false),
                    [
                        'policy_assignment_id' => $assignment->id,
                        'library_file_id' => $assignment->library_file_id,
                        'version_number' => $assignment->version?->version_number,
                    ],
                    true,
                    $title,
                    'Open policy'
                );

                $this->auditLogService->logModel('policy_reminder_sent', $assignment, [], [
                    'last_reminded_at' => optional($assignment->last_reminded_at)?->toIso8601String(),
                ]);

                $sent++;
            });

        return $sent;
    }

    protected function createVersionSnapshot(LibraryFile $libraryFile, User $actor): LibraryFileVersion
    {
        return LibraryFileVersion::query()->create([
            'library_file_id' => $libraryFile->id,
            'version_number' => ((int) $libraryFile->current_policy_version_number) + 1,
            'title' => $libraryFile->title,
            'description' => $libraryFile->description,
            'category' => $libraryFile->category,
            'original_name' => $libraryFile->original_name,
            'file_path' => $libraryFile->file_path,
            'mime_type' => $libraryFile->mime_type,
            'file_size' => $libraryFile->file_size,
            'published_at' => now(),
            'published_by' => $actor->id,
        ]);
    }

    /**
     * @return array{0:PolicyAssignment,1:bool}
     */
    protected function createAssignment(
        LibraryFile $libraryFile,
        LibraryFileVersion $version,
        ?User $assignee,
        User $actor,
        string $dueDate,
        string $sourceType,
        ?int $sourceDepartmentId = null,
    ): array {
        if (! $assignee) {
            return [new PolicyAssignment(), false];
        }

        $assignment = PolicyAssignment::query()->firstOrNew([
            'library_file_version_id' => $version->id,
            'assigned_to_user_id' => $assignee->id,
        ]);

        $wasCreated = ! $assignment->exists;
        $oldValues = $assignment->exists ? $assignment->toArray() : [];
        $dueDateValue = Carbon::parse($dueDate)->toDateString();

        if ($assignment->acknowledged_at) {
            $status = PolicyAssignmentStatus::Acknowledged;
        } elseif ($assignment->first_viewed_at) {
            $status = Carbon::parse($dueDateValue)->isPast()
                ? PolicyAssignmentStatus::Overdue
                : PolicyAssignmentStatus::Viewed;
        } else {
            $status = Carbon::parse($dueDateValue)->isPast()
                ? PolicyAssignmentStatus::Overdue
                : PolicyAssignmentStatus::Pending;
        }

        $assignment->fill([
            'tenant_id' => $assignee->tenant_id,
            'library_file_id' => $libraryFile->id,
            'library_file_version_id' => $version->id,
            'assigned_by' => $actor->id,
            'source_type' => $sourceType,
            'source_department_id' => $sourceDepartmentId,
            'due_date' => $dueDateValue,
            'status' => $status,
        ]);
        $assignment->save();

        if ($wasCreated) {
            $this->auditLogService->logModelCreated('policy_assigned', $assignment);
            $this->appNotificationService->sendToUser(
                $assignee,
                'policy_assigned',
                'New policy acknowledgment',
                sprintf('You have been assigned %s for acknowledgment.', $libraryFile->title),
                route('policy-assignments.open', $assignment, false),
                [
                    'policy_assignment_id' => $assignment->id,
                    'library_file_id' => $libraryFile->id,
                    'version_number' => $version->version_number,
                ],
                true,
                'New policy acknowledgment',
                'Open policy'
            );
        } else {
            $this->auditLogService->logModelUpdated('policy_assigned', $assignment->fresh(), $oldValues);
        }

        return [$assignment->fresh(['assignedTo', 'version']), $wasCreated];
    }

    /**
     * @return Collection<int, array{user:User,source_type:string,source_department_id:int|null}>
     */
    protected function resolveAssignees(LibraryFile $libraryFile, User $actor, array $userIds, array $departmentIds): Collection
    {
        $directUsers = User::query()
            ->withoutGlobalScopes()
            ->whereIn('id', collect($userIds)->filter()->map(fn ($id) => (int) $id)->all())
            ->where('status', UserStatus::Active->value)
            ->whereDoesntHave('roles', fn ($query) => $query->where('name', 'super_admin'))
            ->get()
            ->keyBy('id')
            ->map(fn (User $user) => [
                'user' => $user,
                'source_type' => 'user',
                'source_department_id' => null,
            ]);

        $departments = Department::query()
            ->withoutGlobalScopes()
            ->whereIn('id', collect($departmentIds)->filter()->map(fn ($id) => (int) $id)->all())
            ->with(['employeeProfiles.user.roles', 'employeeProfiles.user'])
            ->get();

        $departmentUsers = collect();

        foreach ($departments as $department) {
            foreach ($department->employeeProfiles as $profile) {
                $user = $profile->user;

                if (! $user || $user->status !== UserStatus::Active || $user->hasRole('super_admin')) {
                    continue;
                }

                $departmentUsers->put($user->id, [
                    'user' => $user,
                    'source_type' => 'department',
                    'source_department_id' => $department->id,
                ]);
            }
        }

        $targets = $departmentUsers->merge($directUsers)->keyBy(fn (array $target) => $target['user']->id);
        $fixedTenantId = $libraryFile->tenant_id ?: ($actor->isSuperAdmin() ? null : $actor->tenant_id);

        if ($fixedTenantId) {
            $outsideTenant = $targets->contains(fn (array $target) => (int) $target['user']->tenant_id !== (int) $fixedTenantId)
                || $departments->contains(fn (Department $department) => (int) $department->tenant_id !== (int) $fixedTenantId);

            if ($outsideTenant) {
                throw ValidationException::withMessages([
                    'assigned_to_user_ids' => 'Selected users and departments must belong to the same tenant as the policy audience.',
                ]);
            }
        } elseif (! $actor->isSuperAdmin()) {
            $outsideTenant = $targets->contains(fn (array $target) => (int) $target['user']->tenant_id !== (int) $actor->tenant_id);

            if ($outsideTenant) {
                throw ValidationException::withMessages([
                    'assigned_to_user_ids' => 'You can only assign policies inside your own tenant.',
                ]);
            }
        }

        return $targets->values();
    }

    protected function assertPublishableDocumentType(LibraryFile $libraryFile): void
    {
        if (! in_array(strtolower(pathinfo($libraryFile->original_name, PATHINFO_EXTENSION)), ['pdf', 'doc', 'docx'], true)) {
            throw ValidationException::withMessages([
                'policy' => 'Only PDF and Word documents can be published as acknowledgment-tracked policies.',
            ]);
        }

        if (! Storage::disk('private')->exists($libraryFile->file_path)) {
            throw ValidationException::withMessages([
                'policy' => 'The underlying file could not be found on private storage.',
            ]);
        }
    }
}
