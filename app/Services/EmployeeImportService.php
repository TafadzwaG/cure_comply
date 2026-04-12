<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Invitation;
use App\Models\User;
use App\Notifications\InvitationNotification;
use DateTimeInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use OpenSpout\Reader\Common\Creator\ReaderFactory;
use Throwable;

class EmployeeImportService
{
    protected const REQUIRED_HEADERS = ['name', 'email'];

    protected const ALLOWED_ROLES = ['employee', 'reviewer', 'company_admin'];

    protected const ALLOWED_RISK_LEVELS = ['low', 'medium', 'high'];

    public function __construct(
        protected InvitationService $invitationService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function import(UploadedFile $file, User $actor, int $tenantId): array
    {
        $rows = $this->readSpreadsheet($file, $tenantId);

        if ($rows === []) {
            throw ValidationException::withMessages([
                'file' => 'The spreadsheet does not contain any employee rows.',
            ]);
        }

        return DB::transaction(function () use ($rows, $actor, $tenantId): array {
            $summary = [
                'updated' => 0,
                'invited' => 0,
                'resent' => 0,
            ];

            foreach ($rows as $row) {
                $existingUser = User::query()
                    ->with(['employeeProfile', 'roles'])
                    ->whereRaw('LOWER(email) = ?', [Str::lower($row['email'])])
                    ->first();

                if ($existingUser) {
                    $this->updateExistingUser($existingUser, $row, $tenantId);
                    $summary['updated']++;

                    continue;
                }

                $pendingInvitation = Invitation::query()
                    ->withoutGlobalScopes()
                    ->where('tenant_id', $tenantId)
                    ->whereRaw('LOWER(email) = ?', [Str::lower($row['email'])])
                    ->whereNull('accepted_at')
                    ->where('expires_at', '>=', now())
                    ->latest('id')
                    ->first();

                if ($pendingInvitation) {
                    $this->refreshPendingInvitation($pendingInvitation, $row);
                    $summary['resent']++;

                    continue;
                }

                $this->invitationService->create([
                    'tenant_id' => $tenantId,
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'role' => $row['role'],
                    'department_id' => $row['department_id'],
                ], $actor);

                $summary['invited']++;
            }

            return $summary;
        });
    }

    protected function readSpreadsheet(UploadedFile $file, int $tenantId): array
    {
        $reader = ReaderFactory::createFromFile($file->getRealPath());
        $reader->open($file->getRealPath());

        $rows = [];
        $seenEmails = [];
        $headerMap = null;

        try {
            $firstSheet = null;

            foreach ($reader->getSheetIterator() as $sheet) {
                $firstSheet = $sheet;
                break;
            }

            if (! $firstSheet) {
                throw ValidationException::withMessages([
                    'file' => 'The spreadsheet could not be read.',
                ]);
            }

            foreach ($firstSheet->getRowIterator() as $index => $row) {
                $rowNumber = $index;
                $values = array_map(fn ($value) => $this->normalizeCellValue($value), $row->toArray());

                if ($headerMap === null) {
                    $headerMap = $this->buildHeaderMap($values);

                    continue;
                }

                $payload = $this->buildPayload($values, $headerMap, $rowNumber, $tenantId);

                if ($payload === null) {
                    continue;
                }

                $emailKey = Str::lower($payload['email']);

                if (isset($seenEmails[$emailKey])) {
                    throw ValidationException::withMessages([
                        'file' => sprintf('Row %d: duplicate email "%s" appears more than once in the spreadsheet.', $rowNumber, $payload['email']),
                    ]);
                }

                $seenEmails[$emailKey] = true;
                $rows[] = $payload;
            }
        } finally {
            $reader->close();
        }

        return $rows;
    }

    protected function buildHeaderMap(array $headerRow): array
    {
        $map = [];

        foreach ($headerRow as $index => $heading) {
            $normalized = $this->normalizeHeading((string) $heading);

            if ($normalized !== '') {
                $map[$normalized] = $index;
            }
        }

        foreach (self::REQUIRED_HEADERS as $header) {
            if (! array_key_exists($header, $map)) {
                throw ValidationException::withMessages([
                    'file' => sprintf('The spreadsheet must include a "%s" column.', str_replace('_', ' ', $header)),
                ]);
            }
        }

        return $map;
    }

    protected function buildPayload(array $values, array $headerMap, int $rowNumber, int $tenantId): ?array
    {
        $payload = [
            'name' => $this->stringValue($this->valueFor($values, $headerMap, 'name')),
            'email' => $this->stringValue($this->valueFor($values, $headerMap, 'email')),
            'role' => Str::lower($this->stringValue($this->valueFor($values, $headerMap, 'role')) ?: 'employee'),
            'department' => $this->stringValue($this->valueFor($values, $headerMap, 'department')),
            'job_title' => $this->stringValue($this->valueFor($values, $headerMap, 'job_title')),
            'employment_type' => $this->stringValue($this->valueFor($values, $headerMap, 'employment_type')),
            'start_date' => $this->normalizeDate($this->valueFor($values, $headerMap, 'start_date'), $rowNumber),
            'risk_level' => Str::lower($this->stringValue($this->valueFor($values, $headerMap, 'risk_level')) ?: ''),
            'branch' => $this->stringValue($this->valueFor($values, $headerMap, 'branch')),
            'employee_number' => $this->stringValue($this->valueFor($values, $headerMap, 'employee_number')),
            'phone' => $this->stringValue($this->valueFor($values, $headerMap, 'phone')),
            'alternate_phone' => $this->stringValue($this->valueFor($values, $headerMap, 'alternate_phone')),
        ];

        if (collect($payload)->except(['role'])->every(fn ($value) => blank($value))) {
            return null;
        }

        if (blank($payload['name'])) {
            throw ValidationException::withMessages([
                'file' => sprintf('Row %d: the name column is required.', $rowNumber),
            ]);
        }

        if (blank($payload['email']) || ! filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'file' => sprintf('Row %d: enter a valid email address.', $rowNumber),
            ]);
        }

