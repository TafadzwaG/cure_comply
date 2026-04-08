<?php

namespace App\Jobs;

use App\Models\ExportRequest;
use App\Services\ExportFileBuilderService;
use App\Services\ExportRequestService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateXlsxExportJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public int $exportRequestId)
    {
        $this->queue = 'default';
    }

    public function handle(ExportFileBuilderService $builder, ExportRequestService $service): void
    {
        $exportRequest = ExportRequest::query()->findOrFail($this->exportRequestId);
        $exportRequest->update(['status' => 'processing']);

        try {
            $path = $builder->buildXlsx($exportRequest);
            $service->markCompleted($exportRequest->fresh(), $path);
        } catch (\Throwable $exception) {
            $service->markFailed($exportRequest->fresh(), $exception);
            throw $exception;
        }
    }
}
