<?php

namespace Tests\Feature;

use App\Enums\CourseAssignmentStatus;
use App\Enums\LessonStatus;
use App\Enums\TestAttemptResultStatus;
use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\CourseModule;
use App\Models\EmployeeProfile;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Tenant;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeCertificatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_sees_completed_course_and_passed_test_certificates(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        [$tenant, $employee] = $this->employee();

        $earnedCourse = Course::factory()->create([
            'title' => 'Privacy Awareness Essentials',
            'estimated_minutes' => 45,
        ]);
        $module = CourseModule::query()->create([
            'course_id' => $earnedCourse->id,
            'title' => 'Core privacy',
            'sort_order' => 1,
        ]);
        $lesson = Lesson::query()->create([
            'course_module_id' => $module->id,
            'title' => 'Policy basics',
            'content_type' => 'text',
            'content_body' => 'Learn the basics.',
            'estimated_minutes' => 10,
            'sort_order' => 1,
            'status' => LessonStatus::Published,
        ]);
        $assignment = CourseAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'course_id' => $earnedCourse->id,
            'assigned_to_user_id' => $employee->id,
            'assigned_by' => null,
            'status' => CourseAssignmentStatus::Completed,
            'assigned_at' => now()->subWeek(),
        ]);
        LessonProgress::query()->create([
            'tenant_id' => $tenant->id,
            'lesson_id' => $lesson->id,
            'user_id' => $employee->id,
            'completed_at' => now(),
            'status' => CourseAssignmentStatus::Completed,
        ]);

        $incompleteCourse = Course::factory()->create(['title' => 'Unfinished Security Course']);
        CourseAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'course_id' => $incompleteCourse->id,
            'assigned_to_user_id' => $employee->id,
            'assigned_by' => null,
            'status' => CourseAssignmentStatus::Assigned,
            'assigned_at' => now(),
        ]);

        $passedTest = Test::factory()->create(['title' => 'Data Protection Check']);
        TestAttempt::query()->create([
            'tenant_id' => $tenant->id,
            'test_id' => $passedTest->id,
            'user_id' => $employee->id,
            'attempt_number' => 1,
            'started_at' => now()->subMinutes(20),
            'submitted_at' => now()->subMinutes(5),
            'score' => 8,
            'percentage' => 80,
            'result_status' => TestAttemptResultStatus::Passed,
            'time_spent_seconds' => 900,
        ]);

        $failedTest = Test::factory()->create(['title' => 'Failed Assessment']);
        TestAttempt::query()->create([
            'tenant_id' => $tenant->id,
            'test_id' => $failedTest->id,
            'user_id' => $employee->id,
            'attempt_number' => 1,
            'started_at' => now()->subMinutes(20),
            'submitted_at' => now()->subMinutes(5),
            'score' => 4,
            'percentage' => 40,
            'result_status' => TestAttemptResultStatus::Failed,
            'time_spent_seconds' => 900,
        ]);

        $response = $this->actingAs($employee)->get(route('certificates.index'));

        $response->assertOk();
        $response->assertSee('Privacy Awareness Essentials');
        $response->assertSee('Data Protection Check');
        $response->assertDontSee('Unfinished Security Course');
        $response->assertDontSee('Failed Assessment');

        $this->actingAs($employee)->get(route('certificates.course.show', $assignment))->assertOk();
    }

    public function test_employee_help_page_loads(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        [, $employee] = $this->employee();

        $this->actingAs($employee)
            ->get(route('help.index'))
            ->assertOk()
            ->assertSee('Continue training');
    }

    protected function employee(): array
    {
        $tenant = Tenant::factory()->create();
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

        return [$tenant, $employee];
    }
}
