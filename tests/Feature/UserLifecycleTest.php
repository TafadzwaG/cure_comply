<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_deactivate_a_user_and_archive_their_email(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $target = $this->makeTenantUser($tenant, 'employee', 'target.user@example.com');

        AuditLog::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $target->id,
            'action' => 'user_profile_updated',
            'entity_type' => User::class,
            'entity_id' => $target->id,
        ]);

        $response = $this->actingAs($superAdmin)->patch(route('users.deactivate', $target));

        $response->assertRedirect();

        $target->refresh();

        $this->assertSame('inactive', $target->status->value);
        $this->assertSame('target.user@example.com', $target->archived_email);
        $this->assertStringContainsString('@users.privacycure.invalid', $target->email);
        $this->assertNotNull($target->deactivated_at);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $superAdmin->id,
            'action' => 'user_deactivated',
            'entity_id' => $target->id,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $target->id,
            'action' => 'user_profile_updated',
        ]);
    }

    public function test_company_admin_can_deactivate_only_users_in_their_own_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active']);

        $companyAdmin = $this->makeTenantUser($tenant, 'company_admin', 'admin@example.com');
        $sameTenantUser = $this->makeTenantUser($tenant, 'employee', 'same.tenant@example.com');
        $otherTenantUser = $this->makeTenantUser($otherTenant, 'employee', 'other.tenant@example.com');

        $ownResponse = $this->actingAs($companyAdmin)->patch(route('users.deactivate', $sameTenantUser));
        $ownResponse->assertRedirect();

        $sameTenantUser->refresh();
        $this->assertSame('inactive', $sameTenantUser->status->value);

        $forbiddenResponse = $this->actingAs($companyAdmin)->patch(route('users.deactivate', $otherTenantUser));
        $forbiddenResponse->assertForbidden();
    }

    public function test_original_email_can_be_reused_after_deactivation(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $target = $this->makeTenantUser($tenant, 'employee', 'reusable@example.com');

        $this->actingAs($superAdmin)->patch(route('users.deactivate', $target))->assertRedirect();

        User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'reusable@example.com',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'reusable@example.com',
            'archived_email' => null,
        ]);
    }

    public function test_reactivation_requires_a_real_email_and_succeeds_after_profile_update(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $target = $this->makeTenantUser($tenant, 'employee', 'restore.me@example.com');

        $this->actingAs($superAdmin)->patch(route('users.deactivate', $target))->assertRedirect();

        $blocked = $this->actingAs($superAdmin)->patch(route('users.reactivate', $target));
        $blocked->assertRedirect();
        $blocked->assertSessionHas('error');

        $this->actingAs($superAdmin)->patch(route('users.update', $target), [
            'tenant_id' => $tenant->id,
            'name' => $target->name,
            'email' => 'restored.user@example.com',
        ])->assertRedirect();

        $reactivated = $this->actingAs($superAdmin)->patch(route('users.reactivate', $target));
        $reactivated->assertRedirect();

        $target->refresh();

        $this->assertSame('active', $target->status->value);
        $this->assertSame('restored.user@example.com', $target->email);
        $this->assertNull($target->archived_email);
        $this->assertNull($target->deactivated_at);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $superAdmin->id,
            'action' => 'user_reactivated',
            'entity_id' => $target->id,
        ]);
    }

    protected function makeTenantUser(Tenant $tenant, string $role, string $email): User
    {
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => $email,
            'status' => 'active',
        ]);
        $user->assignRole($role);

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'department_id' => Department::factory()->create(['tenant_id' => $tenant->id])->id,
            'job_title' => 'Operations officer',
            'branch' => 'Harare',
            'phone' => '+263700000002',
            'status' => 'active',
        ]);

        return $user;
    }
}
