<?php

namespace App\Services;

use App\Models\ComplianceResponse;
use App\Models\EvidenceFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class EvidenceStorageService
{
    public function store(ComplianceResponse $response, UploadedFile $file, int $userId): EvidenceFile
    {
        $tenantId = current_tenant()?->id ?? $response->tenant_id;
        $sanitizedName = $this->sanitizeFilename($file->getClientOriginalName());

        $storedPath = $file->storeAs(
            'evidence/'.$tenantId.'/'.$response->compliance_submission_id,
            Str::uuid()->toString().'_'.$sanitizedName,
            'private'
        );

        if (! $storedPath) {
            Log::error('Evidence file storage failed', [
                'tenant_id' => $tenantId,
                'submission_id' => $response->compliance_submission_id,
                'original_name' => $file->getClientOriginalName(),
                'user_id' => $userId,
            ]);
            throw new RuntimeException('Failed to store evidence file.');
        }

        return EvidenceFile::query()->create([
            'tenant_id' => $response->tenant_id,
            'compliance_submission_id' => $response->compliance_submission_id,
            'compliance_response_id' => $response->id,
            'file_name' => basename($storedPath),
            'original_name' => $sanitizedName,
            'file_path' => $storedPath,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => $userId,
            'uploaded_at' => now(),
        ]);
    }

    public function download(EvidenceFile $evidenceFile)
    {
        if (! Storage::disk('private')->exists($evidenceFile->file_path)) {
            Log::warning('Evidence file not found on disk', [
                'evidence_file_id' => $evidenceFile->id,
                'file_path' => $evidenceFile->file_path,
            ]);
            abort(404, 'Evidence file not found.');
        }

        return Storage::disk('private')->download($evidenceFile->file_path, $evidenceFile->original_name);
    }

    protected function sanitizeFilename(string $filename): string
    {
        $filename = str_replace(['..', '/', '\\', "\0"], '', $filename);
        $filename = preg_replace('/[^\w.\-]/', '_', pathinfo($filename, PATHINFO_FILENAME))
            .'.'.preg_replace('/[^\w]/', '', pathinfo($filename, PATHINFO_EXTENSION));

        return Str::limit($filename, 200, '');
    }
}
