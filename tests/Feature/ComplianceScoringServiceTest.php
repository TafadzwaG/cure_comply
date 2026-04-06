<?php

namespace Tests\Feature;

use App\Models\ComplianceFramework;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceResponse;
use App\Models\ComplianceSection;
use App\Models\ComplianceSubmission;
use App\Models\EvidenceFile;
use App\Models\Tenant;
use App\Services\ComplianceScoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComplianceScoringServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_required_evidence_caps_score_and_rejected_evidence_reduces_to_twenty(): void
    {
        $tenant = Tenant::factory()->create();
        $framework = ComplianceFramework::factory()->create();
        $section = ComplianceSection::query()->create([
            'compliance_framework_id' => $framework->id,
            'name' => 'Governance',
            'sort_order' => 1,
            'weight' => 1,
        ]);
        $question = ComplianceQuestion::query()->create([
            'compliance_section_id' => $section->id,
            'question_text' => 'Do you keep a privacy notice?',
            'answer_type' => 'yes_no_partial',
            'weight' => 1,
            'requires_evidence' => true,
            'sort_order' => 1,
        ]);
        $submission = ComplianceSubmission::query()->create([
            'tenant_id' => $tenant->id,
            'compliance_framework_id' => $framework->id,
            'title' => 'Q1',
            'status' => 'submitted',
        ]);

        $response = ComplianceResponse::query()->create([
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $submission->id,
            'compliance_question_id' => $question->id,
            'answer_value' => 'yes',
            'status' => 'completed',
        ]);

        $service = app(ComplianceScoringService::class);

        $this->assertSame(40.0, $service->scoreResponse($question, $response));

        EvidenceFile::query()->create([
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $submission->id,
            'compliance_response_id' => $response->id,
            'file_name' => 'evidence.pdf',
            'original_name' => 'evidence.pdf',
            'file_path' => 'evidence.pdf',
            'review_status' => 'rejected',
        ]);

        $response->load('evidenceFiles');

        $this->assertSame(20.0, $service->scoreResponse($question, $response));
    }
}
