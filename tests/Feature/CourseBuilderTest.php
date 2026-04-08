<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseBuilderTest extends TestCase
{
    use RefreshDatabase;

    protected function actingAsCourseManager(): User
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('super_admin');

        return $user;
    }

    public function test_creating_a_course_redirects_to_the_builder_show_page(): void
    {
        $user = $this->actingAsCourseManager();

        $response = $this->actingAs($user)->post(route('courses.store'), [
            'title' => 'POPIA Builder Course',
            'description' => 'A new course shell.',
            'status' => 'draft',
            'estimated_minutes' => 45,
        ]);

        $course = Course::query()->firstOrFail();

        $response->assertRedirect(route('courses.show', ['course' => $course->id, 'tab' => 'modules']));
        $this->assertDatabaseHas('courses', ['title' => 'POPIA Builder Course']);
    }

    public function test_authorized_user_can_create_modules_and_lessons(): void
    {
        $user = $this->actingAsCourseManager();
        $course = Course::factory()->create();

        $moduleResponse = $this->actingAs($user)->post(route('courses.modules.store', $course), [
            'title' => 'Introduction',
            'description' => 'Course opening module.',
            'sort_order' => 1,
        ]);

        $moduleResponse->assertRedirect(route('courses.show', ['course' => $course->id, 'tab' => 'modules']));

        $module = CourseModule::query()->firstOrFail();

        $lessonResponse = $this->actingAs($user)->post(route('courses.modules.lessons.store', ['course' => $course->id, 'module' => $module->id]), [
            'title' => 'What POPIA covers',
            'content_type' => 'text',
            'content_body' => 'Written lesson body.',
            'estimated_minutes' => 12,
            'sort_order' => 1,
            'status' => 'draft',
        ]);

        $lessonResponse->assertRedirect(route('courses.show', ['course' => $course->id, 'tab' => 'modules']));

        $this->assertDatabaseHas('course_modules', ['title' => 'Introduction', 'course_id' => $course->id]);
        $this->assertDatabaseHas('lessons', ['title' => 'What POPIA covers', 'course_module_id' => $module->id, 'content_type' => 'text']);
    }

    public function test_lessons_accept_trusted_video_links_and_reject_untrusted_links(): void
    {
        $user = $this->actingAsCourseManager();
        $course = Course::factory()->create();
        $module = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Video module',
            'sort_order' => 1,
        ]);

        $validResponse = $this->actingAs($user)->post(route('courses.modules.lessons.store', ['course' => $course->id, 'module' => $module->id]), [
            'title' => 'Trusted video lesson',
            'content_type' => 'video',
            'video_url' => 'https://youtu.be/dQw4w9WgXcQ',
            'estimated_minutes' => 5,
            'sort_order' => 1,
            'status' => 'draft',
        ]);

        $validResponse->assertSessionHasNoErrors();

        $lesson = Lesson::query()->where('title', 'Trusted video lesson')->firstOrFail();
        $this->assertSame('https://www.youtube.com/embed/dQw4w9WgXcQ', $lesson->embed_url);

        $invalidResponse = $this->from(route('courses.show', ['course' => $course->id, 'tab' => 'modules']))
            ->actingAs($user)
            ->post(route('courses.modules.lessons.store', ['course' => $course->id, 'module' => $module->id]), [
                'title' => 'Untrusted video lesson',
                'content_type' => 'video',
                'video_url' => 'https://example.com/video.mp4',
                'estimated_minutes' => 5,
                'sort_order' => 2,
                'status' => 'draft',
            ]);

        $invalidResponse->assertSessionHasErrors('video_url');
    }

    public function test_course_show_renders_modules_and_lessons_in_sort_order(): void
    {
        $user = $this->actingAsCourseManager();
        $course = Course::factory()->create(['title' => 'Ordered Course']);

        $moduleB = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Module B',
            'sort_order' => 2,
        ]);

        $moduleA = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Module A',
            'sort_order' => 1,
        ]);

        Lesson::query()->create([
            'course_module_id' => $moduleA->id,
            'title' => 'Lesson 2',
            'content_type' => 'text',
            'content_body' => 'Second lesson.',
            'sort_order' => 2,
            'status' => 'draft',
        ]);

        Lesson::query()->create([
            'course_module_id' => $moduleA->id,
            'title' => 'Lesson 1',
            'content_type' => 'text',
            'content_body' => 'First lesson.',
            'sort_order' => 1,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($user)->get(route('courses.show', ['course' => $course->id, 'tab' => 'modules']));

        $response->assertOk();
        $response->assertSeeInOrder(['Module A', 'Module B']);
        $response->assertSeeInOrder(['Lesson 1', 'Lesson 2']);
    }
}
