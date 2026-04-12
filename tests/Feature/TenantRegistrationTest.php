<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\SystemSetting;
use App\Models\User;
use App\Notifications\TenantRegistrationReceivedNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class TenantRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_registration_creates_pending_tenant_and_company_admin(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $response = $this->post('/register', [
            'company_name' => 'Acme Compliance',
            'registration_number' => 'REG-001',
            'industry' => 'Finance',
            'company_size' => '1-50',
            'contact_phone' => '+263771000000',
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('tenant.activation.pending', absolute: false));
        $this->assertDatabaseHas('tenants', [
            'name' => 'Acme Compliance',
            'status' => 'pending',
            'contact_phone' => '+263771000000',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'admin@example.com',
            'status' => 'active',
        ]);
    }

    public function test_company_registration_notifies_configured_platform_recipients(): void
    {
        Notification::fake();
        $this->seed(RolesAndPermissionsSeeder::class);

        $recipient = User::factory()->create([
            'name' => 'Platform Admin',
            'email' => 'platform@example.com',
        ]);
        $recipient->assignRole('super_admin');

        SystemSetting::query()->create([
            'key' => 'tenant_registration_recipients',
            'value' => [
                'recipient_user_ids' => [$recipient->id],
                'recipient_emails' => ['ops@example.com'],
            ],
        ]);

        $this->post('/register', [
            'company_name' => 'Acme Compliance',
            'registration_number' => 'REG-001',
            'industry' => 'Finance',
            'company_size' => '1-50',
            'contact_phone' => '+263771000000',
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('tenant.activation.pending', absolute: false));

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $recipient->id,
            'type' => 'tenant_registered',
            'title' => 'New tenant registration: Acme Compliance',
        ]);

        Notification::assertSentOnDemand(TenantRegistrationReceivedNotification::class, function ($notification, $channels, $notifiable) {
            $email = $notifiable->routeNotificationFor('mail', $notification);

            return in_array($email, ['platform@example.com', 'ops@example.com'], true);
        });

        $this->assertSame(1, AppNotification::withoutGlobalScopes()->where('user_id', $recipient->id)->count());
    }
}
