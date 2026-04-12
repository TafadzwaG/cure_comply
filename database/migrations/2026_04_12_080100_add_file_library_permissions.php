<?php

use App\Support\Permissions;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $viewPermission = Permission::findOrCreate(Permissions::VIEW_FILE_LIBRARY, 'web');
        $managePermission = Permission::findOrCreate(Permissions::MANAGE_FILE_LIBRARY, 'web');

        foreach (['super_admin', 'company_admin'] as $roleName) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->givePermissionTo([$viewPermission, $managePermission]);
        }

        foreach (['employee', 'reviewer'] as $roleName) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->givePermissionTo($viewPermission);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['super_admin', 'company_admin', 'employee', 'reviewer'] as $roleName) {
            $role = Role::query()->where('name', $roleName)->where('guard_name', 'web')->first();

            if (! $role) {
                continue;
            }

            if ($role->hasPermissionTo(Permissions::MANAGE_FILE_LIBRARY, 'web')) {
                $role->revokePermissionTo(Permissions::MANAGE_FILE_LIBRARY);
            }

            if ($role->hasPermissionTo(Permissions::VIEW_FILE_LIBRARY, 'web')) {
                $role->revokePermissionTo(Permissions::VIEW_FILE_LIBRARY);
            }
        }

        Permission::query()->whereIn('name', [
            Permissions::VIEW_FILE_LIBRARY,
            Permissions::MANAGE_FILE_LIBRARY,
        ])->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
