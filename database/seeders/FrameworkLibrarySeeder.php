<?php

namespace Database\Seeders;

use App\Models\ComplianceFramework;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceSection;
use Illuminate\Database\Seeder;

class FrameworkLibrarySeeder extends Seeder
{
    public function run(): void
    {
        $frameworkBlueprints = [
            ['name' => 'Data Protection Readiness', 'version' => '1.0', 'status' => 'published'],
            ['name' => 'Zimbabwe Privacy Governance', 'version' => '1.2', 'status' => 'published'],
            ['name' => 'Cyber Hygiene Baseline', 'version' => '2.0', 'status' => 'published'],
            ['name' => 'Records Management Controls', 'version' => '1.1', 'status' => 'draft'],
            ['name' => 'Data Subject Rights Operations', 'version' => '1.0', 'status' => 'published'],
            ['name' => 'Third-Party Risk Assurance', 'version' => '2.1', 'status' => 'published'],
            ['name' => 'Breach Response Preparedness', 'version' => '1.0', 'status' => 'draft'],
            ['name' => 'Access Control Governance', 'version' => '1.3', 'status' => 'published'],
            ['name' => 'Retention And Disposal Standard', 'version' => '1.0', 'status' => 'published'],
            ['name' => 'Cross-Border Transfer Assessment', 'version' => '0.9', 'status' => 'draft'],
        ];

        $sectionBlueprints = [
            [
                'name' => 'Governance',
                'description' => 'Policy ownership, oversight, and accountability controls.',
                'weight' => 3,
                'questions' => [
                    ['code' => 'GOV-01', 'question_text' => 'Has the organization approved a formal privacy governance policy?', 'answer_type' => 'yes_no_partial', 'weight' => 3, 'requires_evidence' => true],
                    ['code' => 'GOV-02', 'question_text' => 'Describe the privacy governance forum or committee used by the company.', 'answer_type' => 'text', 'weight' => 2, 'requires_evidence' => false],
                    ['code' => 'GOV-03', 'question_text' => 'What percentage of high-risk privacy actions were closed on time?', 'answer_type' => 'score', 'weight' => 2, 'requires_evidence' => false],
                    ['code' => 'GOV-04', 'question_text' => 'When was the privacy governance policy last approved or reviewed?', 'answer_type' => 'date', 'weight' => 1, 'requires_evidence' => false],
                ],
            ],
            [
                'name' => 'Data Lifecycle',
                'description' => 'Collection, use, retention, and disposal controls.',
                'weight' => 2,
                'questions' => [
                    ['code' => 'DLC-01', 'question_text' => 'Are retention periods documented for personal data categories?', 'answer_type' => 'yes_no_partial', 'weight' => 3, 'requires_evidence' => true],
                    ['code' => 'DLC-02', 'question_text' => 'Explain how personal data disposal is performed across business units.', 'answer_type' => 'text', 'weight' => 2, 'requires_evidence' => false],
                    ['code' => 'DLC-03', 'question_text' => 'How many systems currently have documented data maps?', 'answer_type' => 'score', 'weight' => 1, 'requires_evidence' => false],
                    ['code' => 'DLC-04', 'question_text' => 'When was the data inventory last refreshed?', 'answer_type' => 'date', 'weight' => 1, 'requires_evidence' => false],
                ],
            ],
            [
                'name' => 'Security And Response',
                'description' => 'Operational controls, response readiness, and evidence-backed assurance.',
                'weight' => 3,
                'questions' => [
                    ['code' => 'SEC-01', 'question_text' => 'Is there a documented breach response process for personal data incidents?', 'answer_type' => 'yes_no_partial', 'weight' => 3, 'requires_evidence' => true],
                    ['code' => 'SEC-02', 'question_text' => 'Summarize how privacy incidents are escalated and tracked.', 'answer_type' => 'text', 'weight' => 2, 'requires_evidence' => false],
                    ['code' => 'SEC-03', 'question_text' => 'How many privacy drills or tabletop exercises were completed this year?', 'answer_type' => 'score', 'weight' => 1, 'requires_evidence' => false],
                    ['code' => 'SEC-04', 'question_text' => 'When was the last breach response simulation executed?', 'answer_type' => 'date', 'weight' => 1, 'requires_evidence' => false],
                ],
            ],
        ];

        foreach ($frameworkBlueprints as $frameworkIndex => $frameworkData) {
            $framework = ComplianceFramework::query()->firstOrCreate(
                ['name' => $frameworkData['name'], 'version' => $frameworkData['version']],
                [
                    'description' => 'Seeded framework library entry for privacy and data protection assessments.',
                    'status' => $frameworkData['status'],
                ]
            );

            foreach ($sectionBlueprints as $sectionIndex => $sectionData) {
                $section = ComplianceSection::query()->firstOrCreate(
                    [
                        'compliance_framework_id' => $framework->id,
                        'name' => $sectionData['name'],
                    ],
                    [
                        'description' => $sectionData['description'],
                        'sort_order' => $sectionIndex + 1,
                        'weight' => $sectionData['weight'],
                    ]
                );

                foreach ($sectionData['questions'] as $questionIndex => $questionData) {
                    ComplianceQuestion::query()->firstOrCreate(
                        [
                            'compliance_section_id' => $section->id,
                            'code' => $questionData['code'].'-'.str_pad((string) ($frameworkIndex + 1), 2, '0', STR_PAD_LEFT),
                        ],
                        [
                            'question_text' => $questionData['question_text'],
                            'answer_type' => $questionData['answer_type'],
                            'weight' => $questionData['weight'],
                            'requires_evidence' => $questionData['requires_evidence'],
                            'guidance_text' => 'Seeded guidance text for framework library questions. Tailor this per framework before publishing.',
                            'sort_order' => $questionIndex + 1,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
