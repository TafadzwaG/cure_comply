<?php

namespace App\Services;

use App\Jobs\GeneratePdfExportJob;
use App\Jobs\GenerateXlsxExportJob;
use App\Models\ExportRequest;
use App\Models\User;
use InvalidArgumentException;

class ExportRequestService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected AppNotificationService $appNotificationService,
    ) {
    }

    public function queue(User $user, string $source, string $format, array $filters = [], array $payload = []): ExportRequest
    {
        if (! in_array($format, ['xlsx', 'pdf'], true)) {
            throw new InvalidArgumentException('Unsupported export format.');
        }

        $exportRequest = ExportRequest::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'source' => $source,
            'format' => $format,
            'status' => 'queued',
            'filters' => $filters ?: null,
            'payload' => $payload ?: null,
            'file_name' => $this->defaultFileName($source, $format),
        ]);

        $this->auditLogService->logExport('export_requested', $exportRequest, [
            'source' => $source,
            'format' => $format,
            'filters' => $filters,
        ]);

        if ($format === 'pdf') {
            GeneratePdfExportJob::dispatch($exportRequest->id);
        } else {
            GenerateXlsxExportJob::dispatch($exportRequest->id);
        }

        return $exportRequest;
    }

    public function markCompleted(ExportRequest $exportRequest, string $filePath, ?string $fileName = null): void
    {
        $exportRequest->update([
            'status' => 'completed',
            'file_path' => $filePath,
            'file_name' => $fileName ?: $exportRequest->file_name,
            'error_message' => null,
            'completed_at' => now(),
        ]);

        $actionUrl = route('exports.index', ['highlight' => $exportRequest->id], false);

        $this->auditLogService->logExport('export_completed', $exportRequest, [
            'file_name' => $exportRequest->file_name,
            'file_path' => $filePath,
        ]);

        $this->appNotificationService->sendToUser(
            $exportRequest->user()->firstOrFail(),
            'export_ready',
            'Your export is ready',
            sprintf('%s has finished processing and is ready to download.', $exportRequest->file_name ?? 'Export'),
            $actionUrl,
            [
                'export_request_id' => $exportRequest->id,
                'source' => $exportRequest->source,
                'format' => $exportRequest->format,
            ],
            true,
            'Privacy Cure export ready',
            'Open exports'
        );
    }

    public function markFailed(ExportRequest $exportRequest, \Throwable $exception): void
    {
        $exportRequest->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'completed_at' => now(),
        ]);

        $this->auditLogService->logExport('export_failed', $exportRequest, [
            'error' => $exception->getMessage(),
        ]);

        $this->appNotificationService->sendToUser(
            $exportRequest->user()->firstOrFail(),
            'export_failed',
            'An export failed',
            sprintf('We could not generate %s. Please try again.', $exportRequest->file_name ?? 'the requested export'),
            route('exports.index', ['highlight' => $exportRequest->id], false),
            [
                'export_request_id' => $exportRequest->id,
                'source' => $exportRequest->source,
                'format' => $exportRequest->format,
            ],
            true,
            'Privacy Cure export failed',
            'Open exports'
        );
    }

    protected function defaultFileName(string $source, string $format): string
    {
        $base = str($source)->replace('.', '-')->replace('_', '-')->lower();

        return $base.'-'.now()->format('Ymd-His').'.'.$format;
    }
}
