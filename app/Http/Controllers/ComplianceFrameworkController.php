<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\ComplianceFrameworkRequest;
use App\Models\ComplianceFramework;
use App\Models\ComplianceResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

            return $this->queueTableExport($request, 'frameworks.index', $filters, ['Name', 'Version', 'Sections', 'Status'], $rows, 'Frameworks');
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
        $framework = ComplianceFramework::query()->create($request->validated());
        app(\App\Services\AuditLogService::class)->logModelCreated('framework_created', $framework);

        return redirect()->route('frameworks.show', $framework->id)->with('success', 'Framework created successfully.');
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
        $oldValues = $framework->toArray();
        $framework->update($request->validated());
        app(\App\Services\AuditLogService::class)->logModelUpdated('framework_updated', $framework, $oldValues);

        return back()->with('success', 'Framework updated.');
    }

    public function destroy(ComplianceFramework $framework): RedirectResponse
    {
        $this->authorize('delete', $framework);
        $oldValues = $framework->toArray();
        $framework->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('framework_deleted', $framework, $oldValues);

        return back()->with('success', 'Framework deleted.');
    }

    public function exportPdf(Request $request, ComplianceFramework $framework): RedirectResponse
    {
        $this->authorize('view', $framework);
        app(\App\Services\AuditLogService::class)->logModel('framework_pdf_requested', $framework);

        return $this->queuePdfExport($request, 'frameworks.pdf', ['framework_id' => $framework->id], [
            'framework_id' => $framework->id,
            'title' => $framework->name,
        ]);
    }

    public function heatmap(ComplianceFramework $framework): Response
    {
        $this->authorize('view', $framework);

        $framework->load([
            'sections' => fn ($q) => $q->orderBy('sort_order'),
            'sections.questions' => fn ($q) => $q->orderBy('sort_order'),
        ]);

        $questionIds = $framework->sections->flatMap->questions->pluck('id');

        // Per-question totals and failures
        $stats = DB::table('compliance_responses')
            ->whereIn('compliance_question_id', $questionIds)
            ->selectRaw("
                compliance_question_id,
                COUNT(*) as total,
                SUM(CASE WHEN LOWER(answer_value) IN ('no','fail','non_compliant','0') OR response_score = 0 THEN 1 ELSE 0 END) as failed
            ")
            ->groupBy('compliance_question_id')
            ->get()
            ->keyBy('compliance_question_id');

        $sectionsPayload = $framework->sections->map(function ($section) use ($stats) {
            return [
                'id' => $section->id,
                'name' => $section->name,
                'weight' => $section->weight,
                'questions' => $section->questions->map(function ($q) use ($stats) {
                    $row = $stats->get($q->id);
                    $total = (int) ($row->total ?? 0);
                    $failed = (int) ($row->failed ?? 0);
                    $rate = $total > 0 ? round(($failed / $total) * 100, 1) : 0;
                    return [
                        'id' => $q->id,
                        'question_text' => $q->question_text,
                        'total' => $total,
                        'failed' => $failed,
                        'failure_rate' => $rate,
                    ];
                })->values()->all(),
            ];
        })->values()->all();

        return Inertia::render('frameworks/heatmap', [
            'framework' => [
                'id' => $framework->id,
                'name' => $framework->name,
                'version' => $framework->version,
            ],
            'sections' => $sectionsPayload,
        ]);
    }
}
