<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\EvidenceUploadRequest;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceResponse;
use App\Models\ComplianceFramework;
use App\Models\ComplianceSubmission;
use App\Models\EvidenceFile;
use App\Models\Tenant;
use App\Services\EvidenceStorageService;
use Illuminate\Http\JsonResponse;
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
            'tenant_id' => ['nullable', 'integer'],
            'framework_id' => ['nullable', 'integer'],
        ]);

        $query = EvidenceFile::query()->with(['response.question', 'submission.framework', 'submission.tenant:id,name', 'tenant:id,name', 'uploader', 'reviews.reviewer', 'versions.uploader']);
        $this->applySearch($query, $filters['search'] ?? null, ['original_name', 'response.question.question_text', 'submission.framework.name', 'submission.tenant.name']);
        $this->applyFilters($query, $filters, [
            'review_status' => 'review_status',
            'tenant_id' => 'tenant_id',
        ]);
        if (! empty($filters['framework_id'])) {
            $query->whereHas('submission', fn ($q) => $q->where('compliance_framework_id', $filters['framework_id']));
        }
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

            return $this->queueTableExport($request, 'evidence.index', $filters, ['Question', 'File', 'Uploaded', 'Review Status'], $rows, 'Evidence');
        }

        $isSuperAdmin = (bool) $request->user()?->hasRole('super_admin');

        return Inertia::render('evidence/index', [
            'evidence' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => EvidenceFile::query()->count(),
                'pending' => EvidenceFile::query()->where('review_status', 'pending')->count(),
                'approved' => EvidenceFile::query()->where('review_status', 'approved')->count(),
                'rejected' => EvidenceFile::query()->where('review_status', 'rejected')->count(),
            ],
            'frameworks' => ComplianceFramework::query()->orderBy('name')->get(['id', 'name']),
            'tenants' => $isSuperAdmin ? Tenant::query()->orderBy('name')->get(['id', 'name']) : [],
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function store(EvidenceUploadRequest $request, ComplianceResponse $complianceResponse): RedirectResponse|JsonResponse
    {
        $this->authorize('create', EvidenceFile::class);
        $this->authorize('respond', $complianceResponse->submission);

        try {
            $evidenceFile = $this->evidenceStorageService->store(
                $complianceResponse,
                $request->file('file'),
                $request->user()->id,
                $request->integer('replaces') ?: null
            );
            app(\App\Services\AuditLogService::class)->logModelCreated('evidence_uploaded', $evidenceFile);
        } catch (\RuntimeException $e) {
            Log::error('Evidence upload failed', [
                'response_id' => $complianceResponse->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to upload evidence file. Please try again.');
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Evidence uploaded.',
                'response' => $this->responsePayload($complianceResponse->fresh()),
            ]);
        }

        return back()->with('success', 'Evidence uploaded.');
    }

    public function storeForQuestion(
        EvidenceUploadRequest $request,
        ComplianceSubmission $complianceSubmission,
        ComplianceQuestion $complianceQuestion
    ): RedirectResponse|JsonResponse {
        $this->authorize('create', EvidenceFile::class);
        $this->authorize('respond', $complianceSubmission);

        $questionBelongsToFramework = $complianceSubmission->framework()
            ->whereHas('sections.questions', fn ($query) => $query->whereKey($complianceQuestion->id))
            ->exists();

        abort_unless($questionBelongsToFramework, 404);

        try {
            $response = DB::transaction(function () use ($request, $complianceSubmission, $complianceQuestion) {
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

                $evidenceFile = $this->evidenceStorageService->store($response, $request->file('file'), $request->user()->id);
                app(\App\Services\AuditLogService::class)->logModelCreated('evidence_uploaded', $evidenceFile);

                return $response;
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

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Evidence uploaded.',
                'response' => $this->responsePayload($response->fresh()),
            ]);
        }

        return back()->with('success', 'Evidence uploaded.');
    }

    public function download(EvidenceFile $evidenceFile)
    {
        $this->authorize('view', $evidenceFile);
        app(\App\Services\AuditLogService::class)->logModel('evidence_downloaded', $evidenceFile);

        return $this->evidenceStorageService->download($evidenceFile);
    }

    public function downloadVersion(EvidenceFile $evidenceFile, \App\Models\EvidenceFileVersion $version)
    {
        $this->authorize('view', $evidenceFile);
        abort_unless($version->evidence_file_id === $evidenceFile->id, 404);

        return $this->evidenceStorageService->downloadVersion($version);
    }

    protected function responsePayload(ComplianceResponse $response): array
    {
        $response->loadMissing([
            'evidenceFiles.uploader:id,name',
            'evidenceFiles.reviews.reviewer:id,name',
        ]);

        return [
            'id' => $response->id,
            'compliance_question_id' => $response->compliance_question_id,
            'answer_value' => $response->answer_value,
            'answer_text' => $response->answer_text,
            'comment_text' => $response->comment_text,
            'response_score' => $response->response_score,
            'status' => $response->status?->value ?? $response->status,
            'evidence_files' => $response->evidenceFiles
                ->map(fn (EvidenceFile $file) => [
                    'id' => $file->id,
                    'original_name' => $file->original_name,
                    'mime_type' => $file->mime_type,
                    'file_size' => $file->file_size,
                    'uploaded_at' => optional($file->uploaded_at)?->toIso8601String(),
                    'review_status' => $file->review_status?->value ?? $file->review_status,
                    'uploader' => $file->uploader ? [
                        'name' => $file->uploader->name,
                    ] : null,
                    'reviews' => $file->reviews->map(fn ($review) => [
                        'id' => $review->id,
                        'review_status' => $review->review_status?->value ?? $review->review_status,
                        'review_comment' => $review->review_comment,
                        'reviewed_at' => optional($review->reviewed_at)?->toIso8601String(),
                        'reviewer' => $review->reviewer ? [
                            'name' => $review->reviewer->name,
                        ] : null,
                    ])->values(),
                ])
                ->values(),
        ];
    }
}
