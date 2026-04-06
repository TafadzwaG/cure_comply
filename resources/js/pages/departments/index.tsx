import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { Department, IndexStat, Paginated, TableFilters } from '@/types';
import { router } from '@inertiajs/react';
import { Building2, Layers3, PencilRuler, Users } from 'lucide-react';

export default function DepartmentsIndex({
    departments,
    filters,
    stats,
}: {
    departments: Paginated<Department & { employee_profiles_count?: number }>;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        { label: 'Departments', value: stats.total, detail: 'Active organizational structures.', icon: Building2 },
        { label: 'Active', value: stats.active, detail: 'Departments currently available.', icon: Layers3 },
        { label: 'Inactive', value: stats.inactive, detail: 'Departments not in active use.', icon: PencilRuler },
        { label: 'Assigned employees', value: stats.employees, detail: 'Employees mapped to departments.', icon: Users },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Departments"
                    description="Model company structure so reporting, training, and compliance ownership stay aligned."
                    stats={statItems}
                    actions={[{ label: 'Add New Department', href: route('departments.create'), icon: Building2 }]}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Active', value: 'active' },
                                { label: 'Inactive', value: 'inactive' },
                            ],
                        },
                    ]}
                    paginated={departments}
                    tableTitle="Department Directory"
                    tableDescription="Each department can own employees, assignments, and compliance responsibilities."
                    exportable
                >
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <SortableTableHead label="Name" column="name" filters={filters} />
                            <TableHead>Description</TableHead>
                            <TableHead>Employees</TableHead>
                            <SortableTableHead label="Status" column="status" filters={filters} />
                            <TableHead className="w-[70px] text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.data.map((department) => (
                                <TableRow key={department.id}>
                                    <TableCell className="font-medium">{department.name}</TableCell>
                                    <TableCell>{department.description ?? 'No description'}</TableCell>
                                    <TableCell>{department.employee_profiles_count ?? 0}</TableCell>
                                    <TableCell>
                                        <StatusBadge value={department.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <RowActionsMenu
                                            actions={[
                                                {
                                                    label: 'Delete',
                                                    destructive: true,
                                                    onClick: () => router.delete(route('departments.destroy', department.id)),
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
