<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\CourseRequest;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CourseController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', Course::class);

        $filters = $this->validateIndex($request, ['title', 'status', 'estimated_minutes', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
        ]);

        $query = Course::query()->withCount(['modules', 'tests']);
        $this->applySearch($query, $filters['search'] ?? null, ['title', 'description']);
        $this->applyFilters($query, $filters, ['status' => 'status']);
        $this->applySort($query, [
            'title' => 'title',
            'status' => 'status',
            'estimated_minutes' => 'estimated_minutes',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (Course $course) => [
                $course->title,
                $course->estimated_minutes ?: 0,
                $course->modules_count,
                $course->tests_count,
                $course->status->value,
            ])->all();

            return $this->exportTable('courses.xlsx', ['Title', 'Minutes', 'Modules', 'Tests', 'Status'], $rows);
        }

        return Inertia::render('courses/index', [
            'courses' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => Course::query()->count(),
                'published' => Course::query()->where('status', 'published')->count(),
                'draft' => Course::query()->where('status', 'draft')->count(),
                'archived' => Course::query()->where('status', 'archived')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Course::class);

        return Inertia::render('courses/create');
    }

    public function store(CourseRequest $request): RedirectResponse
    {
        $this->authorize('create', Course::class);

        Course::query()->create([
            ...$request->validated(),
            'slug' => Str::slug($request->string('title')).'-'.Str::lower(Str::random(6)),
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Course created.');
    }

    public function show(Course $course): Response
    {
        $this->authorize('view', $course);

        return Inertia::render('courses/show', [
            'course' => $course->load(['modules.lessons', 'tests.questions.options']),
        ]);
    }

    public function update(CourseRequest $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);
        $course->update($request->validated());

        return back()->with('success', 'Course updated.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);
        $course->delete();

        return back()->with('success', 'Course deleted.');
    }
}
