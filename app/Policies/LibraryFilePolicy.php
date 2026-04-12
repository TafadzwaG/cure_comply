<?php

namespace App\Policies;

use App\Models\LibraryFile;
use App\Models\User;
use App\Policies\Concerns\HandlesPlatformAuthorization;
use App\Support\Permissions;

class LibraryFilePolicy
{
    use HandlesPlatformAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::VIEW_FILE_LIBRARY) || $user->can(Permissions::MANAGE_FILE_LIBRARY);
    }

    public function view(User $user, LibraryFile $libraryFile): bool
    {
        if (! $this->viewAny($user)) {
            return false;
        }

        return $libraryFile->tenant_id === null || (int) $libraryFile->tenant_id === (int) $user->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_FILE_LIBRARY);
    }

    public function update(User $user, LibraryFile $libraryFile): bool
    {
        if (! $user->can(Permissions::MANAGE_FILE_LIBRARY)) {
            return false;
        }

        return $libraryFile->tenant_id !== null && (int) $libraryFile->tenant_id === (int) $user->tenant_id;
    }

    public function delete(User $user, LibraryFile $libraryFile): bool
    {
        if (! $user->can(Permissions::MANAGE_FILE_LIBRARY)) {
            return false;
        }

        return $libraryFile->tenant_id !== null && (int) $libraryFile->tenant_id === (int) $user->tenant_id;
    }
}
