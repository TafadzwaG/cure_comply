<?php

namespace App\Http\Controllers;

use App\Http\Requests\CourseModuleRequest;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\RedirectResponse;

class CourseModuleController extends Controller
{
    public function store(CourseModuleRequest $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $module = $course->modules()->create([
            'title' => $request->string('title')->toString(),
            'description' => $request->input('description'),
            'sort_order' => $request->integer('sort_order') ?: (($course->modules()->max('sort_order') ?? 0) + 1),
        ]);

        app(\App\Services\AuditLogService::class)->logModelCreated('course_module_created', $module);

        return redirect()
            ->route('courses.show', ['course' => $course, 'tab' => 'modules'])
            ->with('success', 'Module added to the course.');
    }

    public function update(CourseModuleRequest $request, Course $course, CourseModule $module): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id, 404);

        $oldValues = $module->toArray();
        $module->update($request->validated());
        app(\App\Services\AuditLogService::class)->logModelUpdated('course_module_updated', $module, $oldValues);

        return redirect()
            ->route('courses.show', ['course' => $course, 'tab' => 'modules'])
            ->with('success', 'Module updated.');
    }

    public function destroy(Course $course, CourseModule $module): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id, 404);

        $oldValues = $module->toArray();
        $module->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('course_module_deleted', $module, $oldValues);

        return redirect()
            ->route('courses.show', ['course' => $course, 'tab' => 'modules'])
            ->with('success', 'Module deleted.');
    }
}
