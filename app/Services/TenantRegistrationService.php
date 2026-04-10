<?php

namespace App\Services;

use App\Enums\TenantStatus;
use App\Enums\UserStatus;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantRegistrationService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected TenantLifecycleService $tenantLifecycleService,
    )
    {
    }

    public function register(array $data): User
    {
        [$tenant, $user] = DB::transaction(function () use ($data) {
            $tenant = Tenant::query()->create([
                'name' => $data['company_name'],
                'registration_number' => $data['registration_number'] ?? null,
                'industry' => $data['industry'] ?? null,
                'company_size' => $data['company_size'] ?? null,
                'contact_name' => $data['name'],
                'contact_email' => $data['email'],
                'contact_phone' => $data['contact_phone'] ?? null,
                'status' => TenantStatus::Pending,
            ]);

            $user = User::query()->create([
                'tenant_id' => $tenant->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'status' => UserStatus::Active,
                'password' => Hash::make($data['password']),
            ]);

            $user->assignRole('company_admin');

            $this->auditLogService->log('tenant_registered', Tenant::class, $tenant->id, [], $tenant->toArray());

            return [$tenant, $user];
        });

        $this->tenantLifecycleService->notifyRegistrationSubmitted($tenant);

        return $user;
    }
}
