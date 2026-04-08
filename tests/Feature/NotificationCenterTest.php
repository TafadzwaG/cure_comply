<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\EmployeeProfile;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'job_title' => 'Operations Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $otherUser = User::factory()->forTenant($tenant)->create();

        AppNotification::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'type' => 'assignment_due',
            'title' => 'Assignment due soon',
            'message' => 'One assignment is due tomorrow.',
            'is_read' => false,
        ]);

        AppNotification::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'type' => 'evidence_rejected',
            'title' => 'Evidence rejected',
            'message' => 'A reviewer rejected uploaded evidence.',
            'is_read' => false,
        ]);

        AppNotification::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $otherUser->id,
            'type' => 'assignment_due',
            'title' => 'Other user notification',
            'message' => 'This should remain unread.',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->patch(route('notifications.read-all'));

        $response->assertRedirect();

        $this->assertSame(
            0,
            AppNotification::query()->where('user_id', $user->id)->where('is_read', false)->count()
        );

        $this->assertSame(
            1,
            AppNotification::query()->where('user_id', $otherUser->id)->where('is_read', false)->count()
        );
    }

    public function test_opening_a_notification_marks_it_as_read_and_redirects(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'job_title' => 'Operations Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $notification = AppNotification::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'type' => 'submission_scored',
            'title' => 'Submission scored',
            'message' => 'A submission is ready for review.',
            'action_url' => '/submissions',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->get(route('notifications.open', $notification));

        $response->assertRedirect('/submissions');

        $notification->refresh();

        $this->assertTrue($notification->is_read);
        $this->assertNotNull($notification->read_at);
    }
}
