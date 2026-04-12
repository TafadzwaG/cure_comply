<?php

namespace App\Http\Controllers;

use App\Models\ExportRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ExportRequest::class);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:50'],
            'format' => ['nullable', 'string', 'max:20'],
            'sort' => ['nullable', 'in:created_at,completed_at,status,source,format'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'in:10,25,50,100'],
            'highlight' => ['nullable', 'integer'],
        ]);

        $query = ExportRequest::query()
            ->where('user_id', $request->user()->id);

        if ($search = ($filters['search'] ?? null)) {
            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('source', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('error_message', 'like', "%{$search}%");
            });
        }

        if ($status = ($filters['status'] ?? null)) {
            $query->where('status', $status);
        }

        if ($format = ($filters['format'] ?? null)) {
            $query->where('format', $format);
        }

        $query->orderBy(
            $filters['sort'] ?? 'created_at',
            ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc'
        );

        return Inertia::render('exports/index', [
            'exports' => $query->paginate((int) ($filters['per_page'] ?? 25))->through(fn (ExportRequest $exportRequest) => [
                'id' => $exportRequest->id,
                'source' => $exportRequest->source,
                'source_label' => $this->sourceLabel($exportRequest->source),
                'format' => $exportRequest->format,
                'status' => $exportRequest->status,
                'file_name' => $exportRequest->file_name,
                'error_message' => $exportRequest->error_message,
                'created_at' => optional($exportRequest->created_at)?->toISOString(),
                'completed_at' => optional($exportRequest->completed_at)?->toISOString(),
                'download_url' => $exportRequest->status === 'completed' && $exportRequest->file_path
                    ? route('exports.download', $exportRequest, false)
                    : null,
            ])->withQueryString(),
            'filters' => $filters,
            'highlight' => $filters['highlight'] ?? null,
            'stats' => [
                'total' => ExportRequest::query()->where('user_id', $request->user()->id)->count(),
                'queued' => ExportRequest::query()->where('user_id', $request->user()->id)->where('status', 'queued')->count(),
                'processing' => ExportRequest::query()->where('user_id', $request->user()->id)->where('status', 'processing')->count(),
                'completed' => ExportRequest::query()->where('user_id', $request->user()->id)->where('status', 'completed')->count(),
                'failed' => ExportRequest::query()->where('user_id', $request->user()->id)->where('status', 'failed')->count(),
            ],
            'sources' => ExportRequest::query()
                ->where('user_id', $request->user()->id)
                ->select('source')
                ->distinct()
                ->orderBy('source')
                ->pluck('source')
                ->map(fn (string $source) => [
                    'label' => $this->sourceLabel($source),
                    'value' => $source,
                ])
                ->values(),
        ]);
    }

    public function download(Request $request, ExportRequest $exportRequest): StreamedResponse
    {
        $this->authorize('view', $exportRequest);
        abort_unless($exportRequest->status === 'completed' && $exportRequest->file_path, 404);

        app(\App\Services\AuditLogService::class)->logExport('export_downloaded', $exportRequest, [
            'file_name' => $exportRequest->file_name,
        ]);

        return Storage::disk('private')->download(
            $exportRequest->file_path,
            $exportRequest->file_name ?? basename($exportRequest->file_path)
        );
    }

    protected function sourceLabel(string $source): string
    {
        return str($source)
            ->replace(['.', '_'], ' ')
            ->replace('index', '')
            ->title()
            ->squish()
            ->toString();
    }
}
