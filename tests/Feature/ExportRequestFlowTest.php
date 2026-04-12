<?php

namespace Tests\Feature;

use App\Jobs\GenerateXlsxExportJob;
use App\Models\EmployeeProfile;
use App\Models\ExportRequest;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExportRequestFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_export_is_queued_instead_of_streamed(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Queue::fake();

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'job_title' => 'Compliance Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $response = $this->actingAs($user)->get(route('reports.employee-training', [
            'format' => 'xlsx',
        ]));

        $response
            ->assertRedirect()
            ->assertSessionHas('success', 'Report export queued. You will be notified when it is ready, and it will appear on the Exports page.');

        $exportRequest = ExportRequest::query()->firstOrFail();

        $this->assertSame($user->id, $exportRequest->user_id);
        $this->assertSame($tenant->id, $exportRequest->tenant_id);
        $this->assertSame('reports.employee-training', $exportRequest->source);
        $this->assertSame('xlsx', $exportRequest->format);
        $this->assertSame('queued', $exportRequest->status);

        Queue::assertPushed(GenerateXlsxExportJob::class);
    }

    public function test_completed_export_can_be_downloaded_by_owner_only(): void
    {
        Storage::fake('private');
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);

        $owner = User::factory()->forTenant($tenant)->create();
        $owner->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'job_title' => 'Compliance Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $otherUser = User::factory()->forTenant($tenant)->create();
        $otherUser->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $otherUser->id,
            'job_title' => 'Deputy Lead',
            'branch' => 'Bulawayo',
            'phone' => '+263772000000',
        ]);

        $exportRequest = ExportRequest::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'source' => 'reports.employee-training',
            'format' => 'xlsx',
            'status' => 'completed',
            'file_name' => 'employee-training.xlsx',
            'file_path' => 'exports/test/employee-training.xlsx',
            'completed_at' => now(),
        ]);

        Storage::disk('private')->put($exportRequest->file_path, 'export-body');

        $this->actingAs($owner)
            ->get(route('exports.download', $exportRequest))
            ->assertOk();

        $this->actingAs($otherUser)
            ->get(route('exports.download', $exportRequest))
            ->assertForbidden();
    }

    public function test_exports_page_lists_the_current_users_export_requests(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);

        $user = User::factory()->forTenant($tenant)->create([
            'name' => 'Export Owner',
        ]);
        $user->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'job_title' => 'Compliance Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        ExportRequest::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'source' => 'employees.index',
            'format' => 'xlsx',
            'status' => 'completed',
            'file_name' => 'employees-index-20260412.xlsx',
            'file_path' => 'exports/employees-index-20260412.xlsx',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('exports.index'));

        $response
            ->assertOk()
            ->assertSee('exports/index')
            ->assertSee('employees-index-20260412.xlsx')
            ->assertSee('Employees');
    }
}
