<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Invitation;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\SendQueuedNotifications;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class InvitationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_invite_a_tenant_user_and_the_email_is_queued(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Queue::fake();

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Governance',
        ]);

        $response = $this->actingAs($superAdmin)->post(route('invitations.store'), [
            'tenant_id' => $tenant->id,
            'name' => 'Ruvimbo Dube',
            'email' => 'ruvimbo@example.com',
            'role' => 'reviewer',
            'department_id' => $department->id,
            'is_platform_admin' => false,
        ]);

        $response->assertRedirect();

        $invitation = Invitation::query()->firstOrFail();

        $this->assertSame($tenant->id, $invitation->tenant_id);
        $this->assertSame('reviewer', $invitation->role);
        $this->assertSame($department->id, $invitation->department_id);

        Queue::assertPushed(SendQueuedNotifications::class, fn (SendQueuedNotifications $job) => $job->queue === 'mail');
    }

    public function test_super_admin_can_invite_a_platform_admin_without_a_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Queue::fake();

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->post(route('invitations.store'), [
            'name' => 'Global Admin',
            'email' => 'global-admin@example.com',
            'is_platform_admin' => true,
        ]);

        $response->assertRedirect();

        $invitation = Invitation::query()->firstOrFail();

        $this->assertNull($invitation->tenant_id);
        $this->assertNull($invitation->department_id);
        $this->assertSame('super_admin', $invitation->role);

        Queue::assertPushed(SendQueuedNotifications::class, fn (SendQueuedNotifications $job) => $job->queue === 'mail');
    }

    public function test_company_admin_can_invite_a_user_for_their_own_tenant_and_the_email_is_queued(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Queue::fake();

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active']);

        $companyAdmin = User::factory()->create([
            'tenant_id' => $tenant->id,
            'status' => 'active',
        ]);
        $companyAdmin->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $companyAdmin->id,
            'department_id' => Department::factory()->create(['tenant_id' => $tenant->id])->id,
            'job_title' => 'Compliance lead',
            'branch' => 'Harare',
            'phone' => '+263700000001',
            'status' => 'active',
        ]);

        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Operations',
        ]);

        $response = $this->actingAs($companyAdmin)->post(route('invitations.store'), [
            'tenant_id' => $otherTenant->id,
            'name' => 'Assigned User',
            'email' => 'assigned.user@example.com',
            'role' => 'employee',
            'department_id' => $department->id,
        ]);

        $response->assertRedirect();

        $invitation = Invitation::query()->firstOrFail();

        $this->assertSame($tenant->id, $invitation->tenant_id);
        $this->assertSame($department->id, $invitation->department_id);
        $this->assertSame($companyAdmin->id, $invitation->invited_by);

        Queue::assertPushed(SendQueuedNotifications::class, fn (SendQueuedNotifications $job) => $job->queue === 'mail');
    }

    public function test_accepting_an_invitation_normalizes_the_phone_number(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $inviter = User::factory()->create([
            'tenant_id' => $tenant->id,
            'status' => 'active',
        ]);
        $inviter->assignRole('company_admin');

        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Operations',
        ]);

        $invitation = Invitation::query()->create([
            'tenant_id' => $tenant->id,
            'department_id' => $department->id,
            'invited_by' => $inviter->id,
            'name' => 'Assigned User',
            'email' => 'assigned.user@example.com',
            'role' => 'employee',
            'token' => 'invite-token',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->post(route('invitations.accept.store', $invitation->token), [
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'job_title' => 'Analyst',
            'phone' => '+263 0771 234 567',
        ]);

        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('employee_profiles', [
            'user_id' => User::query()->where('email', 'assigned.user@example.com')->value('id'),
            'phone' => '+263771234567',
        ]);
    }
}
