<?php

namespace Tests\Feature;

use App\Models\SystemSetting;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\TenantActivatedNotification;
use App\Notifications\TenantDeactivatedNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PlatformSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_super_admin_can_open_platform_settings(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $companyAdmin = User::factory()->forTenant(Tenant::factory()->create())->create();
        $companyAdmin->assignRole('company_admin');

        $this->actingAs($companyAdmin)
            ->get(route('settings.platform.edit'))
            ->assertForbidden();
    }

    public function test_super_admin_can_save_tenant_registration_recipients(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $recipient = User::factory()->create();
        $recipient->assignRole('super_admin');

        $this->actingAs($superAdmin)
            ->put(route('settings.platform.update'), [
                'recipient_user_ids' => [$recipient->id],
                'recipient_emails' => ['ops@example.com', 'audit@example.com'],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('system_settings', [
            'key' => 'tenant_registration_recipients',
        ]);

        $this->assertSame(
            [$recipient->id],
            SystemSetting::query()->where('key', 'tenant_registration_recipients')->firstOrFail()->value['recipient_user_ids']
        );
    }

    public function test_super_admin_can_activate_and_deactivate_a_tenant_and_notifications_are_queued(): void
    {
        Notification::fake();
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $tenant = Tenant::factory()->create([
            'name' => 'Pending Tenant',
            'status' => 'pending',
            'contact_email' => 'tenant@example.com',
        ]);

        $companyAdmin = User::factory()->forTenant($tenant)->create([
            'email' => 'admin@tenant.test',
        ]);
        $companyAdmin->assignRole('company_admin');

        $this->actingAs($superAdmin)
            ->post(route('tenants.activate', $tenant))
            ->assertRedirect();

        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'tenant_activated',
            'entity_type' => \App\Models\Tenant::class,
            'entity_id' => $tenant->id,
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $companyAdmin->id,
            'type' => 'tenant_activated',
        ]);

        Notification::assertSentOnDemand(TenantActivatedNotification::class);

        $this->actingAs($superAdmin)
            ->post(route('tenants.deactivate', $tenant))
            ->assertRedirect();

        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'status' => 'inactive',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'tenant_deactivated',
            'entity_type' => \App\Models\Tenant::class,
            'entity_id' => $tenant->id,
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $companyAdmin->id,
            'type' => 'tenant_deactivated',
        ]);

        Notification::assertSentOnDemand(TenantDeactivatedNotification::class);
    }

    public function test_company_admin_cannot_activate_or_deactivate_a_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = User::factory()->forTenant($tenant)->create();
        $companyAdmin->assignRole('company_admin');
        $companyAdmin->employeeProfile()->create([
            'tenant_id' => $tenant->id,
            'status' => 'active',
            'job_title' => 'Company Administrator',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $this->actingAs($companyAdmin)
            ->post(route('tenants.activate', $tenant))
            ->assertForbidden();

        $this->actingAs($companyAdmin)
            ->post(route('tenants.deactivate', $tenant))
            ->assertForbidden();
    }
}