        if (! in_array($payload['role'], self::ALLOWED_ROLES, true)) {
            throw ValidationException::withMessages([
                'file' => sprintf('Row %d: role must be one of %s.', $rowNumber, implode(', ', self::ALLOWED_ROLES)),
            ]);
        }

        if ($payload['risk_level'] !== '' && ! in_array($payload['risk_level'], self::ALLOWED_RISK_LEVELS, true)) {
            throw ValidationException::withMessages([
                'file' => sprintf('Row %d: risk level must be low, medium, or high.', $rowNumber),
            ]);
        }

        $payload['department_id'] = $this->resolveDepartmentId($payload['department'], $tenantId, $rowNumber);
        unset($payload['department']);

        return $payload;
    }

    protected function updateExistingUser(User $user, array $row, int $tenantId): void
    {
        if ((int) $user->tenant_id !== $tenantId) {
            throw ValidationException::withMessages([
                'file' => sprintf('The email "%s" already belongs to another tenant.', $row['email']),
            ]);
        }

        if ($user->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'file' => sprintf('The email "%s" belongs to a platform administrator and cannot be imported here.', $row['email']),
            ]);
        }

        $oldUser = $user->toArray();
        $user->fill([
            'name' => $row['name'],
        ]);

        if ($user->isDirty()) {
            $user->save();
            $this->auditLogService->logModelUpdated('user_profile_updated', $user, $oldUser);
        }

        $primaryRole = $user->roles->pluck('name')->first();
        if ($primaryRole !== $row['role']) {
            $oldRoles = $user->roles->pluck('name')->values()->all();
            $user->syncRoles([$row['role']]);
            $this->auditLogService->log('user_access_updated', User::class, $user->id, ['roles' => $oldRoles], ['roles' => [$row['role']]]);
        }

        $profilePayload = [
            'tenant_id' => $tenantId,
            'department_id' => $row['department_id'],
            'job_title' => $row['job_title'],
            'employment_type' => $row['employment_type'],
            'start_date' => $row['start_date'],
            'risk_level' => $row['risk_level'] ?: null,
            'branch' => $row['branch'],
            'employee_number' => $row['employee_number'],
            'phone' => $row['phone'],
            'alternate_phone' => $row['alternate_phone'],
        ];

        $profile = $user->employeeProfile;

        if (! $profile) {
            $profile = EmployeeProfile::query()->create([
                ...$profilePayload,
                'user_id' => $user->id,
                'status' => $user->status ?? UserStatus::Active,
            ]);

            $this->auditLogService->logModelCreated('employee_profile_created', $profile);

            return;
        }

        $oldProfile = $profile->toArray();
        $profile->fill($profilePayload);

        if ($profile->isDirty()) {
            $profile->save();
            $this->auditLogService->logModelUpdated('employee_profile_updated', $profile, $oldProfile);
        }
    }

    protected function refreshPendingInvitation(Invitation $invitation, array $row): void
    {
        $oldValues = $invitation->toArray();

        $invitation->fill([
            'name' => $row['name'],
            'role' => $row['role'],
            'department_id' => $row['department_id'],
            'token' => Str::uuid()->toString(),
            'expires_at' => now()->addDays(7),
        ]);
        $invitation->save();

        $this->auditLogService->logModelUpdated('invitation_requeued', $invitation, $oldValues);

        Notification::route('mail', $invitation->email)
            ->notify((new InvitationNotification($invitation))->onQueue('mail'));

        Log::info('Invitation email re-queued from employee import.', [
            'invitation_id' => $invitation->id,
            'tenant_id' => $invitation->tenant_id,
            'email' => $invitation->email,
            'queue' => 'mail',
        ]);
    }

    protected function resolveDepartmentId(?string $departmentName, int $tenantId, int $rowNumber): ?int
    {
        if (blank($departmentName)) {
            return null;
        }

        $department = Department::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->whereRaw('LOWER(name) = ?', [Str::lower($departmentName)])
            ->first();

        if (! $department) {
            throw ValidationException::withMessages([
                'file' => sprintf('Row %d: department "%s" was not found in the selected company.', $rowNumber, $departmentName),
            ]);
        }

        return $department->id;
    }

    protected function valueFor(array $values, array $headerMap, string $key): mixed
    {
        return array_key_exists($key, $headerMap) ? ($values[$headerMap[$key]] ?? null) : null;
    }

    protected function normalizeHeading(string $value): string
    {
        $normalized = Str::of($value)->trim()->lower()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->toString();

        return match ($normalized) {
            'full_name', 'employee_name' => 'name',
            'department_name' => 'department',
            'title' => 'job_title',
            'alt_phone' => 'alternate_phone',
            default => $normalized,
        };
    }

    protected function normalizeCellValue(mixed $value): mixed
    {
        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->toDateString();
        }

        return $value;
    }

    protected function normalizeDate(mixed $value, int $rowNumber): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->toDateString();
        }

        try {
            return Carbon::parse((string) $value)->toDateString();
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'file' => sprintf('Row %d: start date must be a valid date.', $rowNumber),
            ]);
        }
    }

    protected function stringValue(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }
}
