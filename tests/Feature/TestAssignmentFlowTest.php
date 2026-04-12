<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Tenant;
use App\Models\Test;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TestAssignmentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function companyAdminForTenant(Tenant $tenant): User
    {
        $this->seed(RolesAndPermissionsSeeder::class);

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
            'phone' => '+263771000001',
        ]);

        return $user;
    }

    public function test_company_admin_can_assign_a_test_to_an_employee_in_their_company(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->companyAdminForTenant($tenant);

        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $employee = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $employee->assignRole('employee');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employee->id,
            'department_id' => $department->id,
            'job_title' => 'Analyst',
            'branch' => 'Harare',
            'phone' => '+263771000002',
        ]);

        $test = Test::factory()->create([
            'status' => 'published',
            'created_by' => $companyAdmin->id,
        ]);

        $response = $this->actingAs($companyAdmin)->post(route('tests.assignments.store', $test), [
            'assigned_to_user_id' => $employee->id,
            'due_date' => now()->addWeek()->toDateString(),
        ]);

        $response->assertRedirect(route('tests.show', ['test' => $test->id, 'tab' => 'assignments']));
        $this->assertDatabaseHas('test_assignments', [
            'tenant_id' => $tenant->id,
            'test_id' => $test->id,
            'assigned_to_user_id' => $employee->id,
            'status' => 'assigned',
        ]);
    }

    public function test_company_admin_can_open_the_test_assignment_form_with_tenant_scoped_employees(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->companyAdminForTenant($tenant);

        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

        $employee = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $employee->assignRole('employee');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employee->id,
            'department_id' => $department->id,
            'job_title' => 'Analyst',
            'branch' => 'Harare',
            'phone' => '+263771000004',
        ]);

        $otherTenant = Tenant::factory()->create(['status' => 'active']);
        $otherDepartment = Department::factory()->create([
            'tenant_id' => $otherTenant->id,
        ]);
        $otherEmployee = User::factory()->create([
            'tenant_id' => $otherTenant->id,
        ]);
        $otherEmployee->assignRole('employee');
        EmployeeProfile::factory()->create([
            'tenant_id' => $otherTenant->id,
            'user_id' => $otherEmployee->id,
            'department_id' => $otherDepartment->id,
        ]);

        $this->actingAs($companyAdmin)
            ->get(route('tests.assignments.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('tests/assignments/create')
                ->where('isSuperAdmin', false)
                ->where('selectedTenantId', $tenant->id)
                ->has('employees', 1)
                ->where('employees.0.id', $employee->id)
            );
    }

    public function test_super_admin_can_open_the_test_assignment_form_after_selecting_a_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $employee = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $employee->assignRole('employee');
        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employee->id,
            'department_id' => $department->id,
            'job_title' => 'Analyst',
            'branch' => 'Harare',
            'phone' => '+263771000005',
        ]);

        $test = Test::factory()->create([
            'status' => 'published',
            'created_by' => $superAdmin->id,
        ]);

        $this->actingAs($superAdmin)
            ->get(route('tests.assignments.create', [
                'tenant_id' => $tenant->id,
                'test_id' => $test->id,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('tests/assignments/create')
                ->where('isSuperAdmin', true)
                ->where('selectedTenantId', $tenant->id)
                ->where('selectedTestId', $test->id)
                ->has('tenants', 1)
                ->has('employees', 1)
                ->where('employees.0.id', $employee->id)
            );
    }

    public function test_company_admin_can_bulk_assign_a_test_to_multiple_employees_in_their_company(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->companyAdminForTenant($tenant);

        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

        $employees = User::factory()->count(2)->create([
            'tenant_id' => $tenant->id,
        ]);

        foreach ($employees as $index => $employee) {
            $employee->assignRole('employee');

            EmployeeProfile::factory()->create([
                'tenant_id' => $tenant->id,
                'user_id' => $employee->id,
                'department_id' => $department->id,
                'job_title' => 'Analyst',
                'branch' => 'Harare',
                'phone' => '+26377100010' . $index,
            ]);
        }

        $test = Test::factory()->create([
            'status' => 'published',
            'created_by' => $companyAdmin->id,
        ]);

        $response = $this->actingAs($companyAdmin)->post(route('tests.assignments.store', $test), [
            'assigned_to_user_ids' => $employees->pluck('id')->all(),
            'due_date' => now()->addWeek()->toDateString(),
        ]);

        $response->assertRedirect(route('tests.show', ['test' => $test->id, 'tab' => 'assignments']));

        foreach ($employees as $employee) {
            $this->assertDatabaseHas('test_assignments', [
                'tenant_id' => $tenant->id,
                'test_id' => $test->id,
                'assigned_to_user_id' => $employee->id,
                'status' => 'assigned',
            ]);
        }
    }

    public function test_company_admin_cannot_assign_a_test_to_another_tenants_employee(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->companyAdminForTenant($tenant);

        $otherTenant = Tenant::factory()->create(['status' => 'active']);
        $otherDepartment = Department::factory()->create([
            'tenant_id' => $otherTenant->id,
        ]);
        $otherEmployee = User::factory()->create([
            'tenant_id' => $otherTenant->id,
        ]);
        $otherEmployee->assignRole('employee');

        EmployeeProfile::factory()->create([
            'tenant_id' => $otherTenant->id,
            'user_id' => $otherEmployee->id,
            'department_id' => $otherDepartment->id,
            'job_title' => 'Analyst',
            'branch' => 'Bulawayo',
            'phone' => '+263771000003',
        ]);

        $test = Test::factory()->create([
            'status' => 'published',
            'created_by' => $companyAdmin->id,
        ]);

        $response = $this->actingAs($companyAdmin)->post(route('tests.assignments.store', $test), [
            'assigned_to_user_id' => $otherEmployee->id,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('test_assignments', 0);
    }

    public function test_company_admin_can_publish_a_test(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->companyAdminForTenant($tenant);

        $test = Test::factory()->create([
            'status' => 'draft',
            'created_by' => $companyAdmin->id,
        ]);

        $response = $this->actingAs($companyAdmin)->post(route('tests.publish', $test));

        $response->assertRedirect();
        $this->assertDatabaseHas('tests', [
            'id' => $test->id,
            'status' => 'published',
        ]);
    }
}
