import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatLongDateTime } from '@/lib/date';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters, Tenant, User } from '@/types';
import { router } from '@inertiajs/react';
import { Building2, Shield, UserCheck, UserCog, UserPlus2 } from 'lucide-react';

interface UserRow extends User {
    tenant?: Tenant | null;
    roles?: Array<{ id: number; name: string }>;
    employee_profile?: {
        job_title?: string | null;
        department?: { name: string } | null;
    } | null;
}

export default function UsersIndex({
    users,
    filters,
    stats,
    tenants,
    roles,
}: {
    users: Paginated<UserRow>;
    filters: TableFilters;
    stats: Record<string, number>;
    tenants: Array<{ id: number; name: string }>;
    roles: string[];
}) {
    const statItems: IndexStat[] = [
        { label: 'All users', value: stats.total, detail: 'Every platform and tenant user account.', icon: UserCog },
        { label: 'Platform users', value: stats.platform, detail: 'Users not assigned to a tenant workspace.', icon: Shield },
        { label: 'Active', value: stats.active, detail: 'Accounts currently able to work in the platform.', icon: UserCheck },
        { label: 'Invited', value: stats.invited, detail: 'Provisioned accounts awaiting full activation.', icon: UserPlus2 },
    ];

    return (
        <PlatformLayout>
            <DataIndexPage
                title="Users"
                description="Super admin visibility across every tenant account, including direct support actions and impersonation."
                stats={statItems}
                filters={filters}
                filterConfigs={[
                    {
                        key: 'tenant_id',
                        label: 'Tenant',
                        options: tenants.map((tenant) => ({ label: tenant.name, value: String(tenant.id) })),
                    },
                    {
                        key: 'role',
                        label: 'Role',
                        options: roles.map((role) => ({ label: role.replaceAll('_', ' '), value: role })),
                    },
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { label: 'Invited', value: 'invited' },
                            { label: 'Active', value: 'active' },
                            { label: 'Inactive', value: 'inactive' },
                        ],
                    },
                ]}
                paginated={users}
                tableTitle="Cross-tenant user directory"
                tableDescription="Search by person or tenant, sort by account metadata, export the current scope, and impersonate when support access is required."
                exportable
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableTableHead label="User" column="name" filters={filters} />
                            <SortableTableHead label="Email" column="email" filters={filters} />
                            <SortableTableHead label="Tenant" column="tenant" filters={filters} />
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <SortableTableHead label="Created" column="created_at" filters={filters} />
                            <TableHead className="w-[180px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {user.employee_profile?.job_title ?? 'No job title'}
                                        {user.employee_profile?.department?.name ? ` · ${user.employee_profile.department.name}` : ''}
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="size-4 text-muted-foreground" />
                                        <span>{user.tenant?.name ?? 'Platform'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{user.roles?.map((role) => role.name.replaceAll('_', ' ')).join(', ') || 'No role'}</TableCell>
                                <TableCell>
                                    <StatusBadge value={user.status ?? 'active'} />
                                </TableCell>
                                <TableCell>{formatLongDateTime(user.created_at)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {!user.roles?.some((role) => role.name === 'super_admin') ? (
                                            <Button variant="outline" size="sm" onClick={() => router.post(route('impersonation.start', user.id))}>
                                                <UserCog className="size-4" />
                                                Impersonate
                                            </Button>
                                        ) : null}
                                        <RowActionsMenu
                                            actions={[
                                                { label: 'View details', href: route('users.show', user.id) },
                                                ...(user.roles?.some((role) => role.name === 'super_admin')
                                                    ? []
                                                    : [{ label: 'Impersonate User', href: route('impersonation.start', user.id), method: 'post' as const }]),
                                            ]}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DataIndexPage>
        </PlatformLayout>
    );
}
