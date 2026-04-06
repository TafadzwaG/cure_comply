<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_registration_creates_pending_tenant_and_company_admin(): void
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

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
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'admin@example.com',
            'status' => 'active',
        ]);
    }
}
