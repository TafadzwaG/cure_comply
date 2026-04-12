<?php

namespace App\Services;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EmployeeCourseWorkspaceService
{
    public function for(User $user): array
    {
        $assignments = CourseAssignment::query()
            ->where('assigned_to_user_id', $user->id)
            ->with(['course' => fn ($query) => $query->withCount('modules')])
            ->latest('assigned_at')
            ->get()
            ->filter(fn (CourseAssignment $assignment) => $assignment->course !== null);

        $mandatoryAssignments = $assignments
            ->filter(fn (CourseAssignment $assignment) => $assignment->assigned_by === null || (int) $assignment->assigned_by !== (int) $user->id)
            ->values();

        $selfAssignments = $assignments
            ->filter(fn (CourseAssignment $assignment) => (int) $assignment->assigned_by === (int) $user->id)
            ->filter(fn (CourseAssignment $assignment) => $assignment->course?->status === CourseStatus::Published)
            ->values();

        $mandatoryCourseIds = $mandatoryAssignments->pluck('course_id')->unique()->values();
        $selfCourseIds = $selfAssignments->pluck('course_id')->unique()->values();

        $publicCourses = Course::query()
            ->withCount('modules')
            ->where('status', CourseStatus::Published->value)
            ->whereNotIn('id', $mandatoryCourseIds->all())
            ->whereNotIn('id', $selfCourseIds->all())
            ->orderBy('title')
            ->get();

        $courseIds = $mandatoryCourseIds
            ->merge($selfCourseIds)
            ->merge($publicCourses->pluck('id'))
            ->unique()
            ->values();

        $lessonCounts = $this->publishedLessonCounts($courseIds);
        $completedCounts = $this->completedLessonCounts($user, $courseIds);

        $mandatoryCourses = $mandatoryAssignments
            ->map(fn (CourseAssignment $assignment) => $this->mapAssignment($assignment, $lessonCounts, $completedCounts, true))
            ->values();

        $startedPublicCourses = $selfAssignments
            ->reject(fn (CourseAssignment $assignment) => $mandatoryCourseIds->contains($assignment->course_id))
            ->map(fn (CourseAssignment $assignment) => $this->mapAssignment($assignment, $lessonCounts, $completedCounts, false))
            ->values();

        $unstartedPublicCourses = $publicCourses
            ->map(fn (Course $course) => $this->mapCourse($course, $lessonCounts, $completedCounts))
            ->values();

        $publicRows = $startedPublicCourses
            ->concat($unstartedPublicCourses)
            ->sortBy('title')
            ->values();

        $allRows = $mandatoryCourses->concat($publicRows);

        return [
            'stats' => [
                'mandatory' => $mandatoryCourses->count(),
                'public' => $publicRows->count(),
                'inProgress' => $allRows->filter(fn (array $row) => $row['progress'] > 0 && $row['progress'] < 100)->count(),
                'completed' => $allRows->filter(fn (array $row) => $row['progress'] >= 100)->count(),
            ],
            'mandatoryCourses' => $mandatoryCourses->all(),
            'publicCourses' => $publicRows->all(),
        ];
    }

    protected function mapAssignment(CourseAssignment $assignment, Collection $lessonCounts, Collection $completedCounts, bool $mandatory): array
    {
        return [
            ...$this->mapCourse($assignment->course, $lessonCounts, $completedCounts),
            'assignment_id' => $assignment->id,
            'assignment_status' => $this->enumValue($assignment->status),
            'due_date' => optional($assignment->due_date)?->toDateString(),
            'assigned_at' => optional($assignment->assigned_at)?->toIso8601String(),
            'is_mandatory' => $mandatory,
            'is_started' => true,
        ];
    }

    protected function mapCourse(Course $course, Collection $lessonCounts, Collection $completedCounts): array
    {
        $totalLessons = (int) ($lessonCounts[$course->id] ?? 0);
        $completedLessons = (int) ($completedCounts[$course->id] ?? 0);

        return [
            'id' => $course->id,
            'assignment_id' => null,
            'title' => $course->title,
            'description' => $course->description,
            'status' => $this->enumValue($course->status),
            'estimated_minutes' => $course->estimated_minutes,
            'modules_count' => $course->modules_count ?? 0,
            'lessons_count' => $totalLessons,
            'completed_lessons' => $completedLessons,
            'progress' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
            'assignment_status' => null,
            'due_date' => null,
            'assigned_at' => null,
            'is_mandatory' => false,
            'is_started' => false,
        ];
    }

    protected function publishedLessonCounts(Collection $courseIds): Collection
    {
        if ($courseIds->isEmpty()) {
            return collect();
        }

        return DB::table('lessons')
            ->join('course_modules', 'course_modules.id', '=', 'lessons.course_module_id')
            ->whereIn('course_modules.course_id', $courseIds->all())
            ->where('lessons.status', 'published')
            ->whereNull('lessons.deleted_at')
            ->whereNull('course_modules.deleted_at')
            ->groupBy('course_modules.course_id')
            ->selectRaw('course_modules.course_id, COUNT(*) as total')
            ->pluck('total', 'course_id');
    }

    protected function completedLessonCounts(User $user, Collection $courseIds): Collection
    {
        if ($courseIds->isEmpty()) {
            return collect();
        }

        return DB::table('lesson_progress')
            ->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')
            ->join('course_modules', 'course_modules.id', '=', 'lessons.course_module_id')
            ->where('lesson_progress.user_id', $user->id)
            ->whereNotNull('lesson_progress.completed_at')
            ->whereIn('course_modules.course_id', $courseIds->all())
            ->where('lessons.status', 'published')
            ->whereNull('lessons.deleted_at')
            ->whereNull('course_modules.deleted_at')
            ->groupBy('course_modules.course_id')
            ->selectRaw('course_modules.course_id, COUNT(DISTINCT lesson_progress.lesson_id) as total')
            ->pluck('total', 'course_id');
    }

    protected function enumValue(mixed $value): ?string
    {
        return $value instanceof \BackedEnum ? $value->value : $value;
    }
}
