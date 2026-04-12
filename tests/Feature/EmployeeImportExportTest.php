<?php

namespace Tests\Feature;

use App\Jobs\GenerateXlsxExportJob;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\InvitationNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Tests\TestCase;

class EmployeeImportExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_export_queues_an_xlsx_export_request(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Queue::fake();

        $tenant = Tenant::factory()->create([
            'status' => 'active',
        ]);

        $companyAdmin = $this->createCompanyAdmin($tenant, 'ops-admin@example.com');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => User::factory()->forTenant($tenant)->create([
                'email' => 'employee@example.com',
            ])->assignRole('employee')->id,
            'department_id' => Department::factory()->create([
                'tenant_id' => $tenant->id,
                'name' => 'Operations',
            ])->id,
            'job_title' => 'Analyst',
            'branch' => 'Harare',
            'phone' => '+263771000101',
        ]);

        $response = $this->actingAs($companyAdmin)->get(route('employees.index', ['export' => 'xlsx']));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Export queued. You will be notified when it is ready, and it will appear on the Exports page.');

        $this->assertDatabaseHas('export_requests', [
            'user_id' => $companyAdmin->id,
            'source' => 'employees.index',
            'format' => 'xlsx',
            'status' => 'queued',
        ]);

        Queue::assertPushed(GenerateXlsxExportJob::class);
    }

    public function test_employee_import_updates_existing_users_and_queues_new_invitations(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Notification::fake();

        $tenant = Tenant::factory()->create([
            'status' => 'active',
        ]);

        $operations = Department::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Operations',
        ]);

        $finance = Department::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Finance',
        ]);

        $companyAdmin = $this->createCompanyAdmin($tenant, 'admin@example.com');

        $existingUser = User::factory()->forTenant($tenant)->create([
            'name' => 'Old Analyst',
            'email' => 'existing@example.com',
        ]);
        $existingUser->assignRole('employee');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $existingUser->id,
            'department_id' => $operations->id,
            'job_title' => 'Old Title',
            'branch' => 'Bulawayo',
            'phone' => '+263771000201',
        ]);

        $upload = $this->makeSpreadsheetUpload([
            ['Name', 'Email', 'Role', 'Department', 'Job Title', 'Employment Type', 'Start Date', 'Risk Level', 'Branch', 'Employee Number', 'Phone', 'Alternate Phone'],
            ['Updated Analyst', 'existing@example.com', 'reviewer', 'Finance', 'Risk Reviewer', 'full_time', '2026-04-01', 'high', 'Harare', 'EMP-102', '+263771000202', '+263771000203'],
            ['New Employee', 'new.employee@example.com', 'employee', 'Operations', 'Operations Officer', 'contract', '2026-04-05', 'medium', 'Mutare', 'EMP-103', '+263771000204', ''],
        ]);

        $response = $this->actingAs($companyAdmin)->post(route('employees.import'), [
            'file' => $upload,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Employee import completed. 1 existing employee was updated. 1 new employee was queued for invitation delivery.');

        $existingUser->refresh();
        $existingProfile = $existingUser->employeeProfile()->firstOrFail();

        $this->assertSame('Updated Analyst', $existingUser->name);
        $this->assertTrue($existingUser->hasRole('reviewer'));
        $this->assertSame($finance->id, $existingProfile->department_id);
        $this->assertSame('Risk Reviewer', $existingProfile->job_title);
        $this->assertSame('Harare', $existingProfile->branch);
        $this->assertSame('EMP-102', $existingProfile->employee_number);
        $this->assertSame('high', $existingProfile->risk_level);

        $this->assertDatabaseHas('invitations', [
            'tenant_id' => $tenant->id,
            'department_id' => $operations->id,
            'email' => 'new.employee@example.com',
            'name' => 'New Employee',
            'role' => 'employee',
        ]);

        Notification::assertSentOnDemandTimes(InvitationNotification::class, 1);
    }

    public function test_super_admin_must_choose_a_tenant_when_importing_employees(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create([
            'email' => 'super@example.com',
        ]);
        $superAdmin->assignRole('super_admin');

        $upload = $this->makeSpreadsheetUpload([
            ['Name', 'Email'],
            ['Platform User', 'platform.user@example.com'],
        ]);

        $response = $this->actingAs($superAdmin)->post(route('employees.import'), [
            'file' => $upload,
        ]);

        $response
            ->assertSessionHasErrors('tenant_id');

        $this->assertDatabaseCount('invitations', 0);
    }

    protected function createCompanyAdmin(Tenant $tenant, string $email): User
    {
        $user = User::factory()->forTenant($tenant)->create([
            'email' => $email,
        ]);
        $user->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'job_title' => 'Compliance Lead',
            'branch' => 'Harare',
            'phone' => '+263771000001',
        ]);

        return $user;
    }

    protected function makeSpreadsheetUpload(array $rows): UploadedFile
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'employees-import-');
        $path = $tempPath.'.xlsx';

        @unlink($path);
        rename($tempPath, $path);

        $writer = new Writer();
        $writer->openToFile($path);

        foreach ($rows as $row) {
            $writer->addRow(Row::fromValues($row));
        }

        $writer->close();

        return new UploadedFile(
            $path,
            'employees-import.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true,
        );
    }
}
