<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\LibraryFile;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LibraryFileFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    protected function superAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('super_admin');

        return $user;
    }

    protected function tenantUser(Tenant $tenant, string $role): User
    {
        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $user->assignRole($role);

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'department_id' => $department->id,
            'job_title' => ucfirst(str_replace('_', ' ', $role)),
            'branch' => 'Harare',
            'phone' => '+263771000321',
        ]);

        return $user;
    }

    protected function makeStoredLibraryFile(?Tenant $tenant = null, ?User $uploader = null, array $attributes = []): LibraryFile
    {
        $scopePath = $tenant ? "library-files/tenant/{$tenant->id}" : 'library-files/shared';
        $originalName = $attributes['original_name'] ?? 'document.pdf';
        $path = $attributes['file_path'] ?? $scopePath.'/'.Str::uuid().'.pdf';

        Storage::disk('private')->put($path, 'library file content');

        return LibraryFile::factory()
            ->when($tenant, fn ($factory) => $factory->forTenant($tenant))
            ->create([
                'uploaded_by' => $uploader?->id ?? User::factory()->create()->id,
                'original_name' => $originalName,
                'file_path' => $path,
                ...$attributes,
            ]);
    }

    public function test_super_admin_can_upload_shared_file_and_tenant_users_can_see_and_download_it(): void
    {
        $superAdmin = $this->superAdmin();
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->tenantUser($tenant, 'employee');

        $this->actingAs($superAdmin)
            ->post(route('files.store'), [
                'title' => 'CDPA Chapter 12:07',
                'description' => 'Zimbabwe data protection law.',
                'category' => LibraryFile::CATEGORY_LAW,
                'scope' => 'shared',
                'file' => UploadedFile::fake()->create('cdpa.pdf', 120, 'application/pdf'),
            ])
            ->assertRedirect();

        $libraryFile = LibraryFile::query()->firstOrFail();

        $this->assertNull($libraryFile->tenant_id);
        Storage::disk('private')->assertExists($libraryFile->file_path);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'library_file_uploaded',
            'entity_type' => LibraryFile::class,
            'entity_id' => $libraryFile->id,
        ]);

        $this->actingAs($employee)
            ->get(route('files.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('files/index')
                ->has('files.data', 1)
                ->where('files.data.0.title', 'CDPA Chapter 12:07')
                ->where('files.data.0.scope', 'shared')
            );

        $this->actingAs($employee)
            ->get(route('files.download', $libraryFile))
            ->assertOk()
            ->assertDownload('cdpa.pdf');
    }

    public function test_super_admin_can_upload_a_tenant_specific_file(): void
    {
        $superAdmin = $this->superAdmin();
        $tenant = Tenant::factory()->create(['status' => 'active']);

        $this->actingAs($superAdmin)
            ->post(route('files.store'), [
                'title' => 'Tenant SOP',
                'category' => LibraryFile::CATEGORY_POLICY,
                'scope' => 'tenant',
                'tenant_id' => $tenant->id,
                'file' => UploadedFile::fake()->create('tenant-sop.pdf', 64, 'application/pdf'),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('library_files', [
            'title' => 'Tenant SOP',
            'tenant_id' => $tenant->id,
        ]);
    }

    public function test_company_admin_can_upload_a_tenant_file_for_their_own_company(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->tenantUser($tenant, 'company_admin');

        $this->actingAs($companyAdmin)
            ->post(route('files.store'), [
                'title' => 'Internal Procedure',
                'category' => LibraryFile::CATEGORY_GUIDE,
                'file' => UploadedFile::fake()->create('procedure.pdf', 32, 'application/pdf'),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('library_files', [
            'title' => 'Internal Procedure',
            'tenant_id' => $tenant->id,
        ]);
    }

    public function test_company_admin_cannot_create_a_shared_file_even_with_a_crafted_request(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->tenantUser($tenant, 'company_admin');

        $this->actingAs($companyAdmin)
            ->post(route('files.store'), [
                'title' => 'Attempted Shared File',
                'category' => LibraryFile::CATEGORY_REFERENCE,
                'scope' => 'shared',
                'file' => UploadedFile::fake()->create('reference.pdf', 48, 'application/pdf'),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('library_files', [
            'title' => 'Attempted Shared File',
            'tenant_id' => $tenant->id,
        ]);

        $this->assertDatabaseMissing('library_files', [
            'title' => 'Attempted Shared File',
            'tenant_id' => null,
        ]);
    }

    public function test_company_admin_cannot_update_or_delete_shared_or_other_tenant_files(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->tenantUser($tenant, 'company_admin');
        $uploader = $this->superAdmin();

        $sharedFile = $this->makeStoredLibraryFile(null, $uploader, [
            'title' => 'Shared Law',
        ]);
        $otherTenantFile = $this->makeStoredLibraryFile($otherTenant, $uploader, [
            'title' => 'Other Tenant Guide',
        ]);

        $this->actingAs($companyAdmin)
            ->patch(route('files.update', $sharedFile), [
                'title' => 'Edited',
                'category' => LibraryFile::CATEGORY_POLICY,
            ])
            ->assertForbidden();

        $this->actingAs($companyAdmin)
            ->delete(route('files.destroy', $sharedFile))
            ->assertForbidden();

        $this->actingAs($companyAdmin)
            ->patch(route('files.update', $otherTenantFile), [
                'title' => 'Edited',
                'category' => LibraryFile::CATEGORY_POLICY,
            ])
            ->assertForbidden();

        $this->actingAs($companyAdmin)
            ->delete(route('files.destroy', $otherTenantFile))
            ->assertForbidden();
    }

    public function test_employee_and_reviewer_only_see_shared_and_own_tenant_files(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->tenantUser($tenant, 'employee');
        $reviewer = $this->tenantUser($tenant, 'reviewer');
        $uploader = $this->superAdmin();

        $this->makeStoredLibraryFile(null, $uploader, ['title' => 'Shared Regulation']);
        $this->makeStoredLibraryFile($tenant, $uploader, ['title' => 'Tenant Handbook']);
        $this->makeStoredLibraryFile($otherTenant, $uploader, ['title' => 'Other Tenant Secret']);

        $this->actingAs($employee)
            ->get(route('files.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('files.data', 1)
                ->where('files.data.0.title', 'Shared Regulation')
            );

        $this->actingAs($reviewer)
            ->get(route('files.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('files.data', 1)
                ->where('files.data.0.title', 'Shared Regulation')
            );

        $this->actingAs($employee)
            ->get(route('files.index', ['scope' => 'tenant']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('files.data', 1)
                ->where('files.data.0.title', 'Tenant Handbook')
            );

        $this->actingAs($reviewer)
            ->get(route('files.index', ['scope' => 'tenant']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('files.data', 1)
                ->where('files.data.0.title', 'Tenant Handbook')
            );
    }

    public function test_tenant_users_cannot_download_another_tenants_file(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->tenantUser($tenant, 'employee');
        $uploader = $this->superAdmin();
        $otherTenantFile = $this->makeStoredLibraryFile($otherTenant, $uploader, ['title' => 'Private Other Tenant File']);

        $this->actingAs($employee)
            ->get(route('files.download', $otherTenantFile))
            ->assertForbidden();
    }

    public function test_upload_validation_rejects_disallowed_file_types(): void
    {
        $superAdmin = $this->superAdmin();

        $this->actingAs($superAdmin)
            ->post(route('files.store'), [
                'title' => 'Executable',
                'category' => LibraryFile::CATEGORY_OTHER,
                'scope' => 'shared',
                'file' => UploadedFile::fake()->create('bad.exe', 12, 'application/octet-stream'),
            ])
            ->assertSessionHasErrors('file');
    }

    public function test_replacing_a_file_updates_metadata_and_private_storage(): void
    {
        $superAdmin = $this->superAdmin();
        $libraryFile = $this->makeStoredLibraryFile(null, $superAdmin, [
            'title' => 'Old Guide',
            'original_name' => 'old-guide.pdf',
        ]);
        $oldPath = $libraryFile->file_path;

        $this->actingAs($superAdmin)
            ->patch(route('files.update', $libraryFile), [
                'title' => 'Updated Guide',
                'description' => 'Updated version.',
                'category' => LibraryFile::CATEGORY_GUIDE,
                'scope' => 'shared',
                'file' => UploadedFile::fake()->create('updated-guide.pdf', 88, 'application/pdf'),
            ])
            ->assertRedirect();

        $libraryFile->refresh();

        $this->assertSame('Updated Guide', $libraryFile->title);
        $this->assertSame('updated-guide.pdf', $libraryFile->original_name);
        $this->assertNotSame($oldPath, $libraryFile->file_path);
        Storage::disk('private')->assertMissing($oldPath);
        Storage::disk('private')->assertExists($libraryFile->file_path);
    }
}
