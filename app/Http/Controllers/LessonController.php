<?php

namespace App\Http\Controllers;

use App\Http\Requests\LessonRequest;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    public function store(LessonRequest $request, Course $course, CourseModule $module): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id, 404);

        $lesson = $module->lessons()->create($this->payload($request, $module));

        app(\App\Services\AuditLogService::class)->logModelCreated('lesson_created', $lesson);

        return redirect()
            ->route('courses.show', ['course' => $course, 'tab' => 'modules'])
            ->with('success', 'Lesson added to the module.');
    }

    public function update(LessonRequest $request, Course $course, CourseModule $module, Lesson $lesson): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id && $lesson->course_module_id === $module->id, 404);

        $oldValues = $lesson->toArray();
        $lesson->update($this->payload($request, $module, $lesson));
        app(\App\Services\AuditLogService::class)->logModelUpdated('lesson_updated', $lesson, $oldValues);

        return redirect()
            ->route('courses.show', ['course' => $course, 'tab' => 'modules'])
            ->with('success', 'Lesson updated.');
    }

    public function destroy(Course $course, CourseModule $module, Lesson $lesson): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id && $lesson->course_module_id === $module->id, 404);

        $oldValues = $lesson->toArray();
        if ($lesson->file_path) {
            Storage::disk('public')->delete($lesson->file_path);
        }
        $lesson->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('lesson_deleted', $lesson, $oldValues);

        return redirect()
            ->route('courses.show', ['course' => $course, 'tab' => 'modules'])
            ->with('success', 'Lesson deleted.');
    }

    protected function payload(LessonRequest $request, CourseModule $module, ?Lesson $lesson = null): array
    {
        $data = $request->validated();
        $type = $data['content_type'];
        $filePath = $lesson?->file_path;

        if ($type !== 'text') {
            $data['content_body'] = null;
        }

        if ($type !== 'video') {
            $data['video_url'] = null;
        }

        if ($type !== 'file' && $filePath) {
            Storage::disk('public')->delete($filePath);
            $filePath = null;
        }

        if ($type === 'file' && $request->boolean('remove_file') && $filePath) {
            Storage::disk('public')->delete($filePath);
            $filePath = null;
        }

        if ($request->hasFile('file')) {
            if ($filePath) {
                Storage::disk('public')->delete($filePath);
            }

            $filePath = $request->file('file')->store('lessons', 'public');
        }

        unset($data['file'], $data['remove_file']);

        return [
            ...$data,
            'course_module_id' => $module->id,
            'file_path' => $type === 'file' ? $filePath : null,
            'sort_order' => $data['sort_order'] ?? (($module->lessons()->max('sort_order') ?? 0) + 1),
        ];
    }
}
