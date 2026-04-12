<?php

namespace App\Policies;

use App\Models\LibraryFile;
use App\Enums\PolicyState;
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

        if ($libraryFile->is_policy) {
            return false;
        }

        return $libraryFile->tenant_id !== null && (int) $libraryFile->tenant_id === (int) $user->tenant_id;
    }

    public function publishPolicy(User $user, LibraryFile $libraryFile): bool
    {
        if (! $user->can(Permissions::MANAGE_POLICIES)) {
            return false;
        }

        return $libraryFile->tenant_id !== null
            && (int) $libraryFile->tenant_id === (int) $user->tenant_id
            && ! $libraryFile->is_policy;
    }

    public function republishPolicy(User $user, LibraryFile $libraryFile): bool
    {
        if (! $user->can(Permissions::MANAGE_POLICIES)) {
            return false;
        }

        return $libraryFile->tenant_id !== null
            && (int) $libraryFile->tenant_id === (int) $user->tenant_id
            && $libraryFile->is_policy
            && $libraryFile->policy_state !== PolicyState::Archived;
    }

    public function archivePolicy(User $user, LibraryFile $libraryFile): bool
    {
        if (! $user->can(Permissions::MANAGE_POLICIES)) {
            return false;
        }

        return $libraryFile->tenant_id !== null
            && (int) $libraryFile->tenant_id === (int) $user->tenant_id
            && $libraryFile->is_policy
            && $libraryFile->policy_state === PolicyState::Published;
    }
}
