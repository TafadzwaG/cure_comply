<?php

namespace App\Http\Controllers;

use App\Enums\CourseAssignmentStatus;
use App\Models\CourseAssignment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LessonProgressController extends Controller
{
    /**
     * Mark a lesson as complete for the current user within an assignment context.
     */
    public function store(Request $request, CourseAssignment $assignment): RedirectResponse
    {
        $this->authorize('view', $assignment);

        $request->validate([
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
        ]);

        $user = $request->user();
        $lesson = Lesson::findOrFail($request->input('lesson_id'));

        // Verify the lesson belongs to the assignment's course
        $courseModuleIds = $assignment->course?->modules()->pluck('id') ?? collect();

        if (! $courseModuleIds->contains($lesson->course_module_id)) {
            return back()->with('error', 'This lesson does not belong to the assigned course.');
        }

        // Create or update the progress record
        LessonProgress::query()->updateOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'lesson_id' => $lesson->id,
                'user_id' => $user->id,
            ],
            [
                'completed_at' => now(),
                'status' => CourseAssignmentStatus::Completed,
            ]
        );

        // Update assignment status based on overall progress
        $this->updateAssignmentStatus($assignment, $user->id);

        return back()->with('success', 'Lesson marked as complete.');
    }

    /**
     * Undo lesson completion — mark a lesson as incomplete.
     */
    public function destroy(Request $request, CourseAssignment $assignment): RedirectResponse
    {
        $this->authorize('view', $assignment);

        $request->validate([
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
        ]);

        $user = $request->user();

        LessonProgress::query()
            ->where('user_id', $user->id)
            ->where('lesson_id', $request->input('lesson_id'))
            ->delete();

        // Recalculate assignment status
        $this->updateAssignmentStatus($assignment, $user->id);

        return back()->with('success', 'Lesson progress reset.');
    }

    /**
     * Recalculate the assignment status based on lesson completion.
     */
    protected function updateAssignmentStatus(CourseAssignment $assignment, int $userId): void
    {
        $totalLessons = $assignment->course
            ?->modules()
            ->withCount(['lessons' => fn ($q) => $q->where('status', 'published')])
            ->get()
            ->sum('lessons_count') ?? 0;

        if ($totalLessons === 0) {
            return;
        }

        $completedLessons = LessonProgress::query()
            ->where('user_id', $userId)
            ->whereIn('lesson_id', function ($query) use ($assignment) {
                $query->select('lessons.id')
                    ->from('lessons')
                    ->join('course_modules', 'course_modules.id', '=', 'lessons.course_module_id')
                    ->where('course_modules.course_id', $assignment->course_id)
                    ->where('lessons.status', 'published');
            })
            ->whereNotNull('completed_at')
            ->count();

        if ($completedLessons >= $totalLessons) {
            $assignment->update(['status' => CourseAssignmentStatus::Completed]);
        } elseif ($completedLessons > 0) {
            // Only move to in_progress if not already completed
            if ($assignment->status !== CourseAssignmentStatus::Completed) {
                $assignment->update(['status' => CourseAssignmentStatus::InProgress]);
            }
        }
    }
}
