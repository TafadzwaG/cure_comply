<?php

namespace Tests\Feature;

use App\Models\ComplianceFramework;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FrameworkShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_framework_show_page(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('super_admin');

        $framework = ComplianceFramework::factory()->create();

        $response = $this->actingAs($user)->get(route('frameworks.show', $framework));

        $response->assertOk();
    }
}
