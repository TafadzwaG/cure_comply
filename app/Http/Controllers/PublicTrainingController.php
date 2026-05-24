<?php

namespace App\Http\Controllers;

use App\Enums\CourseStatus;
use App\Enums\TenantStatus;
use App\Http\Requests\PublicTrainingAcknowledgementRequest;
use App\Models\Course;
use App\Models\PublicTrainingAcknowledgement;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicTrainingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('training/index', [
            'courses' => Course::query()
                ->withCount([
                    'modules',
                    'modules as published_lessons_count' => fn ($query) => $query
                        ->join('lessons', 'lessons.course_module_id', '=', 'course_modules.id')
                        ->where('lessons.status', 'published')
                        ->whereNull('lessons.deleted_at'),
                ])
                ->where('status', CourseStatus::Published->value)
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function show(Course $course): Response
    {
        abort_unless($course->status === CourseStatus::Published, 404);

        return Inertia::render('training/show', [
            'course' => $course->load([
                'modules' => fn ($query) => $query->orderBy('sort_order'),
                'modules.lessons' => fn ($query) => $query->where('status', 'published')->orderBy('sort_order'),
            ]),
            'tenants' => Tenant::query()
                ->where('status', TenantStatus::Active->value)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function acknowledge(PublicTrainingAcknowledgementRequest $request, Course $course): RedirectResponse
    {
        abort_unless($course->status === CourseStatus::Published, 404);

        PublicTrainingAcknowledgement::query()->create([
            'course_id' => $course->id,
            'tenant_id' => $request->integer('tenant_id'),
            'full_name' => $request->string('full_name')->trim()->value(),
            'acknowledged_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => str($request->userAgent() ?? '')->limit(1000)->value(),
        ]);

        return redirect()
            ->route('training.show', $course->slug)
            ->with('success', 'Training acknowledgement recorded.');
    }
}
