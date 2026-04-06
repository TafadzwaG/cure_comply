<?php

namespace Tests\Feature;

use App\Models\Department;
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

        Queue::assertPushed(SendQueuedNotifications::class);
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

        Queue::assertPushed(SendQueuedNotifications::class);
    }
}
