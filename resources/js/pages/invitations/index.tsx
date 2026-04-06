import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { Department, IndexStat, Paginated, TableFilters } from '@/types';
import { router } from '@inertiajs/react';
import { CheckCheck, Clock3, MailPlus, TimerReset, Users } from 'lucide-react';

interface Invitation {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: Department | null;
    accepted_at?: string | null;
    expires_at?: string | null;
}

export default function InvitationsIndex({
    invitations,
    departments,
    filters,
    stats,
}: {
    invitations: Paginated<Invitation>;
    departments: Department[];
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        { label: 'Invitations', value: stats.total, detail: 'Total invitations issued.', icon: Users },
        { label: 'Pending', value: stats.pending, detail: 'Invitations awaiting acceptance.', icon: Clock3 },
        { label: 'Accepted', value: stats.accepted, detail: 'Users already activated.', icon: CheckCheck },
        { label: 'Expired', value: stats.expired, detail: 'Invitations past their validity window.', icon: TimerReset },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Invitations"
                    description="Invite employees and reviewers with secure first-time activation links."
                    stats={statItems}
                    actions={[{ label: 'Invite Employee', href: route('invitations.create'), icon: MailPlus }]}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: 'role',
                            label: 'Role',
                            options: [
                                { label: 'Employee', value: 'employee' },
                                { label: 'Reviewer', value: 'reviewer' },
                            ],
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Pending', value: 'pending' },
                                { label: 'Accepted', value: 'accepted' },
                                { label: 'Expired', value: 'expired' },
                            ],
                        },
                        {
                            key: 'department_id',
                            label: 'Department',
                            options: departments.map((department) => ({ label: department.name, value: String(department.id) })),
                        },
                    ]}
                    paginated={invitations}
                    tableTitle="Outstanding Invites"
                    tableDescription="Pending invitations expire after seven days and can be reissued if needed."
                    exportable
                >
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <SortableTableHead label="Invitee" column="name" filters={filters} />
                            <SortableTableHead label="Role" column="role" filters={filters} />
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invitations.data.map((invite) => (
                                <TableRow key={invite.id}>
                                    <TableCell>
                                        <div className="font-medium">{invite.name}</div>
                                        <div className="text-xs text-muted-foreground">{invite.email}</div>
                                    </TableCell>
                                    <TableCell className="capitalize">{invite.role}</TableCell>
                                    <TableCell>{invite.department?.name ?? 'Unassigned'}</TableCell>
                                    <TableCell>
                                        <StatusBadge value={invite.accepted_at ? 'accepted' : 'pending'} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <RowActionsMenu
                                            actions={[
                                                {
                                                    label: 'Delete invitation',
                                                    destructive: true,
                                                    onClick: () => router.delete(route('invitations.destroy', invite.id)),
                                                },
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DataIndexPage>
            </div>
        </PlatformLayout>
    );
}
