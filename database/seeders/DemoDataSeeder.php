<?php

namespace Database\Seeders;

use App\Enums\UserStatus;
use App\Models\ComplianceFramework;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceSection;
use App\Models\ComplianceSubmission;
use App\Models\Course;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Question;
use App\Models\Tenant;
use App\Models\Test;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = collect(range(1, 10))->map(function (int $number) {
            return Tenant::factory()->create([
                'name' => 'Privacy Cure Tenant '.$number,
                'status' => 'active',
            ]);
        });

        $departmentNames = ['Compliance', 'IT Security', 'Finance', 'Operations', 'Human Resources'];
        $seededTenantUsers = collect();

        foreach ($tenants as $index => $tenant) {
            $departments = collect($departmentNames)->map(function (string $name) use ($tenant, $index) {
                return Department::factory()->create([
                    'tenant_id' => $tenant->id,
                    'name' => $name.' '.($index + 1),
                    'status' => 'active',
                ]);
            });

            $companyAdmin = $this->createTenantUser($tenant, 'company_admin', [
                'name' => 'Company Admin '.($index + 1),
                'email' => 'company-admin-'.$tenant->id.'@privacycure.test',
            ], $departments->first());

            $reviewer = $this->createTenantUser($tenant, 'reviewer', [
                'name' => 'Reviewer '.($index + 1),
                'email' => 'reviewer-'.$tenant->id.'@privacycure.test',
            ], $departments->get(1));

            $employeeOne = $this->createTenantUser($tenant, 'employee', [
                'name' => 'Employee A '.($index + 1),
                'email' => 'employee-a-'.$tenant->id.'@privacycure.test',
            ], $departments->get(2));

            $employeeTwo = $this->createTenantUser($tenant, 'employee', [
                'name' => 'Employee B '.($index + 1),
                'email' => 'employee-b-'.$tenant->id.'@privacycure.test',
            ], $departments->get(3));

            $seededTenantUsers->push($companyAdmin, $reviewer, $employeeOne, $employeeTwo);
        }

        $primaryAdmin = $seededTenantUsers->firstWhere(fn (User $user) => $user->hasRole('company_admin'));
        $primaryEmployee = $seededTenantUsers->firstWhere(fn (User $user) => $user->hasRole('employee'));
        $primaryTenant = $tenants->first();

        $course = Course::factory()->create([
            'created_by' => $primaryAdmin?->id,
        ]);

        $test = Test::factory()->create([
            'course_id' => $course->id,
            'created_by' => $primaryAdmin?->id,
        ]);

        $question = Question::query()->create([
            'test_id' => $test->id,
            'question_type' => 'single_choice',
            'question_text' => 'Which response best protects personal data?',
            'marks' => 1,
            'sort_order' => 1,
        ]);

        $question->options()->createMany([
            ['question_id' => $question->id, 'option_text' => 'Share passwords', 'is_correct' => false, 'sort_order' => 1],
            ['question_id' => $question->id, 'option_text' => 'Use strong passwords', 'is_correct' => true, 'sort_order' => 2],
        ]);

        $framework = ComplianceFramework::factory()->create();

        $section = ComplianceSection::query()->create([
            'compliance_framework_id' => $framework->id,
            'name' => 'Governance',
            'sort_order' => 1,
            'weight' => 1,
        ]);

        ComplianceQuestion::query()->create([
            'compliance_section_id' => $section->id,
            'code' => 'DP-1',
            'question_text' => 'Do you maintain a privacy notice?',
            'answer_type' => 'yes_no_partial',
            'weight' => 1,
            'requires_evidence' => true,
            'sort_order' => 1,
        ]);

        ComplianceQuestion::query()->create([
            'compliance_section_id' => $section->id,
            'code' => 'DP-2',
            'question_text' => 'When was the privacy notice last reviewed?',
            'answer_type' => 'date',
            'weight' => 1,
            'requires_evidence' => false,
            'guidance_text' => 'Capture the most recent documented review date.',
            'sort_order' => 2,
        ]);

        ComplianceSubmission::query()->create([
            'tenant_id' => $primaryTenant?->id,
            'compliance_framework_id' => $framework->id,
            'title' => 'Q1 Submission',
            'reporting_period' => '2026-Q1',
            'status' => 'draft',
            'submitted_by' => $primaryEmployee?->id,
        ]);
    }

    protected function createTenantUser(Tenant $tenant, string $role, array $attributes, ?Department $department = null): User
    {
        $user = User::factory()->forTenant($tenant)->create([
            ...$attributes,
            'password' => Hash::make('password'),
            'status' => UserStatus::Active,
        ]);

        $user->assignRole($role);

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'department_id' => $department?->id,
            'job_title' => Str::headline(str_replace('_', ' ', $role)),
            'status' => 'active',
        ]);

        return $user;
    }
}
