<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\ComplianceFrameworkRequest;
use App\Models\ComplianceFramework;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ComplianceFrameworkController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', ComplianceFramework::class);

        $filters = $this->validateIndex($request, ['name', 'status', 'version', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
        ]);

        $query = ComplianceFramework::query()->withCount('sections');
        $this->applySearch($query, $filters['search'] ?? null, ['name', 'version', 'description']);
        $this->applyFilters($query, $filters, ['status' => 'status']);
        $this->applySort($query, [
            'name' => 'name',
            'status' => 'status',
            'version' => 'version',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (ComplianceFramework $framework) => [
                $framework->name,
                $framework->version ?: 'N/A',
                $framework->sections_count,
                $framework->status->value,
            ])->all();

            return $this->exportTable('frameworks.xlsx', ['Name', 'Version', 'Sections', 'Status'], $rows);
        }

        return Inertia::render('frameworks/index', [
            'frameworks' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => ComplianceFramework::query()->count(),
                'published' => ComplianceFramework::query()->where('status', 'published')->count(),
                'draft' => ComplianceFramework::query()->where('status', 'draft')->count(),
                'sections' => ComplianceFramework::query()->withCount('sections')->get()->sum('sections_count'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ComplianceFramework::class);

        return Inertia::render('frameworks/create');
    }

    public function store(ComplianceFrameworkRequest $request): RedirectResponse
    {
        $this->authorize('create', ComplianceFramework::class);
        ComplianceFramework::query()->create($request->validated());

        return back()->with('success', 'Framework created.');
    }

    public function show(ComplianceFramework $framework): Response
    {
        $this->authorize('view', $framework);

        $framework = ComplianceFramework::query()
            ->with([
                'sections' => fn ($query) => $query->orderBy('sort_order'),
                'sections.questions' => fn ($query) => $query->orderBy('sort_order'),
            ])
            ->withCount('submissions')
            ->findOrFail($framework->id);

        return Inertia::render('frameworks/show', [
            'framework' => $framework,
            'answerTypes' => collect(\App\Enums\ComplianceAnswerType::cases())->map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ])->values(),
        ]);
    }

    public function edit(ComplianceFramework $framework): Response
    {
        $this->authorize('update', $framework);

        $framework = ComplianceFramework::query()
            ->with([
                'sections' => fn ($query) => $query->orderBy('sort_order'),
                'sections.questions' => fn ($query) => $query->orderBy('sort_order'),
            ])
            ->withCount('submissions')
            ->findOrFail($framework->id);

        return Inertia::render('frameworks/edit', [
            'framework' => $framework,
            'answerTypes' => collect(\App\Enums\ComplianceAnswerType::cases())->map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ])->values(),
        ]);
    }

    public function update(ComplianceFrameworkRequest $request, ComplianceFramework $framework): RedirectResponse
    {
        $this->authorize('update', $framework);
        $framework->update($request->validated());

        return back()->with('success', 'Framework updated.');
    }

    public function destroy(ComplianceFramework $framework): RedirectResponse
    {
        $this->authorize('delete', $framework);
        $framework->delete();

        return back()->with('success', 'Framework deleted.');
    }
}
