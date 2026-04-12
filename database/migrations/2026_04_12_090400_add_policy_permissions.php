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

        $viewPermission = Permission::findOrCreate(Permissions::VIEW_POLICIES, 'web');
        $managePermission = Permission::findOrCreate(Permissions::MANAGE_POLICIES, 'web');
        $assignPermission = Permission::findOrCreate(Permissions::ASSIGN_POLICIES, 'web');
        $acknowledgePermission = Permission::findOrCreate(Permissions::ACKNOWLEDGE_POLICIES, 'web');

        Role::findOrCreate('super_admin', 'web')->givePermissionTo([
            $viewPermission,
            $managePermission,
            $assignPermission,
            $acknowledgePermission,
        ]);

        Role::findOrCreate('company_admin', 'web')->givePermissionTo([
            $viewPermission,
            $managePermission,
            $assignPermission,
            $acknowledgePermission,
        ]);

        foreach (['employee', 'reviewer'] as $roleName) {
            Role::findOrCreate($roleName, 'web')->givePermissionTo([
                $viewPermission,
                $acknowledgePermission,
            ]);
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

            foreach ([
                Permissions::VIEW_POLICIES,
                Permissions::MANAGE_POLICIES,
                Permissions::ASSIGN_POLICIES,
                Permissions::ACKNOWLEDGE_POLICIES,
            ] as $permission) {
                if ($role->hasPermissionTo($permission, 'web')) {
                    $role->revokePermissionTo($permission);
                }
            }
        }

        Permission::query()->whereIn('name', [
            Permissions::VIEW_POLICIES,
            Permissions::MANAGE_POLICIES,
            Permissions::ASSIGN_POLICIES,
            Permissions::ACKNOWLEDGE_POLICIES,
        ])->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
