<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\ComplianceResponse;
use App\Models\ComplianceFramework;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceSection;
use App\Models\ComplianceSubmission;
use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\CourseModule;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\EvidenceFile;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Tenant;
use App\Models\Test;
use App\Models\TestAssignment;
use App\Models\TestAttempt;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_show_includes_real_snapshot_training_assessment_and_compliance_data(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create([
            'status' => 'active',
            'name' => 'Acme Health',
        ]);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');

        $manager = User::factory()->forTenant($tenant)->create([
            'name' => 'Manager Jane',
            'email' => 'manager@example.com',
        ]);
        $manager->assignRole('company_admin');
        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $manager->id,
            'job_title' => 'Compliance Manager',
            'branch' => 'Harare',
            'phone' => '+263771000001',
        ]);

        $employeeUser = User::factory()->forTenant($tenant)->create([
            'name' => 'John Analyst',
            'email' => 'john@example.com',
        ]);
        $employeeUser->assignRole('employee');

        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Risk and Compliance',
        ]);

        $employeeProfile = EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employeeUser->id,
            'department_id' => $department->id,
            'manager_id' => $manager->id,
            'job_title' => 'Risk Analyst',
            'branch' => 'Bulawayo',
            'employee_number' => 'EMP-447',
            'employment_type' => 'Full-time',
            'phone' => '+263771000002',
            'start_date' => '2026-01-08',
            'risk_level' => 'medium',
            'status' => 'active',
        ]);

        $course = Course::factory()->create([
            'title' => 'Security Awareness 101',
        ]);

        CourseAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'course_id' => $course->id,
            'assigned_to_user_id' => $employeeUser->id,
            'assigned_by' => $manager->id,
            'assigned_at' => now()->subDays(5),
            'due_date' => now()->addDays(7),
            'status' => 'assigned',
        ]);

        $module = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Module One',
            'description' => 'Core learning content',
            'sort_order' => 1,
        ]);

        $lesson = Lesson::query()->create([
            'course_module_id' => $module->id,
            'title' => 'Recognising Phishing',
            'content_type' => 'text',
            'content_body' => 'Lesson content',
            'sort_order' => 1,
            'estimated_minutes' => 12,
            'status' => 'published',
        ]);

        LessonProgress::query()->create([
            'tenant_id' => $tenant->id,
            'lesson_id' => $lesson->id,
            'user_id' => $employeeUser->id,
            'status' => 'completed',
            'completed_at' => now()->subDay(),
        ]);

        $test = Test::factory()->create([
            'title' => 'Quarterly Awareness Test',
        ]);

        TestAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'test_id' => $test->id,
            'assigned_to_user_id' => $employeeUser->id,
            'assigned_by' => $manager->id,
            'assigned_at' => now()->subDays(3),
            'due_date' => now()->addDays(4),
            'status' => 'assigned',
        ]);

        TestAttempt::query()->create([
            'tenant_id' => $tenant->id,
            'test_id' => $test->id,
            'user_id' => $employeeUser->id,
            'attempt_number' => 1,
            'started_at' => now()->subHours(7),
            'submitted_at' => now()->subHours(6),
            'score' => 8,
            'percentage' => 80,
            'result_status' => 'passed',
        ]);

        $framework = ComplianceFramework::factory()->create([
            'name' => 'Data Protection Baseline',
        ]);

        $section = ComplianceSection::factory()->create([
            'compliance_framework_id' => $framework->id,
        ]);

        $question = ComplianceQuestion::factory()->create([
            'compliance_section_id' => $section->id,
            'question_text' => 'Are privacy notices current?',
        ]);

        $submission = ComplianceSubmission::factory()->create([
            'tenant_id' => $tenant->id,
            'compliance_framework_id' => $framework->id,
            'title' => 'March Readiness',
        ]);

        $response = ComplianceResponse::query()->create([
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $submission->id,
            'compliance_question_id' => $question->id,
            'answer_text' => 'Completed',
            'response_score' => 92,
            'status' => 'completed',
            'answered_by' => $employeeUser->id,
            'answered_at' => now()->subHours(2),
        ]);

        EvidenceFile::query()->create([
            'tenant_id' => $tenant->id,
            'compliance_submission_id' => $submission->id,
            'compliance_response_id' => $response->id,
            'file_name' => 'evidence.pdf',
            'original_name' => 'policy-evidence.pdf',
            'file_path' => 'evidence/policy-evidence.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
            'uploaded_by' => $employeeUser->id,
            'uploaded_at' => now()->subHour(),
            'review_status' => 'pending',
        ]);

        AuditLog::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employeeUser->id,
            'action' => 'submission_submitted',
            'entity_type' => 'compliance_submission',
            'entity_id' => $submission->id,
            'created_at' => now()->subMinutes(30),
        ]);

        $response = $this->actingAs($superAdmin)->get(route('employees.show', $employeeProfile));

        $response
            ->assertOk()
            ->assertSee('employees/show')
            ->assertSee('Risk and Compliance')
            ->assertSee('Bulawayo')
            ->assertSee('EMP-447')
            ->assertSee('Security Awareness 101')
            ->assertSee('Recognising Phishing')
            ->assertSee('Quarterly Awareness Test')
            ->assertSee('Data Protection Baseline')
            ->assertSee('policy-evidence.pdf')
            ->assertSee('submission_submitted');
    }
}
