import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { UserStatusActionDialog } from '@/components/user-status-action-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatLongDateTime } from '@/lib/date';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, SharedData, TableFilters, Tenant, User } from '@/types';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Building2, Shield, UserCheck, UserCog, UserPlus2 } from 'lucide-react';

interface UserRow extends User {
    tenant?: Tenant | null;
    roles?: Array<{ id: number; name: string }>;
    abilities?: {
        canEdit?: boolean;
        canDeactivate?: boolean;
        canReactivate?: boolean;
        canImpersonate?: boolean;
    };
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
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.roles?.some((role) => role.name === 'super_admin');
    const statItems: IndexStat[] = [
        { label: 'All users', value: stats.total, detail: 'Every platform and tenant user account.', icon: UserCog },
        { label: isSuperAdmin ? 'Platform users' : 'Inactive', value: isSuperAdmin ? stats.platform : (stats.inactive ?? 0), detail: isSuperAdmin ? 'Users not assigned to a tenant workspace.' : 'Accounts currently paused and unable to sign in.', icon: Shield },
        { label: 'Active', value: stats.active, detail: 'Accounts currently able to work in the platform.', icon: UserCheck },
        { label: 'Invited', value: stats.invited, detail: 'Provisioned accounts awaiting full activation.', icon: UserPlus2 },
    ];

    return (
        <PlatformLayout>
            <DataIndexPage
                title="Users"
                description={isSuperAdmin ? 'Cross-tenant visibility across every account, including direct support actions and impersonation.' : 'Manage user accounts inside your company workspace, including profile fixes and access lifecycle actions.'}
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
                tableTitle={isSuperAdmin ? 'Cross-tenant user directory' : 'Tenant user directory'}
                tableDescription={isSuperAdmin ? 'Search by person or tenant, sort by account metadata, export the current scope, and impersonate when support access is required.' : 'Search and review user accounts inside the current tenant, then open profile or lifecycle actions as needed.'}
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
                                <TableCell>
                                    <UserEmailDisplay user={user} />
                                </TableCell>
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
                                        {user.abilities?.canImpersonate ? (
                                            <Button variant="outline" size="sm" onClick={() => router.post(route('impersonation.start', user.id))}>
                                                <UserCog className="size-4" />
                                                Impersonate
                                            </Button>
                                        ) : null}
                                        {user.abilities?.canDeactivate ? (
                                            <UserStatusActionDialog userId={user.id} userName={user.name} action="deactivate" compact triggerLabel="Deactivate" />
                                        ) : null}
                                        {user.abilities?.canReactivate ? (
                                            <UserStatusActionDialog userId={user.id} userName={user.name} action="reactivate" compact triggerLabel="Reactivate" />
                                        ) : null}
                                        <RowActionsMenu
                                            actions={[
                                                { label: 'View details', href: route('users.show', user.id) },
                                                ...(user.abilities?.canImpersonate
                                                    ? [{ label: 'Impersonate User', href: route('impersonation.start', user.id), method: 'post' as const }]
                                                    : []),
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

function UserEmailDisplay({ user }: { user: UserRow }) {
    if (isDeactivatedPlaceholderEmail(user.email)) {
        return <Badge variant="destructive">Deactivated</Badge>;
    }

    return <span>{user.email}</span>;
}

function isDeactivatedPlaceholderEmail(email?: string | null) {
    return Boolean(email?.toLowerCase().includes('@users.privacycure.invalid'));
}
