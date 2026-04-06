<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\EvidenceUploadRequest;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceResponse;
use App\Models\ComplianceSubmission;
use App\Models\EvidenceFile;
use App\Services\EvidenceStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EvidenceFileController extends Controller
{
    use InteractsWithIndexTables;

    public function __construct(protected EvidenceStorageService $evidenceStorageService)
    {
    }

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', EvidenceFile::class);

        $filters = $this->validateIndex($request, ['original_name', 'review_status', 'uploaded_at', 'created_at'], [
            'review_status' => ['nullable', 'string'],
        ]);

        $query = EvidenceFile::query()->with(['response.question', 'submission.framework', 'uploader', 'reviews.reviewer']);
        $this->applySearch($query, $filters['search'] ?? null, ['original_name', 'response.question.question_text', 'submission.framework.name']);
        $this->applyFilters($query, $filters, [
            'review_status' => 'review_status',
        ]);
        $this->applySort($query, [
            'original_name' => 'original_name',
            'review_status' => 'review_status',
            'uploaded_at' => 'uploaded_at',
            'created_at' => 'created_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null, 'uploaded_at');

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (EvidenceFile $file) => [
                $file->response?->question?->question_text,
                $file->original_name,
                optional($file->uploaded_at)?->format('Y-m-d H:i'),
                $file->review_status->value,
            ])->all();

            return $this->exportTable('evidence.xlsx', ['Question', 'File', 'Uploaded', 'Review Status'], $rows);
        }

        return Inertia::render('evidence/index', [
            'evidence' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => EvidenceFile::query()->count(),
                'pending' => EvidenceFile::query()->where('review_status', 'pending')->count(),
                'approved' => EvidenceFile::query()->where('review_status', 'approved')->count(),
                'rejected' => EvidenceFile::query()->where('review_status', 'rejected')->count(),
            ],
        ]);
    }

    public function store(EvidenceUploadRequest $request, ComplianceResponse $complianceResponse): RedirectResponse
    {
        $this->authorize('create', EvidenceFile::class);
        $this->authorize('view', $complianceResponse->submission);

        try {
            $this->evidenceStorageService->store($complianceResponse, $request->file('file'), $request->user()->id);
        } catch (\RuntimeException $e) {
            Log::error('Evidence upload failed', [
                'response_id' => $complianceResponse->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to upload evidence file. Please try again.');
        }

        return back()->with('success', 'Evidence uploaded.');
    }

    public function storeForQuestion(
        EvidenceUploadRequest $request,
        ComplianceSubmission $complianceSubmission,
        ComplianceQuestion $complianceQuestion
    ): RedirectResponse {
        $this->authorize('create', EvidenceFile::class);
        $this->authorize('view', $complianceSubmission);

        $questionBelongsToFramework = $complianceSubmission->framework()
            ->whereHas('sections.questions', fn ($query) => $query->whereKey($complianceQuestion->id))
            ->exists();

        abort_unless($questionBelongsToFramework, 404);

        try {
            DB::transaction(function () use ($request, $complianceSubmission, $complianceQuestion) {
                $response = ComplianceResponse::query()->firstOrCreate(
                    [
                        'tenant_id' => $complianceSubmission->tenant_id,
                        'compliance_submission_id' => $complianceSubmission->id,
                        'compliance_question_id' => $complianceQuestion->id,
                    ],
                    [
                        'status' => 'draft',
                        'answered_by' => $request->user()?->id,
                        'answered_at' => now(),
                    ]
                );

                $this->evidenceStorageService->store($response, $request->file('file'), $request->user()->id);
            });
        } catch (\RuntimeException $e) {
            Log::error('Evidence upload failed', [
                'submission_id' => $complianceSubmission->id,
                'question_id' => $complianceQuestion->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to upload evidence file. Please try again.');
        }

        return back()->with('success', 'Evidence uploaded.');
    }

    public function download(EvidenceFile $evidenceFile)
    {
        $this->authorize('view', $evidenceFile);

        return $this->evidenceStorageService->download($evidenceFile);
    }
}
