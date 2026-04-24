import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { TenantStatusActionDialog } from '@/components/tenant-status-action-dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters, Tenant } from '@/types';
import { Link } from '@inertiajs/react';
import { Building2, CirclePause, Plus, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        { label: 'Waiting activation', value: stats.pending, detail: 'Workspaces waiting for activation.', icon: ShieldAlert },
        { label: 'Active', value: stats.active, detail: 'Operational tenant workspaces.', icon: ShieldCheck },
        { label: 'Inactive', value: stats.inactive, detail: 'Paused workspaces that can be restored.', icon: CirclePause },
    ];

    const tabs = [
        {
            label: 'All tenants',
            href: route('tenants.index'),
            active: !filters.status,
            count: stats.total,
            icon: Building2,
        },
        {
            label: 'Waiting activation',
            href: route('tenants.index', { status: 'pending' }),
            active: filters.status === 'pending',
            count: stats.pending,
            icon: ShieldAlert,
        },
        {
            label: 'Active',
            href: route('tenants.index', { status: 'active' }),
            active: filters.status === 'active',
            count: stats.active,
            icon: ShieldCheck,
        },
        {
            label: 'Inactive',
            href: route('tenants.index', { status: 'inactive' }),
            active: filters.status === 'inactive',
            count: stats.inactive,
            icon: CirclePause,
        },
        {
            label: 'Suspended',
            href: route('tenants.index', { status: 'suspended' }),
            active: filters.status === 'suspended',
            count: stats.suspended,
            icon: ShieldX,
        },
    ];

    return (
        <PlatformLayout>
            <DataIndexPage
                title="Tenants"
                description="Review companies, support their workspace setup, and manage lifecycle status from one table."
                stats={statItems}
                actions={[
                    { label: 'Create tenant', href: route('tenants.create'), icon: Plus },
                    { label: 'Review Pending Tenants', href: route('tenants.index', { status: 'pending' }), icon: ShieldAlert, variant: 'outline' },
                ]}
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
                tableToolbarAddon={
                    <div className="flex flex-wrap gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;

                            return (
                                <Link
                                    key={tab.label}
                                    href={tab.href}
                                    className={cn(
                                        'flex min-h-10 items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#083d77]/30 focus-visible:ring-offset-2',
                                        tab.active
                                            ? 'bg-white text-foreground shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-100',
                                    )}
                                >
                                    <Icon className="size-4" />
                                    <span>{tab.label}</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'ml-1 rounded-full border px-2 py-0.5 text-[11px]',
                                            tab.active
                                                ? 'border-border/70 bg-background/80 text-foreground dark:border-neutral-600 dark:bg-neutral-800'
                                                : 'border-border/70 bg-background/70 text-muted-foreground dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300',
                                        )}
                                    >
                                        {tab.count}
                                    </Badge>
                                </Link>
                            );
                        })}
                    </div>
                }
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
                            <TableHead className="w-[220px] text-right">Actions</TableHead>
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
                                    <div className="flex items-center justify-end gap-2">
                                        {(tenant.status === 'pending' || tenant.status === 'inactive') && (
                                            <TenantStatusActionDialog tenantId={tenant.id} tenantName={tenant.name} action="activate" compact />
                                        )}
                                        {tenant.status === 'active' && (
                                            <TenantStatusActionDialog tenantId={tenant.id} tenantName={tenant.name} action="deactivate" compact />
                                        )}
                                        <RowActionsMenu
                                            actions={[
                                                { label: 'View tenant', href: route('tenants.show', tenant.id) },
                                                { label: 'Edit tenant', href: route('tenants.edit', tenant.id) },
                                                { label: 'Delete tenant', href: route('tenants.destroy', tenant.id), method: 'delete', destructive: true },
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
