<?php

namespace Tests\Feature;

use App\Models\EmployeeProfile;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\TenantActivatedNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TenantBrandingSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_admin_can_update_own_tenant_branding_and_replace_logo(): void
    {
        Storage::fake('public');
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = User::factory()->forTenant($tenant)->create();
        $companyAdmin->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $companyAdmin->id,
            'job_title' => 'Company Administrator',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $firstLogo = $this->fakePngUpload('tenant-logo.png');

        $this->actingAs($companyAdmin)
            ->post(route('settings.branding.update'), [
                'primary_color' => '#123456',
                'logo' => $firstLogo,
            ])
            ->assertRedirect();

        $tenant->refresh();

        $this->assertSame('#123456', $tenant->primary_color);
        $this->assertNotNull($tenant->logo_path);
        Storage::disk('public')->assertExists($tenant->logo_path);

        $oldLogoPath = $tenant->logo_path;
        $secondLogo = $this->fakePngUpload('tenant-logo-2.png');

        $this->actingAs($companyAdmin)
            ->post(route('settings.branding.update'), [
                'primary_color' => '#654321',
                'logo' => $secondLogo,
            ])
            ->assertRedirect();

        $tenant->refresh();

        $this->assertSame('#654321', $tenant->primary_color);
        $this->assertNotSame($oldLogoPath, $tenant->logo_path);
        Storage::disk('public')->assertMissing($oldLogoPath);
        Storage::disk('public')->assertExists($tenant->logo_path);
    }

    public function test_company_admin_cannot_change_another_tenants_branding(): void
    {
        Storage::fake('public');
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active', 'primary_color' => '#083D77']);

        $companyAdmin = User::factory()->forTenant($tenant)->create();
        $companyAdmin->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $companyAdmin->id,
            'job_title' => 'Company Administrator',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $this->actingAs($companyAdmin)
            ->post(route('settings.branding.update'), [
                'tenant_id' => $otherTenant->id,
                'primary_color' => '#FF6600',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'primary_color' => '#FF6600',
        ]);

        $this->assertDatabaseHas('tenants', [
            'id' => $otherTenant->id,
            'primary_color' => '#083D77',
        ]);
    }

    public function test_super_admin_can_open_branding_settings_for_selected_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $tenant = Tenant::factory()->create([
            'name' => 'Selected Workspace',
            'status' => 'active',
            'primary_color' => '#2255AA',
        ]);

        $this->actingAs($superAdmin)
            ->get(route('settings.branding.edit', ['tenant_id' => $tenant->id]))
            ->assertOk()
            ->assertSee('Selected Workspace')
            ->assertSee('#2255AA');
    }

    public function test_super_admin_can_update_selected_tenant_branding(): void
    {
        Storage::fake('public');
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $tenant = Tenant::factory()->create([
            'status' => 'active',
            'primary_color' => '#083D77',
        ]);

        $this->actingAs($superAdmin)
            ->post(route('settings.branding.update', ['tenant_id' => $tenant->id]), [
                'tenant_id' => $tenant->id,
                'primary_color' => '#AA4400',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'primary_color' => '#AA4400',
        ]);
    }

    public function test_tenant_lifecycle_email_uses_tenant_branding_when_present(): void
    {
        Storage::fake('public');
        $this->seed(RolesAndPermissionsSeeder::class);

        Storage::disk('public')->put('tenant-branding/logo.png', 'logo');

        $tenant = Tenant::factory()->create([
            'name' => 'Branded Tenant',
            'status' => 'active',
            'logo_path' => 'tenant-branding/logo.png',
            'primary_color' => '#3355AA',
        ]);

        $notification = new TenantActivatedNotification($tenant, '/dashboard');
        $mail = $notification->toMail(new \stdClass);
        $html = app('view')->make($mail->view, $mail->viewData)->render();

        $this->assertStringContainsString('#3355AA', $html);
        $this->assertStringContainsString(Storage::disk('public')->url('tenant-branding/logo.png'), $html);
        $this->assertStringContainsString('Branded Tenant', $html);
    }

    protected function fakePngUpload(string $name): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'tenant-logo-');
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9s8AAAAASUVORK5CYII=');
        file_put_contents($path, $png);

        return new UploadedFile($path, $name, 'image/png', null, true);
    }
}
