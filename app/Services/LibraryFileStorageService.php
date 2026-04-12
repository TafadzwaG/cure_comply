<?php

namespace App\Services;

use App\Models\LibraryFile;
use App\Models\LibraryFileVersion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class LibraryFileStorageService
{
    public function store(UploadedFile $file, ?int $tenantId = null): array
    {
        $sanitizedName = $this->sanitizeFilename($file->getClientOriginalName());
        $directory = $tenantId ? "library-files/tenant/{$tenantId}" : 'library-files/shared';

        $storedPath = $file->storeAs(
            $directory,
            Str::uuid()->toString().'_'.$sanitizedName,
            'private',
        );

        if (! $storedPath) {
            throw new RuntimeException('Failed to store library file.');
        }

        return [
            'original_name' => $sanitizedName,
            'file_path' => $storedPath,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ];
    }

    public function replace(LibraryFile $libraryFile, UploadedFile $file, ?int $tenantId = null): array
    {
        $oldPath = $libraryFile->file_path;
        $payload = $this->store($file, $tenantId);

        if ($oldPath && Storage::disk('private')->exists($oldPath) && ! $this->shouldPreserve($libraryFile, $oldPath)) {
            Storage::disk('private')->delete($oldPath);
        }

        return $payload;
    }

    public function download(LibraryFile $libraryFile)
    {
        return $this->downloadPath($libraryFile->file_path, $libraryFile->original_name);
    }

    public function downloadVersion(LibraryFileVersion $version)
    {
        return $this->downloadPath($version->file_path, $version->original_name);
    }

    protected function sanitizeFilename(string $filename): string
    {
        $filename = str_replace(['..', '/', '\\', "\0"], '', $filename);
        $name = preg_replace('/[^\w.\-]/', '_', pathinfo($filename, PATHINFO_FILENAME));
        $extension = preg_replace('/[^\w]/', '', pathinfo($filename, PATHINFO_EXTENSION));

        return Str::limit($name, 180, '').($extension ? '.'.$extension : '');
    }

    protected function shouldPreserve(LibraryFile $libraryFile, string $path): bool
    {
        if (! $libraryFile->is_policy) {
            return false;
        }

        return $libraryFile->policyVersions()
            ->where('file_path', $path)
            ->exists();
    }

    protected function downloadPath(string $path, string $downloadName)
    {
        if (! Storage::disk('private')->exists($path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('private')->download($path, $downloadName);
    }
}
