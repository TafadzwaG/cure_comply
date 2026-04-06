<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_employee_with_completed_profile_can_visit_the_dashboard()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('employee');
        $user->employeeProfile()->create([
            'tenant_id' => $tenant->id,
            'status' => 'active',
            'job_title' => 'Compliance Officer',
            'branch' => 'Harare',
            'phone' => '+263777000111',
        ]);

        $this->actingAs($user);

        $this->get('/dashboard')
            ->assertOk()
            ->assertSee('dashboards/employee');
    }

    public function test_employee_with_incomplete_profile_is_redirected_to_completion_page()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('employee');

        $this->actingAs($user);

        $this->get('/dashboard')->assertRedirect(route('employee-profile.complete.edit'));
    }

    public function test_inactive_tenant_user_is_redirected_to_activation_pending_page()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'pending']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');

        $this->actingAs($user);

        $this->get('/dashboard')->assertRedirect(route('tenant.activation.pending'));
    }

    public function test_inactive_tenant_user_can_view_activation_pending_page()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create([
            'status' => 'pending',
            'name' => 'Pending Tenant',
        ]);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');

        $this->actingAs($user);

        $this->get(route('tenant.activation.pending'))
            ->assertOk()
            ->assertSee('auth/tenant-activation-pending');
    }

    public function test_company_admin_with_incomplete_profile_is_redirected_to_completion_page()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');

        $this->actingAs($user);

        $this->get('/dashboard')->assertRedirect(route('employee-profile.complete.edit'));
    }

    public function test_reviewer_with_incomplete_profile_is_redirected_to_completion_page()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('reviewer');

        $this->actingAs($user);

        $this->get('/dashboard')->assertRedirect(route('employee-profile.complete.edit'));
    }

    public function test_super_admin_receives_the_super_admin_dashboard()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('super_admin');

        $this->actingAs($user);

        $this->get('/dashboard')
            ->assertOk()
            ->assertSee('dashboards/super-admin');
    }

    public function test_company_admin_receives_the_company_dashboard()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');
        $user->employeeProfile()->create([
            'tenant_id' => $tenant->id,
            'status' => 'active',
            'job_title' => 'Company Administrator',
            'branch' => 'Harare',
            'phone' => '+263777000111',
        ]);

        $this->actingAs($user);

        $this->get('/dashboard')
            ->assertOk()
            ->assertSee('dashboards/company-admin');
    }

    public function test_reviewer_receives_the_reviewer_dashboard()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('reviewer');
        $user->employeeProfile()->create([
            'tenant_id' => $tenant->id,
            'status' => 'active',
            'job_title' => 'Reviewer',
            'branch' => 'Bulawayo',
            'phone' => '+263777000222',
        ]);

        $this->actingAs($user);

        $this->get('/dashboard')
            ->assertOk()
            ->assertSee('dashboards/reviewer');
    }

    public function test_impersonated_non_super_admin_with_incomplete_profile_is_redirected_to_completion_page()
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $targetUser = User::factory()->forTenant($tenant)->create();
        $targetUser->assignRole('reviewer');

        $this->actingAs($targetUser)
            ->withSession(['impersonated_by' => $superAdmin->id])
            ->get('/dashboard')
            ->assertRedirect(route('employee-profile.complete.edit'));
    }
}
