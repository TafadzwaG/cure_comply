<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\LibraryFileStoreRequest;
use App\Http\Requests\LibraryFileUpdateRequest;
use App\Models\LibraryFile;
use App\Models\Tenant;
use App\Services\AuditLogService;
use App\Services\LibraryFileStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryFileController extends Controller
{
    use InteractsWithIndexTables;

    public function __construct(
        protected LibraryFileStorageService $storageService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', LibraryFile::class);

        $user = $request->user();
        $isSuperAdmin = (bool) $user?->isSuperAdmin();
        $filters = $this->validateIndex($request, ['title', 'category', 'file_size', 'created_at'], [
            'scope' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'tenant_id' => ['nullable', 'integer'],
        ]);

        $currentScope = $this->resolveScope($user, $filters['scope'] ?? null);
        $visibleQuery = LibraryFile::query()
            ->with(['tenant:id,name', 'uploader:id,name'])
            ->visibleTo($user);

        $statsBase = LibraryFile::query()->visibleTo($user);

        $query = clone $visibleQuery;
        $this->applySearch($query, $filters['search'] ?? null, ['title', 'description', 'original_name', 'tenant.name', 'uploader.name']);
        $this->applyFilters($query, $filters, [
            'category' => 'category',
        ]);

        if ($isSuperAdmin && ! empty($filters['tenant_id'])) {
            $query->where('tenant_id', (int) $filters['tenant_id']);
        }

        if ($currentScope === 'shared') {
            $query->shared();
        } elseif ($currentScope === 'tenant') {
            $query->tenantScoped();

            if (! $isSuperAdmin && $user?->tenant_id) {
                $query->where('tenant_id', $user->tenant_id);
            }
        }

        $this->applySort($query, [
            'title' => 'title',
            'category' => 'category',
            'file_size' => 'file_size',
            'created_at' => 'created_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        $files = $query
            ->paginate($this->perPage($filters))
            ->withQueryString()
            ->through(fn (LibraryFile $file) => [
                'id' => $file->id,
                'title' => $file->title,
                'description' => $file->description,
                'category' => $file->category,
                'original_name' => $file->original_name,
                'mime_type' => $file->mime_type,
                'file_size' => $file->file_size,
                'file_type' => strtoupper(pathinfo($file->original_name, PATHINFO_EXTENSION) ?: 'FILE'),
                'scope' => $file->tenant_id ? 'tenant' : 'shared',
                'scope_label' => $file->tenant?->name ?? 'Shared',
                'tenant' => $file->tenant ? [
                    'id' => $file->tenant->id,
                    'name' => $file->tenant->name,
                ] : null,
                'uploader' => $file->uploader ? [
                    'id' => $file->uploader->id,
                    'name' => $file->uploader->name,
                ] : null,
                'created_at' => optional($file->created_at)?->toIso8601String(),
                'updated_at' => optional($file->updated_at)?->toIso8601String(),
                'download_url' => route('files.download', $file, false),
                'abilities' => [
                    'canEdit' => $request->user()?->can('update', $file) ?? false,
                    'canDelete' => $request->user()?->can('delete', $file) ?? false,
                    'canDownload' => $request->user()?->can('view', $file) ?? false,
                ],
            ]);

        return Inertia::render('files/index', [
            'files' => $files,
            'filters' => [
                ...$filters,
                'scope' => $currentScope,
            ],
            'stats' => [
                'visible' => (clone $statsBase)->count(),
                'shared' => (clone $statsBase)->whereNull('tenant_id')->count(),
                'tenant' => (clone $statsBase)->whereNotNull('tenant_id')->count(),
                'categories' => (clone $statsBase)->whereNotNull('category')->distinct()->count('category'),
            ],
            'categories' => collect(LibraryFile::categoryOptions())->map(fn (string $category) => [
                'label' => $category,
                'value' => $category,
            ])->values(),
            'tenants' => $isSuperAdmin
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])->map(fn (Tenant $tenant) => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                ])->values()
                : [],
            'canManage' => $request->user()?->can('create', LibraryFile::class) ?? false,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function store(LibraryFileStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', LibraryFile::class);

        $tenantId = $request->user()?->isSuperAdmin()
            ? ($request->scope() === 'tenant' ? $request->tenantId() : null)
            : $request->user()?->tenant_id;

        $filePayload = $this->storageService->store($request->file('file'), $tenantId);

        $libraryFile = LibraryFile::query()->create([
            'tenant_id' => $tenantId,
            'title' => $request->string('title')->toString(),
            'description' => $request->input('description'),
            'category' => $request->string('category')->toString(),
            'uploaded_by' => $request->user()?->id,
            ...$filePayload,
        ]);

        $this->auditLogService->logModelCreated('library_file_uploaded', $libraryFile);

        return back()->with('success', 'File uploaded to the library.');
    }

    public function update(LibraryFileUpdateRequest $request, LibraryFile $libraryFile): RedirectResponse
    {
        $this->authorize('update', $libraryFile);

        $tenantId = $request->user()?->isSuperAdmin()
            ? ($request->scope() === 'tenant' ? $request->tenantId() : null)
            : $request->user()?->tenant_id;

        $oldValues = $libraryFile->toArray();
        $updates = [
            'tenant_id' => $tenantId,
            'title' => $request->string('title')->toString(),
            'description' => $request->input('description'),
            'category' => $request->string('category')->toString(),
        ];

        if ($request->hasFile('file')) {
            $updates = [
                ...$updates,
                ...$this->storageService->replace($libraryFile, $request->file('file'), $tenantId),
            ];
        }

        $libraryFile->update($updates);
        $this->auditLogService->logModelUpdated('library_file_updated', $libraryFile->fresh(), $oldValues);

        return back()->with('success', 'Library file updated.');
    }

    public function destroy(LibraryFile $libraryFile): RedirectResponse
    {
        $this->authorize('delete', $libraryFile);

        $oldValues = $libraryFile->toArray();
        $libraryFile->delete();
        $this->auditLogService->logModelDeleted('library_file_deleted', $libraryFile, $oldValues);

        return back()->with('success', 'Library file removed.');
    }

    public function download(LibraryFile $libraryFile)
    {
        $this->authorize('view', $libraryFile);
        $this->auditLogService->logModel('library_file_downloaded', $libraryFile);

        return $this->storageService->download($libraryFile);
    }

    protected function resolveScope(?\App\Models\User $user, ?string $scope): string
    {
        if ($user?->isSuperAdmin()) {
            return $scope === 'shared' ? 'shared' : 'all';
        }

        return $scope === 'tenant' ? 'tenant' : 'shared';
    }
}
