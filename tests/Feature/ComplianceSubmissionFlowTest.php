<?php

namespace Tests\Feature;

use App\Models\ComplianceFramework;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceResponse;
use App\Models\ComplianceSection;
use App\Models\ComplianceSubmission;
use App\Models\ComplianceSubmissionAssignment;
use App\Models\EmployeeProfile;
use App\Models\EvidenceFile;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ComplianceSubmissionFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_admin_is_redirected_to_submission_show_after_create(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'department_id' => null,
            'job_title' => 'Compliance Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $framework = ComplianceFramework::factory()->create();

        $response = $this->actingAs($user)->post(route('submissions.store'), [
            'compliance_framework_id' => $framework->id,
            'title' => 'Q1 Data Protection Assessment',
            'reporting_period' => '2026-Q1',
        ]);

        $submission = ComplianceSubmission::query()->firstOrFail();

        $response->assertRedirect(route('submissions.show', $submission));
        $this->assertSame($tenant->id, $submission->tenant_id);
    }

    public function test_company_admin_can_assign_submission_to_employee_on_create(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create();
        $admin = User::factory()->forTenant($tenant)->create();
        $admin->assignRole('company_admin');

        $employee = User::factory()->forTenant($tenant)->create();
        $employee->assignRole('employee');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $admin->id,
            'department_id' => null,
            'job_title' => 'Compliance Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employee->id,
            'department_id' => null,
            'job_title' => 'Analyst',
            'branch' => 'Harare',
            'phone' => '+263772000000',
        ]);

        $framework = ComplianceFramework::factory()->create();

        $response = $this->actingAs($admin)->post(route('submissions.store'), [
            'compliance_framework_id' => $framework->id,
            'title' => 'Assigned Data Protection Assessment',
            'reporting_period' => '2026-Q2',
            'assigned_to_user_ids' => [$employee->id],
        ]);

        $submission = ComplianceSubmission::query()->where('title', 'Assigned Data Protection Assessment')->firstOrFail();

        $response->assertRedirect(route('submissions.show', $submission));
        $this->assertDatabaseHas('compliance_submission_assignments', [
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $submission->id,
            'assigned_to_user_id' => $employee->id,
            'assigned_by' => $admin->id,
        ]);
    }

    public function test_employee_only_sees_submissions_assigned_by_manager(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create();
        $admin = User::factory()->forTenant($tenant)->create();
        $admin->assignRole('company_admin');

        $employee = User::factory()->forTenant($tenant)->create();
        $employee->assignRole('employee');

        $otherEmployee = User::factory()->forTenant($tenant)->create();
        $otherEmployee->assignRole('employee');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employee->id,
            'department_id' => null,
            'job_title' => 'Analyst',
            'branch' => 'Harare',
            'phone' => '+263772000000',
        ]);

        $framework = ComplianceFramework::factory()->create();
        $assigned = ComplianceSubmission::factory()->create([
            'tenant_id' => $tenant->id,
            'compliance_framework_id' => $framework->id,
            'title' => 'Visible assigned submission',
        ]);
        $unassigned = ComplianceSubmission::factory()->create([
            'tenant_id' => $tenant->id,
            'compliance_framework_id' => $framework->id,
            'title' => 'Hidden unassigned submission',
        ]);
        $assignedToOther = ComplianceSubmission::factory()->create([
            'tenant_id' => $tenant->id,
            'compliance_framework_id' => $framework->id,
            'title' => 'Hidden other employee submission',
        ]);

        ComplianceSubmissionAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $assigned->id,
            'assigned_to_user_id' => $employee->id,
            'assigned_by' => $admin->id,
            'assigned_at' => now(),
        ]);

        ComplianceSubmissionAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $assignedToOther->id,
            'assigned_to_user_id' => $otherEmployee->id,
            'assigned_by' => $admin->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($employee)->get(route('submissions.index'));

        $response->assertOk();
        $response->assertSee('Visible assigned submission');
        $response->assertDontSee('Hidden unassigned submission');
        $response->assertDontSee('Hidden other employee submission');

        $this->actingAs($employee)->get(route('submissions.show', $assigned))->assertOk();
        $this->actingAs($employee)->get(route('submissions.show', $unassigned))->assertForbidden();
    }

    public function test_employee_can_save_responses_only_for_assigned_submission(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create();
        $admin = User::factory()->forTenant($tenant)->create();
        $admin->assignRole('company_admin');

        $employee = User::factory()->forTenant($tenant)->create();
        $employee->assignRole('employee');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employee->id,
            'department_id' => null,
            'job_title' => 'Analyst',
            'branch' => 'Harare',
            'phone' => '+263772000000',
        ]);

        $framework = ComplianceFramework::factory()->create();
        $section = ComplianceSection::factory()->for($framework, 'framework')->create();
        $question = ComplianceQuestion::factory()->for($section, 'section')->create([
            'answer_type' => 'yes_no_partial',
        ]);
        $assigned = ComplianceSubmission::factory()->create([
            'tenant_id' => $tenant->id,
            'compliance_framework_id' => $framework->id,
        ]);
        $unassigned = ComplianceSubmission::factory()->create([
            'tenant_id' => $tenant->id,
            'compliance_framework_id' => $framework->id,
        ]);

        ComplianceSubmissionAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $assigned->id,
            'assigned_to_user_id' => $employee->id,
            'assigned_by' => $admin->id,
            'assigned_at' => now(),
        ]);

        $payload = [
            'responses' => [
                [
                    'compliance_question_id' => $question->id,
                    'answer_value' => 'yes',
                    'answer_text' => null,
                    'comment_text' => 'Control implemented.',
                ],
            ],
        ];

        $this->actingAs($employee)
            ->post(route('submissions.responses.store', $assigned), $payload)
            ->assertRedirect();

        $this->assertDatabaseHas('compliance_responses', [
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $assigned->id,
            'compliance_question_id' => $question->id,
            'answered_by' => $employee->id,
            'answer_value' => 'yes',
        ]);

        $this->actingAs($employee)
            ->post(route('submissions.responses.store', $unassigned), $payload)
            ->assertForbidden();

        $this->assertSame(1, ComplianceResponse::query()->count());
    }

    public function test_company_admin_can_upload_evidence_before_response_exists(): void
    {
        Storage::fake('private');
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->forTenant($tenant)->create();
        $user->assignRole('company_admin');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'department_id' => null,
            'job_title' => 'Compliance Lead',
            'branch' => 'Harare',
            'phone' => '+263771000000',
        ]);

        $framework = ComplianceFramework::factory()->create();
        $section = ComplianceSection::factory()->for($framework, 'framework')->create();
        $question = ComplianceQuestion::factory()->for($section, 'section')->create([
            'requires_evidence' => true,
        ]);
        $submission = ComplianceSubmission::factory()->create([
            'tenant_id' => $tenant->id,
            'compliance_framework_id' => $framework->id,
        ]);

        $response = $this->actingAs($user)->post(route('submissions.questions.evidence.store', [
            'complianceSubmission' => $submission,
            'complianceQuestion' => $question,
        ]), [
            'file' => UploadedFile::fake()->create('policy.pdf', 128, 'application/pdf'),
        ]);

        $response->assertRedirect();

        $evidenceFile = EvidenceFile::query()->firstOrFail();

        $this->assertDatabaseHas('compliance_responses', [
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $submission->id,
            'compliance_question_id' => $question->id,
            'status' => 'draft',
        ]);
        $this->assertSame($submission->id, $evidenceFile->compliance_submission_id);
        Storage::disk('private')->assertExists($evidenceFile->file_path);
    }
}
