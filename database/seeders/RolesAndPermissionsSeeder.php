<?php

namespace Database\Seeders;

use App\Support\Permissions;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Permissions::all() as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::findOrCreate('super_admin', 'web')->syncPermissions(Permissions::all());
        Role::findOrCreate('company_admin', 'web')->syncPermissions([
            Permissions::MANAGE_USERS,
            Permissions::INVITE_EMPLOYEES,
            Permissions::MANAGE_DEPARTMENTS,
            Permissions::ASSIGN_TRAINING,
            Permissions::MANAGE_TESTS,
            Permissions::MANAGE_COMPLIANCE_SUBMISSIONS,
            Permissions::ANSWER_COMPLIANCE_QUESTIONS,
            Permissions::UPLOAD_EVIDENCE,
            Permissions::CALCULATE_COMPLIANCE_SCORES,
            Permissions::VIEW_REPORTS,
            Permissions::EXPORT_REPORTS,
            Permissions::VIEW_FILE_LIBRARY,
            Permissions::MANAGE_FILE_LIBRARY,
            Permissions::VIEW_POLICIES,
            Permissions::MANAGE_POLICIES,
            Permissions::ASSIGN_POLICIES,
            Permissions::ACKNOWLEDGE_POLICIES,
            Permissions::VIEW_AUDIT_LOGS,
        ]);
        Role::findOrCreate('employee', 'web')->syncPermissions([
            Permissions::TAKE_TESTS,
            Permissions::ANSWER_COMPLIANCE_QUESTIONS,
            Permissions::UPLOAD_EVIDENCE,
            Permissions::VIEW_REPORTS,
            Permissions::VIEW_FILE_LIBRARY,
            Permissions::VIEW_POLICIES,
            Permissions::ACKNOWLEDGE_POLICIES,
        ]);
        Role::findOrCreate('reviewer', 'web')->syncPermissions([
            Permissions::REVIEW_EVIDENCE,
            Permissions::VIEW_REPORTS,
            Permissions::VIEW_FILE_LIBRARY,
            Permissions::VIEW_POLICIES,
            Permissions::ACKNOWLEDGE_POLICIES,
        ]);
    }
}
