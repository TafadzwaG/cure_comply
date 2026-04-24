<?php

namespace Database\Seeders;

use App\Enums\ComplianceAnswerType;
use App\Models\ComplianceFramework;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceSection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrivacyCureAssessmentFrameworkSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $framework = ComplianceFramework::withTrashed()
                ->where('name', 'Privacy Cure Data Protection Assessment')
                ->where('version', '2026.04')
                ->first();

            if ($framework === null) {
                $framework = new ComplianceFramework([
                    'name' => 'Privacy Cure Data Protection Assessment',
                    'version' => '2026.04',
                ]);
            }

            $framework->fill([
                'description' => 'Assessment framework extracted from the Privacy Cure assessment documents. It covers third-party data privacy governance, external-party risk management, HR security controls, onboarding, employment changes, termination, and alignment with CDPA Chapter 12:07.',
                'status' => 'published',
            ]);

            if ($framework->trashed()) {
                $framework->restore();
            }

            $framework->save();

            $sectionIds = ComplianceSection::withTrashed()
                ->where('compliance_framework_id', $framework->id)
                ->pluck('id');

            if ($sectionIds->isNotEmpty()) {
                ComplianceQuestion::withTrashed()
                    ->whereIn('compliance_section_id', $sectionIds)
                    ->forceDelete();

                ComplianceSection::withTrashed()
                    ->whereIn('id', $sectionIds)
                    ->forceDelete();
            }

            foreach ($this->sections() as $sectionIndex => $sectionData) {
                $section = ComplianceSection::create([
                    'compliance_framework_id' => $framework->id,
                    'name' => $sectionData['name'],
                    'description' => $sectionData['description'],
                    'sort_order' => $sectionIndex + 1,
                    'weight' => $sectionData['weight'],
                ]);

                foreach ($sectionData['questions'] as $questionIndex => $questionData) {
                    ComplianceQuestion::create([
                        'compliance_section_id' => $section->id,
                        'code' => $questionData['code'],
                        'question_text' => $questionData['question'],
                        'answer_type' => $questionData['answer_type'],
                        'weight' => $questionData['weight'] ?? 1,
                        'requires_evidence' => true,
                        'guidance_text' => $this->guidance(
                            $sectionData['source'],
                            $sectionData['sub_domain'],
                            $questionData['guidance'] ?? null,
                            $questionData['source_response'] ?? null,
                        ),
                        'sort_order' => $questionIndex + 1,
                        'is_active' => true,
                    ]);
                }
            }
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function sections(): array
    {
        return [
            [
                'name' => 'Third-Party Data Privacy and Governance Audit',
                'description' => 'External-party, internal-organization, and risk-management controls extracted from PRIVACY CURE ASSESSMENT.pdf.',
                'sub_domain' => 'External Parties, Internal Organization, Risk Management',
                'source' => 'PRIVACY CURE ASSESSMENT.pdf',
                'weight' => 3,
                'questions' => [
                    $this->question('TPC-DPG-001', 'Does Touchstone Computer Systems have a formal agreement with AA Zimbabwe?', ComplianceAnswerType::YesNoPartial, 'Attach the signed agreement, contract, memorandum of understanding, or service-level agreement that governs the third-party relationship.'),
                    $this->question('TPC-DPG-002', 'What privacy policies and procedures are in place at Touchstone Computer Systems?', ComplianceAnswerType::Text, 'Describe the privacy policies and procedures currently in force and attach the controlled policy documents.', 'Internal Document'),
                    $this->question('TPC-DPG-003', 'How often are these policies reviewed?', ComplianceAnswerType::Text, 'State the review cadence and attach review records, approval minutes, or policy version history.', 'Annual'),
                    $this->question('TPC-DPG-004', 'Who is responsible for overseeing privacy within Touchstone Computer Systems?', ComplianceAnswerType::Text, 'Identify the accountable privacy owner, role, reporting line, and supporting appointment or responsibility evidence.', 'Cade Zvavanjanja'),
                    $this->question('TPC-DPG-005', 'Is Touchstone Computer Systems compliant with the Cyber and Data Protection Act 12:07?', ComplianceAnswerType::YesNoPartial, 'If compliant, attach the licence, certificate, registration evidence, or current compliance remediation plan.', 'Compliance under process'),
                    $this->question('TPC-DPG-006', 'How is the personal data stored?', ComplianceAnswerType::Text, 'Describe storage locations, systems, hosting model, access boundaries, backups, encryption, and operational safeguards.', 'Secure following ISO 27001 standards and best practices'),
                    $this->question('TPC-DPG-007', 'Are there measures in place to ensure data accuracy and integrity?', ComplianceAnswerType::YesNoPartial, 'Attach procedures or system controls for data validation, reconciliation, change control, and quality assurance.', 'Yes, best practices'),
                    $this->question('TPC-DPG-008', 'How long is personal data retained and what are the criteria for data retention?', ComplianceAnswerType::Text, 'Describe retention periods, legal or contractual retention criteria, disposal triggers, and evidence of retention policy approval.', 'Based on legal and client level agreements'),
                    $this->question('TPC-DPG-009', 'Who has access to personal data and how is access controlled?', ComplianceAnswerType::Text, 'Describe access roles, approval flow, review cadence, authentication controls, and attach access-control evidence.', 'Internal staff and client'),
                    $this->question('TPC-DPG-010', 'Are there any restrictions on the usage of personal data?', ComplianceAnswerType::YesNoPartial, 'Explain permitted and prohibited usage and attach contractual, policy, or data-processing restrictions.'),
                    $this->question('TPC-DPG-011', 'How is personal data usage monitored and audited?', ComplianceAnswerType::Text, 'Describe monitoring, logging, audit review, alerting, and reporting processes for data access and usage.'),
                    $this->question('TPC-DPG-012', 'What measures are in place to prevent unauthorized access to personal data?', ComplianceAnswerType::Text, 'Attach access-control, authentication, network, endpoint, and physical security evidence.', 'We follow ISO 27001 standards and best practices'),
                    $this->question('TPC-DPG-013', 'How is sensitive personal data protected?', ComplianceAnswerType::Text, 'Describe safeguards for sensitive personal data, including classification, encryption, masking, segregation, and restricted access.'),
                    $this->question('TPC-DPG-014', 'Are there any encryption methods used for data protection?', ComplianceAnswerType::YesNoPartial, 'Identify encryption methods for data at rest, data in transit, key management, and evidence of configuration or policy.'),
                    $this->question('TPC-DPG-015', 'What measures are in place to detect and respond to data breaches?', ComplianceAnswerType::Text, 'Describe incident detection, escalation, containment, investigation, notification, and post-incident improvement measures.', 'Best practice and Cyber Act'),
                    $this->question('TPC-DPG-016', 'What training programs are in place for employees regarding data privacy?', ComplianceAnswerType::Text, 'Attach training content, attendance records, completion reports, and refresher-training schedules.'),
                    $this->question('TPC-DPG-017', 'How are incidents documented, analyzed and reported to AA Zimbabwe concerning their data?', ComplianceAnswerType::Text, 'Describe incident recording, root-cause analysis, client notification timelines, reporting owners, and evidence templates.'),
                    $this->question('TPC-DPG-018', 'What steps are taken to prevent future incidents?', ComplianceAnswerType::Text, 'Describe corrective actions, preventive controls, lessons learned, and tracking of remediation closure.', 'Incident response policy'),
                    $this->question('TPC-DPG-019', 'How is personal data shared with other parties?', ComplianceAnswerType::Text, 'Describe transfer channels, approval rules, data minimization, transfer controls, and evidence of secure sharing processes.'),
                    $this->question('TPC-DPG-020', 'Which parties or stakeholders do you share AA Zimbabwe data with?', ComplianceAnswerType::Text, 'List each stakeholder or recipient category and attach relevant approvals or data-sharing agreements.', 'As per authorization of AAZ'),
                    $this->question('TPC-DPG-021', 'Which platforms or software do you utilize to process AA Zimbabwe data?', ComplianceAnswerType::Text, 'List applications, platforms, databases, and processing tools used for AA Zimbabwe data.', 'Internal Platform'),
                    $this->question('TPC-DPG-022', 'Do you use any cloud-based systems for processing and storing AA Zimbabwe data?', ComplianceAnswerType::YesNoPartial, 'State whether cloud services are used and attach supplier, hosting, and control evidence.'),
                    $this->question('TPC-DPG-023', 'If yes to the previous question, where are the systems geographically hosted?', ComplianceAnswerType::Text, 'State hosting countries, regions, data-center locations, and any cross-border transfer safeguards.', 'Zimbabwe'),
                    $this->question('TPC-DPG-024', 'What agreements are in place to ensure compliance with data privacy policies and laws?', ComplianceAnswerType::Text, 'Attach data-processing agreements, service agreements, privacy clauses, regulatory registrations, or compliance commitments.', 'Compliant'),
                    $this->question('TPC-DPG-025', 'What metrics are used to measure the effectiveness of data privacy practices?', ComplianceAnswerType::Text, 'List privacy metrics, KPIs, KRIs, audit measures, incident metrics, training metrics, and review cadence.', 'We follow ISO 27701'),
                    $this->question('TPC-DPG-026', 'How are these metrics tracked and reported to AA Zimbabwe?', ComplianceAnswerType::Text, 'Describe reporting frequency, responsible owner, report format, recipients, and escalation process.', 'As per service level agreement'),
                ],
            ],
            [
                'name' => 'Human Resource Security',
                'description' => 'Onboarding, prior-to-employment, termination, and change-of-employment controls extracted from PRIVACY CURE ASSESSMENT 2.pdf.',
                'sub_domain' => 'Onboarding, Prior to Employment, Termination & Change of employment',
                'source' => 'PRIVACY CURE ASSESSMENT 2.pdf',
                'weight' => 2,
                'questions' => [
                    $this->question('HR-SEC-001', 'Are comprehensive background checks conducted on potential employees to verify their suitability for roles involving access to sensitive consumer data?', ComplianceAnswerType::YesNoPartial, 'Attach screening policy, background-check evidence, consent records, or HR onboarding controls.'),
                    $this->question('HR-SEC-002', 'Do new hires sign confidentiality agreements that explicitly outline their responsibilities in protecting consumer data?', ComplianceAnswerType::YesNoPartial, 'Attach confidentiality agreement templates, signed examples, or onboarding acknowledgement records.'),
                    $this->question('HR-SEC-003', 'Is there an initial security training program that educates new employees on data protection policies and procedures?', ComplianceAnswerType::YesNoPartial, 'Attach induction training material, attendance logs, completion reports, or LMS records.'),
                    $this->question('HR-SEC-004', 'Are access controls established to ensure that new employees have the minimum necessary access to consumer data required for their roles?', ComplianceAnswerType::YesNoPartial, 'Attach joiner access forms, role-based-access matrix, approval records, and least-privilege controls.'),
                    $this->question('HR-SEC-005', 'Do employees acknowledge understanding and acceptance of data protection policies upon commencement of employment?', ComplianceAnswerType::YesNoPartial, 'Attach policy acknowledgement forms, onboarding checklist records, or electronic acknowledgement reports.'),
                    $this->question('HR-SEC-006', 'Are there regular training sessions to update employees on new data protection regulations and internal policies?', ComplianceAnswerType::YesNoPartial, 'Attach refresher-training schedules, employee completion reports, content updates, and attendance evidence.'),
                    $this->question('HR-SEC-007', 'Is employee access to consumer data regularly monitored and audited to detect unauthorized activities?', ComplianceAnswerType::YesNoPartial, 'Attach access reviews, monitoring logs, audit reports, exception reports, or remediation records.'),
                    $this->question('HR-SEC-008', 'Do performance evaluations include assessments of adherence to data protection policies?', ComplianceAnswerType::YesNoPartial, 'Attach appraisal templates, compliance objective examples, disciplinary procedures, or HR review evidence.'),
                    $this->question('HR-SEC-009', 'Is there a clear process for employees to report data breaches or security incidents?', ComplianceAnswerType::YesNoPartial, 'Attach incident reporting policy, escalation workflow, reporting channels, and awareness records.'),
                    $this->question('HR-SEC-010', 'Are employees promptly informed of updates to data protection policies and procedures?', ComplianceAnswerType::YesNoPartial, 'Attach change communications, policy update notices, acknowledgement records, or intranet publication evidence.'),
                    $this->question('HR-SEC-011', 'Is there a formal process to revoke access to consumer data upon employee termination?', ComplianceAnswerType::YesNoPartial, 'Attach leaver checklist, access revocation tickets, HR termination workflow, or system disablement evidence.'),
                    $this->question('HR-SEC-012', 'Are departing employees required to return all devices and materials containing consumer data?', ComplianceAnswerType::YesNoPartial, 'Attach asset return forms, clearance checklists, device wipe records, and offboarding evidence.'),
                    $this->question('HR-SEC-013', 'Do exit interviews include discussions on the obligation to maintain confidentiality post-employment?', ComplianceAnswerType::YesNoPartial, 'Attach exit interview checklist, confidentiality reminder templates, or signed post-employment obligations.'),
                    $this->question('HR-SEC-014', 'When an employee role changes, is their access to consumer data reviewed and adjusted accordingly?', ComplianceAnswerType::YesNoPartial, 'Attach mover process records, role-change approval forms, access review evidence, and role-based-access updates.'),
                    $this->question('HR-SEC-015', 'Are non-disclosure agreements reinforced during role changes or terminations to remind employees of their ongoing obligations?', ComplianceAnswerType::YesNoPartial, 'Attach NDA reminder notices, termination packs, role-change acknowledgements, or updated confidentiality records.'),
                    $this->question('HR-SEC-016', 'Are data protection policies and procedures clearly documented and accessible to all employees?', ComplianceAnswerType::YesNoPartial, 'Attach policy repository screenshots, policy index, intranet evidence, or controlled document records.'),
                    $this->question('HR-SEC-017', 'Does the organization regularly review its practices to ensure alignment with the latest requirements of the CDPA Chapter 12:07?', ComplianceAnswerType::YesNoPartial, 'Attach compliance review minutes, legal update tracking, gap assessments, or CDPA Chapter 12:07 review evidence.'),
                ],
            ],
        ];
    }

    private function question(string $code, string $question, ComplianceAnswerType $answerType, string $guidance, ?string $sourceResponse = null): array
    {
        return [
            'code' => $code,
            'question' => $question,
            'answer_type' => $answerType->value,
            'guidance' => $guidance,
            'source_response' => $sourceResponse,
        ];
    }

    private function guidance(string $source, string $subDomain, ?string $guidance, ?string $sourceResponse): string
    {
        $lines = [
            'Source document: '.$source,
            'Source sub-domain: '.$subDomain,
        ];

        if ($guidance !== null) {
            $lines[] = 'Assessment guidance: '.$guidance;
        }

        if ($sourceResponse !== null) {
            $lines[] = 'Source sample response: '.$sourceResponse;
        }

        $lines[] = 'Evidence expected: upload documents, screenshots, reports, approvals, policies, contracts, logs, or other records that support the answer.';

        return implode("\n", $lines);
    }
}
