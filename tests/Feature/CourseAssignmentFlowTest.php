<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\EmployeeProfile;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseAssignmentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_admin_assignment_uses_employee_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create();
        $admin = User::factory()->forTenant($tenant)->create();
        $admin->assignRole('company_admin');
        $employee = User::factory()->forTenant($tenant)->create();
        $employee->assignRole('employee');
        $course = Course::factory()->create();

        $this->completeProfile($admin, $tenant);
        $this->completeProfile($employee, $tenant);

        $response = $this->actingAs($admin)->post(route('assignments.store'), [
            'course_id' => $course->id,
            'assigned_to_user_id' => $employee->id,
            'due_date' => now()->addWeek()->toDateString(),
        ]);

        $assignment = CourseAssignment::query()->firstOrFail();

        $response->assertRedirect(route('assignments.index'));
        $this->assertSame($tenant->id, $assignment->tenant_id);
        $this->assertSame($employee->id, $assignment->assigned_to_user_id);
        $this->assertSame($admin->id, $assignment->assigned_by);
    }

    public function test_super_admin_assignment_uses_selected_employee_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create();
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');
        $employee = User::factory()->forTenant($tenant)->create();
        $employee->assignRole('employee');
        $course = Course::factory()->create();

        $this->completeProfile($employee, $tenant);

        $response = $this->actingAs($superAdmin)->post(route('assignments.store'), [
            'tenant_id' => $tenant->id,
            'course_id' => $course->id,
            'assigned_to_user_id' => $employee->id,
            'due_date' => now()->addWeek()->toDateString(),
        ]);

        $assignment = CourseAssignment::query()->firstOrFail();

        $response->assertRedirect(route('assignments.index'));
        $this->assertSame($tenant->id, $assignment->tenant_id);
        $this->assertSame($employee->id, $assignment->assigned_to_user_id);
        $this->assertSame($superAdmin->id, $assignment->assigned_by);
    }

    public function test_company_admin_cannot_assign_employee_from_another_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create();
        $otherTenant = Tenant::factory()->create();
        $admin = User::factory()->forTenant($tenant)->create();
        $admin->assignRole('company_admin');
        $otherEmployee = User::factory()->forTenant($otherTenant)->create();
        $otherEmployee->assignRole('employee');
        $course = Course::factory()->create();

        $this->completeProfile($admin, $tenant);
        $this->completeProfile($otherEmployee, $otherTenant);

        $response = $this->actingAs($admin)->post(route('assignments.store'), [
            'course_id' => $course->id,
            'assigned_to_user_id' => $otherEmployee->id,
            'due_date' => now()->addWeek()->toDateString(),
        ]);

        $response->assertSessionHasErrors('assigned_to_user_id');
        $this->assertDatabaseCount('course_assignments', 0);
    }

    protected function completeProfile(User $user, Tenant $tenant): void
    {
        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'department_id' => null,
            'job_title' => 'Compliance Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);
    }
}
