<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicTrainingFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function addLesson(Course $course, string $title, string $status = 'published'): Lesson
    {
        $module = CourseModule::query()->firstOrCreate(
            ['course_id' => $course->id, 'title' => 'Main module'],
            ['sort_order' => 1]
        );

        return Lesson::query()->create([
            'course_module_id' => $module->id,
            'title' => $title,
            'content_type' => 'text',
            'content_body' => 'Training content',
            'sort_order' => 1,
            'status' => $status,
        ]);
    }

    public function test_public_training_index_shows_published_courses_only(): void
    {
        $published = Course::factory()->create(['title' => 'Published Awareness', 'status' => 'published']);
        $draft = Course::factory()->create(['title' => 'Draft Awareness', 'status' => 'draft']);
        $archived = Course::factory()->create(['title' => 'Archived Awareness', 'status' => 'archived']);

        $this->addLesson($published, 'Published lesson');
        $this->addLesson($draft, 'Draft lesson');
        $this->addLesson($archived, 'Archived lesson');

        $response = $this->get(route('training.index'));

        $response->assertOk();
        $response->assertSee('Published Awareness');
        $response->assertDontSee('Draft Awareness');
        $response->assertDontSee('Archived Awareness');
    }

    public function test_landing_page_header_links_to_public_training(): void
    {
        $welcomeSource = file_get_contents(resource_path('js/pages/welcome.tsx'));

        $this->assertStringContainsString('WelcomeHeader', $welcomeSource);
        $this->assertStringContainsString("route('training.index')", $welcomeSource);
        $this->assertStringContainsString('Training', $welcomeSource);
    }

    public function test_public_training_show_displays_published_lessons_and_active_tenants_only(): void
    {
        $activeTenant = Tenant::factory()->create(['name' => 'Active Company', 'status' => 'active']);
        $inactiveTenant = Tenant::factory()->create(['name' => 'Inactive Company', 'status' => 'inactive']);
        $course = Course::factory()->create(['title' => 'Shareable Training', 'status' => 'published']);
        $this->addLesson($course, 'Visible lesson');
        $this->addLesson($course, 'Hidden draft lesson', 'draft');

        $response = $this->get(route('training.show', $course->slug));

        $response->assertOk();
        $response->assertSee('Shareable Training');
        $response->assertSee('Visible lesson');
        $response->assertDontSee('Hidden draft lesson');
        $response->assertSee($activeTenant->name);
        $response->assertDontSee($inactiveTenant->name);
    }

    public function test_public_training_acknowledgement_requires_name_tenant_and_checkbox(): void
    {
        $course = Course::factory()->create(['status' => 'published']);

        $response = $this->from(route('training.show', $course->slug))
            ->post(route('training.acknowledgements.store', $course->slug), []);

        $response->assertRedirect(route('training.show', $course->slug));
        $response->assertSessionHasErrors(['tenant_id', 'full_name', 'acknowledgement']);
    }

    public function test_public_training_acknowledgement_is_stored_without_assignment_progress(): void
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $course = Course::factory()->create(['status' => 'published']);
        $this->addLesson($course, 'A lesson');

        $response = $this->post(route('training.acknowledgements.store', $course->slug), [
            'tenant_id' => $tenant->id,
            'full_name' => 'Jane Public',
            'acknowledgement' => '1',
        ]);

        $response->assertRedirect(route('training.show', $course->slug));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('public_training_acknowledgements', [
            'tenant_id' => $tenant->id,
            'course_id' => $course->id,
            'full_name' => 'Jane Public',
        ]);
        $this->assertDatabaseCount('course_assignments', 0);
        $this->assertDatabaseCount('lesson_progress', 0);
    }

    public function test_reports_include_public_training_acknowledgements_for_visible_tenant(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active']);
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->assignRole('company_admin');
        $admin->employeeProfile()->create([
            'tenant_id' => $tenant->id,
            'status' => 'active',
            'job_title' => 'Company Administrator',
            'branch' => 'Harare',
            'phone' => '+263777000111',
        ]);
        $course = Course::factory()->create(['title' => 'Public POPIA', 'status' => 'published']);

        $this->post(route('training.acknowledgements.store', $course->slug), [
            'tenant_id' => $tenant->id,
            'full_name' => 'Visible Learner',
            'acknowledgement' => '1',
        ]);
        $this->post(route('training.acknowledgements.store', $course->slug), [
            'tenant_id' => $otherTenant->id,
            'full_name' => 'Hidden Learner',
            'acknowledgement' => '1',
        ]);

        $response = $this->actingAs($admin)->get(route('reports.index'));

        $response->assertOk();
        $response->assertSee('publicTrainingAcknowledgements');
        $response->assertSee('Visible Learner');
        $response->assertDontSee('Hidden Learner');
    }
}
