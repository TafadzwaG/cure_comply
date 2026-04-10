<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function companyAdminForTenant(Tenant $tenant): User
    {
        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $user->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'department_id' => $department->id,
            'job_title' => 'Company Admin',
            'branch' => 'Harare',
            'phone' => '+263771100001',
        ]);

        return $user;
    }

    public function test_company_admin_can_create_a_department_for_their_own_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->companyAdminForTenant($tenant);

        $response = $this->actingAs($companyAdmin)->post(route('departments.store'), [
            'tenant_id' => $otherTenant->id,
            'name' => 'Governance',
            'description' => 'Handles governance and oversight.',
            'status' => 'active',
        ]);

        $response->assertRedirect(route('departments.index'));

        $this->assertDatabaseHas('departments', [
            'tenant_id' => $tenant->id,
            'name' => 'Governance',
            'status' => 'active',
        ]);
    }

    public function test_super_admin_can_create_a_department_for_a_selected_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $platformTenant = Tenant::factory()->create(['status' => 'active']);
        $targetTenant = Tenant::factory()->create(['status' => 'active']);

        $superAdmin = User::factory()->create([
            'tenant_id' => $platformTenant->id,
        ]);
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->post(route('departments.store'), [
            'tenant_id' => $targetTenant->id,
            'name' => 'Operations',
            'description' => 'Runs delivery and operations.',
            'status' => 'active',
        ]);

        $response->assertRedirect(route('departments.index'));

        $this->assertDatabaseHas('departments', [
            'tenant_id' => $targetTenant->id,
            'name' => 'Operations',
            'status' => 'active',
        ]);
    }
}
