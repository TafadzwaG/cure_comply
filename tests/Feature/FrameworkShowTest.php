<?php

namespace Tests\Feature;

use App\Models\ComplianceFramework;
use App\Models\ComplianceSection;
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

    public function test_super_admin_can_add_framework_sections_and_questions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('super_admin');

        $framework = ComplianceFramework::factory()->create();

        $this->actingAs($user)
            ->post(route('frameworks.sections.store', $framework), [
                'name' => 'Governance',
                'description' => 'Board and management controls.',
                'sort_order' => 1,
                'weight' => 1,
            ])
            ->assertRedirect();

        $section = ComplianceSection::query()
            ->where('compliance_framework_id', $framework->id)
            ->firstOrFail();

        $this->assertDatabaseHas('compliance_sections', [
            'id' => $section->id,
            'name' => 'Governance',
        ]);

        $this->actingAs($user)
            ->post(route('sections.questions.store', $section), [
                'code' => 'GOV-001',
                'question_text' => 'Has the company appointed a data protection lead?',
                'answer_type' => 'yes_no_partial',
                'weight' => 1,
                'requires_evidence' => true,
                'guidance_text' => 'Upload appointment letters or governance minutes.',
                'sort_order' => 1,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('compliance_questions', [
            'compliance_section_id' => $section->id,
            'code' => 'GOV-001',
            'answer_type' => 'yes_no_partial',
            'requires_evidence' => true,
            'is_active' => true,
        ]);
    }
}
