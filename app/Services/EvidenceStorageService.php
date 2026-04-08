<?php

namespace App\Services;

use App\Enums\EvidenceReviewStatus;
use App\Models\ComplianceResponse;
use App\Models\EvidenceFile;
use App\Models\EvidenceFileVersion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class EvidenceStorageService
{
    public function store(ComplianceResponse $response, UploadedFile $file, int $userId, ?int $replacesEvidenceFileId = null): EvidenceFile
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

        return DB::transaction(function () use ($response, $file, $userId, $replacesEvidenceFileId, $storedPath, $sanitizedName) {
            $existing = $replacesEvidenceFileId
                ? EvidenceFile::query()->where('compliance_response_id', $response->id)->whereKey($replacesEvidenceFileId)->first()
                : null;

            if ($existing) {
                // Snapshot current state into versions history
                $latestVersion = (int) ($existing->versions()->max('version_number') ?? 0);
                if ($latestVersion === 0) {
                    // Backfill v1 from current EvidenceFile state before bumping
                    EvidenceFileVersion::create([
                        'evidence_file_id' => $existing->id,
                        'version_number' => 1,
                        'file_name' => $existing->file_name,
                        'original_name' => $existing->original_name,
                        'file_path' => $existing->file_path,
                        'mime_type' => $existing->mime_type,
                        'file_size' => $existing->file_size,
                        'uploaded_by' => $existing->uploaded_by,
                        'uploaded_at' => $existing->uploaded_at,
                        'review_status' => $existing->review_status?->value ?? 'pending',
                        'review_comment' => optional($existing->reviews()->latest('reviewed_at')->first())->review_comment,
                    ]);
                    $latestVersion = 1;
                }

                $newVersionNumber = $latestVersion + 1;

                $existing->update([
                    'file_name' => basename($storedPath),
                    'original_name' => $sanitizedName,
                    'file_path' => $storedPath,
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => $userId,
                    'uploaded_at' => now(),
                    'review_status' => EvidenceReviewStatus::Pending,
                    'current_version' => $newVersionNumber,
                ]);

                EvidenceFileVersion::create([
                    'evidence_file_id' => $existing->id,
                    'version_number' => $newVersionNumber,
                    'file_name' => basename($storedPath),
                    'original_name' => $sanitizedName,
                    'file_path' => $storedPath,
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => $userId,
                    'uploaded_at' => now(),
                    'review_status' => 'pending',
                ]);

                return $existing->fresh();
            }

            $evidenceFile = EvidenceFile::query()->create([
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
                'current_version' => 1,
            ]);

            EvidenceFileVersion::create([
                'evidence_file_id' => $evidenceFile->id,
                'version_number' => 1,
                'file_name' => basename($storedPath),
                'original_name' => $sanitizedName,
                'file_path' => $storedPath,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => $userId,
                'uploaded_at' => now(),
                'review_status' => 'pending',
            ]);

            return $evidenceFile;
        });
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

    public function downloadVersion(EvidenceFileVersion $version)
    {
        if (! Storage::disk('private')->exists($version->file_path)) {
            abort(404, 'Evidence version not found.');
        }

        return Storage::disk('private')->download($version->file_path, $version->original_name);
    }

    protected function sanitizeFilename(string $filename): string
    {
        $filename = str_replace(['..', '/', '\\', "\0"], '', $filename);
        $filename = preg_replace('/[^\w.\-]/', '_', pathinfo($filename, PATHINFO_FILENAME))
            .'.'.preg_replace('/[^\w]/', '', pathinfo($filename, PATHINFO_EXTENSION));

        return Str::limit($filename, 200, '');
    }
}
