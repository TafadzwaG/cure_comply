import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatLongDateTime } from '@/lib/date';
import PlatformLayout from '@/layouts/platform-layout';
import { Department, EmployeeProfile, IndexStat, Paginated, TableFilters } from '@/types';
import { router } from '@inertiajs/react';
import { Activity, AlertTriangle, BriefcaseBusiness, GraduationCap, ShieldAlert, Users } from 'lucide-react';

export default function EmployeesIndex({
    employees,
    departments,
    filters,
    stats,
}: {
    employees: Paginated<EmployeeProfile>;
    departments: Department[];
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        { label: 'Employees', value: stats.total, detail: 'People profiles available inside the current workspace.', icon: Users },
        { label: 'Active access', value: stats.active, detail: 'Employees currently able to use the platform.', icon: BriefcaseBusiness },
        { label: 'Overdue training', value: stats.overdue, detail: 'Assignments that need immediate follow-up.', icon: AlertTriangle },
        { label: 'Average test score', value: `${stats.avgTestScore}%`, detail: 'Latest assessment performance across employees.', icon: Activity },
    ];

    return (
        <PlatformLayout>
            <DataIndexPage
                title="Employees"
                description="Track workforce identity, learning progress, compliance participation, and operational risk in one index."
                stats={statItems}
                actions={[{ label: 'Invite Employee', href: route('invitations.create'), icon: Users }]}
                filters={filters}
                filterConfigs={[
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { label: 'Active', value: 'active' },
                            { label: 'Invited', value: 'invited' },
                            { label: 'Inactive', value: 'inactive' },
                        ],
                    },
                    {
                        key: 'department_id',
                        label: 'Department',
                        options: departments.map((department) => ({ label: department.name, value: String(department.id) })),
                    },
                    {
                        key: 'role',
                        label: 'Role',
                        options: [
                            { label: 'Company Admin', value: 'company_admin' },
                            { label: 'Employee', value: 'employee' },
                            { label: 'Reviewer', value: 'reviewer' },
                        ],
                    },
                    {
                        key: 'risk_level',
                        label: 'Risk',
                        options: [
                            { label: 'Low', value: 'low' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'High', value: 'high' },
                        ],
                    },
                    {
                        key: 'overdue',
                        label: 'Overdue',
                        options: [{ label: 'Has overdue training', value: 'yes' }],
                    },
                ]}
                paginated={employees}
                tableTitle="Employee intelligence"
                tableDescription="Search and sort employees by workforce profile, learning progress, assessment performance, and current compliance posture."
                exportable
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableTableHead label="Employee" column="name" filters={filters} />
                            <SortableTableHead label="Department" column="department" filters={filters} />
                            <TableHead>Role & risk</TableHead>
                            <TableHead>Training</TableHead>
                            <TableHead>Latest test</TableHead>
                            <SortableTableHead label="Last login" column="last_login" filters={filters} />
                            <SortableTableHead label="Status" column="status" filters={filters} />
                            <TableHead className="w-[70px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.data.map((profile) => (
                            <TableRow key={profile.id}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{profile.user?.name}</div>
                                        <div className="text-xs text-muted-foreground">{profile.user?.email}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {profile.job_title ?? 'Job title not set'}
                                            {profile.branch ? ` • ${profile.branch}` : ''}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div>{profile.department?.name ?? 'Unassigned'}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Manager: {profile.manager_name ?? 'Not assigned'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        <div className="text-sm capitalize">
                                            {profile.user?.roles?.[0]?.name?.replaceAll('_', ' ') ?? 'No role'}
                                        </div>
                                        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/35 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                            <ShieldAlert className="size-3.5" />
                                            {profile.risk_level ?? 'Unscored'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{profile.training_completion_percentage ?? 0}% complete</span>
                                            <span>{profile.overdue_assignments_count ?? 0} overdue</span>
                                        </div>
                                        <Progress value={profile.training_completion_percentage ?? 0} className="h-2.5" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{profile.latest_test_percentage ?? 'N/A'}{profile.latest_test_percentage !== null && profile.latest_test_percentage !== undefined ? '%' : ''}</div>
                                        <div className="text-xs text-muted-foreground">Latest scored attempt</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatLongDateTime(profile.last_login_at)}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge value={profile.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <RowActionsMenu
                                        actions={[
                                            {
                                                label: 'View employee',
                                                href: route('employees.show', profile.id),
                                            },
                                            {
                                                label: 'Open user account',
                                                href: route('users.show', profile.user_id),
                                            },
                                            {
                                                label: 'Remove',
                                                destructive: true,
                                                onClick: () => router.delete(route('employees.destroy', profile.id)),
                                            },
                                        ]}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DataIndexPage>
        </PlatformLayout>
    );
}
