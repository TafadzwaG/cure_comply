<?php

namespace App\Http\Controllers;

use App\Models\ExportRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportRequestController extends Controller
{
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
}
