import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters, Tenant } from '@/types';
import { Building2, CirclePause, ShieldAlert, ShieldCheck } from 'lucide-react';

interface TenantRow extends Tenant {
    users_count?: number;
    departments_count?: number;
}

export default function TenantsIndex({
    tenants,
    filters,
    stats,
    industries,
}: {
    tenants: Paginated<TenantRow>;
    filters: TableFilters;
    stats: Record<string, number>;
    industries: string[];
}) {
    const statItems: IndexStat[] = [
        { label: 'Total tenants', value: stats.total, detail: 'Registered companies on the platform.', icon: Building2 },
        { label: 'Pending', value: stats.pending, detail: 'Workspaces waiting for activation.', icon: ShieldAlert },
        { label: 'Active', value: stats.active, detail: 'Operational tenant workspaces.', icon: ShieldCheck },
        { label: 'Suspended', value: stats.suspended, detail: 'Restricted tenants needing attention.', icon: CirclePause },
    ];

    return (
        <PlatformLayout>
            <DataIndexPage
                title="Tenants"
                description="Review companies, support their workspace setup, and manage lifecycle status from one table."
                stats={statItems}
                actions={[{ label: 'Review Pending Tenants', href: '/tenants?status=pending', icon: ShieldAlert }]}
                filters={filters}
                filterConfigs={[
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { label: 'Pending', value: 'pending' },
                            { label: 'Active', value: 'active' },
                            { label: 'Inactive', value: 'inactive' },
                            { label: 'Suspended', value: 'suspended' },
                        ],
                    },
                    {
                        key: 'industry',
                        label: 'Industry',
                        options: industries.map((industry) => ({ label: industry, value: industry })),
                    },
                ]}
                paginated={tenants}
                tableTitle="Registered companies"
                tableDescription="The tenant table now surfaces contact, registration, and workspace footprint details at a glance."
                exportable
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableTableHead label="Name" column="name" filters={filters} />
                            <SortableTableHead label="Industry" column="industry" filters={filters} />
                            <SortableTableHead label="Size" column="company_size" filters={filters} />
                            <TableHead>Registration</TableHead>
                            <TableHead>Primary contact</TableHead>
                            <TableHead>Workspace footprint</TableHead>
                            <SortableTableHead label="Status" column="status" filters={filters} />
                            <TableHead className="w-[70px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.data.map((tenant) => (
                            <TableRow key={tenant.id}>
                                <TableCell className="align-top">
                                    <div className="font-medium">{tenant.name}</div>
                                    <div className="text-xs text-muted-foreground">{tenant.contact_phone ?? 'No phone on file'}</div>
                                </TableCell>
                                <TableCell>{tenant.industry ?? 'Unspecified'}</TableCell>
                                <TableCell>{tenant.company_size ?? 'Unknown'}</TableCell>
                                <TableCell>{tenant.registration_number ?? 'N/A'}</TableCell>
                                <TableCell className="align-top">
                                    <div className="font-medium">{tenant.contact_name ?? 'Not set'}</div>
                                    <div className="text-xs text-muted-foreground">{tenant.contact_email ?? 'No email on file'}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm font-medium">{tenant.users_count ?? 0} users</div>
                                    <div className="text-xs text-muted-foreground">{tenant.departments_count ?? 0} departments</div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge value={tenant.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <RowActionsMenu
                                        actions={[
                                            { label: 'View tenant', href: route('tenants.show', tenant.id) },
                                            { label: 'Edit tenant', href: route('tenants.edit', tenant.id) },
                                            { label: 'Delete tenant', href: route('tenants.destroy', tenant.id), method: 'delete', destructive: true },
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
