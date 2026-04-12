<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\CourseModule;
use App\Models\EmployeeProfile;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeCourseWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    protected function employeeForTenant(Tenant $tenant): User
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $employee = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $employee->assignRole('employee');

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $employee->id,
            'job_title' => 'Analyst',
            'branch' => 'Harare',
            'phone' => '+263771000200',
        ]);

        return $employee;
    }

    protected function addPublishedLesson(Course $course, string $title = 'Published lesson'): Lesson
    {
        $module = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => $title.' module',
            'sort_order' => 1,
        ]);

        return Lesson::query()->create([
            'course_module_id' => $module->id,
            'title' => $title,
            'content_type' => 'text',
            'content_body' => 'Lesson content',
            'sort_order' => 1,
            'status' => 'published',
        ]);
    }

    public function test_employee_courses_index_shows_mandatory_and_public_workspace(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->employeeForTenant($tenant);
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->assignRole('company_admin');

        $mandatoryCourse = Course::factory()->create(['title' => 'Mandatory Privacy Course', 'status' => 'published']);
        $publicCourse = Course::factory()->create(['title' => 'Public Awareness Course', 'status' => 'published']);
        $draftCourse = Course::factory()->create(['title' => 'Draft Hidden Course', 'status' => 'draft']);
        $lesson = $this->addPublishedLesson($mandatoryCourse);
        $this->addPublishedLesson($publicCourse);
        $this->addPublishedLesson($draftCourse);

        CourseAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'course_id' => $mandatoryCourse->id,
            'assigned_to_user_id' => $employee->id,
            'assigned_by' => $admin->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        LessonProgress::query()->create([
            'tenant_id' => $tenant->id,
            'lesson_id' => $lesson->id,
            'user_id' => $employee->id,
            'completed_at' => now(),
            'status' => 'completed',
        ]);

        $response = $this->actingAs($employee)->get(route('courses.index'));

        $response->assertOk();
        $response->assertSee('employeeWorkspace');
        $response->assertSee('Mandatory Privacy Course');
        $response->assertSee('Public Awareness Course');
        $response->assertDontSee('Draft Hidden Course');
    }

    public function test_employee_assignments_index_uses_the_same_course_workspace(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->employeeForTenant($tenant);
        $publicCourse = Course::factory()->create(['title' => 'Optional Security Course', 'status' => 'published']);
        $this->addPublishedLesson($publicCourse);

        $response = $this->actingAs($employee)->get(route('assignments.index'));

        $response->assertOk();
        $response->assertSee('employeeWorkspace');
        $response->assertSee('Optional Security Course');
    }

    public function test_employee_can_start_a_public_course_and_reuses_the_self_assignment(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->employeeForTenant($tenant);
        $course = Course::factory()->create(['status' => 'published']);
        $this->addPublishedLesson($course);

        $firstResponse = $this->actingAs($employee)->post(route('courses.self-assign', $course));
        $assignment = CourseAssignment::query()->firstOrFail();

        $firstResponse->assertRedirect(route('assignments.show', $assignment));
        $this->assertSame($employee->id, $assignment->assigned_to_user_id);
        $this->assertSame($employee->id, $assignment->assigned_by);

        $this->actingAs($employee)->post(route('courses.self-assign', $course))
            ->assertRedirect(route('assignments.show', $assignment));

        $this->assertDatabaseCount('course_assignments', 1);
    }

    public function test_mandatory_assignment_takes_precedence_over_public_self_start(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->employeeForTenant($tenant);
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->assignRole('company_admin');
        $course = Course::factory()->create(['status' => 'published']);
        $this->addPublishedLesson($course);

        $assignment = CourseAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'course_id' => $course->id,
            'assigned_to_user_id' => $employee->id,
            'assigned_by' => $admin->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        $this->actingAs($employee)->post(route('courses.self-assign', $course))
            ->assertRedirect(route('assignments.show', $assignment));

        $this->assertDatabaseCount('course_assignments', 1);
    }
}
