<?php

namespace Tests\Feature;

use App\Models\ComplianceFramework;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceSection;
use App\Models\ComplianceSubmission;
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
