import { useState } from 'react';
import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import PlatformLayout from '@/layouts/platform-layout';
import { Department, IndexStat, Paginated, TableFilters } from '@/types';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Building2,
    CheckCircle2,
    FileText,
    Layers3,
    ListChecks,
    PencilRuler,
    Power,
    PowerOff,
    Trash2,
    Users,
    UsersRound,
} from 'lucide-react';

type DepartmentRow = Department & {
    employee_profiles_count?: number;
    tenant?: { id: number; name: string } | null;
};

function WorkforceDonut({ value, label }: { value: number; label: string }) {
    const pct = Math.max(0, Math.min(100, value));
    const radius = 22;
    const stroke = 5;
    const c = 2 * Math.PI * radius;
    const offset = c - (pct / 100) * c;
    const color = pct >= 66 ? '#059669' : pct >= 33 ? '#14417A' : '#94a3b8';
    return (
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg width="56" height="56" className="-rotate-90">
                <circle cx="28" cy="28" r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-muted" />
                <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-[11px] font-semibold text-[#0F2E52] dark:text-blue-200">{Math.round(pct)}%</span>
                <span className="text-[8px] uppercase tracking-wide text-muted-foreground">{label}</span>
            </div>
        </div>
    );
}

export default function DepartmentsIndex({
    departments,
    filters,
    stats,
    tenants = [],
    isSuperAdmin = false,
}: {
    departments: Paginated<DepartmentRow>;
    filters: TableFilters;
    stats: Record<string, number>;
    tenants?: Array<{ id: number; name: string }>;
    isSuperAdmin?: boolean;
}) {
    const statItems: IndexStat[] = [
        { label: 'Departments', value: stats.total, detail: 'Active organizational structures.', icon: Building2 },
        { label: 'Active', value: stats.active, detail: 'Departments currently available.', icon: Layers3 },
        { label: 'Inactive', value: stats.inactive, detail: 'Departments not in active use.', icon: PencilRuler },
        { label: 'Assigned employees', value: stats.employees, detail: 'Employees mapped to departments.', icon: Users },
    ];

    // Group departments by tenant
    const grouped = departments.data.reduce<Record<string, { tenantName: string; rows: DepartmentRow[] }>>((acc, dept) => {
        const key = String(dept.tenant?.id ?? 'none');
        const name = dept.tenant?.name ?? 'Unassigned';
        if (!acc[key]) acc[key] = { tenantName: name, rows: [] };
        acc[key].rows.push(dept);
        return acc;
    }, {});

    const groups = Object.entries(grouped);

    const [toggleTarget, setToggleTarget] = useState<DepartmentRow | null>(null);
    const [toggling, setToggling] = useState(false);

    const confirmToggle = () => {
        if (!toggleTarget) return;
        const nextStatus = String(toggleTarget.status) === 'active' ? 'inactive' : 'active';
        setToggling(true);
        router.put(
            route('departments.update', toggleTarget.id),
            {
                tenant_id: toggleTarget.tenant?.id ?? null,
                name: toggleTarget.name,
                description: toggleTarget.description ?? null,
                status: nextStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Department ${nextStatus === 'active' ? 'activated' : 'deactivated'}.`);
                    setToggleTarget(null);
                },
                onError: () => toast.error('Failed to update department status.'),
                onFinish: () => setToggling(false),
            },
        );
    };

    const isActivating = toggleTarget ? String(toggleTarget.status) !== 'active' : false;

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
                        ...(isSuperAdmin
                            ? [
                                  {
                                      key: 'tenant_id',
                                      label: 'Tenant',
                                      options: tenants.map((t) => ({ label: t.name, value: String(t.id) })),
                                  },
                              ]
                            : []),
                    ]}
                    paginated={departments}
                    tableTitle="Department Directory"
                    tableDescription="Each department can own employees, assignments, and compliance responsibilities."
                    exportable
                >
                    <div className="space-y-6">
                        {groups.length === 0 && (
                            <Card className="border-[#14417A]/15 shadow-none">
                                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                    No departments found for the current filters.
                                </CardContent>
                            </Card>
                        )}

                        {groups.map(([key, group]) => (
                            <Card key={key} className="border-[#14417A]/15 shadow-none">
                                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-semibold text-[#0F2E52] dark:text-blue-200">
                                                    {group.tenantName}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 text-xs">
                                                    <ListChecks className="h-3 w-3" />
                                                    {group.rows.length} {group.rows.length === 1 ? 'department' : 'departments'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                        >
                                            <UsersRound className="mr-1.5 h-3 w-3" />
                                            {group.rows.reduce((sum, r) => sum + (r.employee_profiles_count ?? 0), 0)} employees
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5">
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {group.rows.map((department) => {
                                            const groupTotal = group.rows.reduce((s, r) => s + (r.employee_profiles_count ?? 0), 0);
                                            const share = groupTotal > 0 ? ((department.employee_profiles_count ?? 0) / groupTotal) * 100 : 0;
                                            return (
                                            <Card
                                                key={department.id}
                                                className="group border-[#14417A]/15 shadow-none transition-colors hover:border-[#14417A]/40 hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                                            >
                                                <CardContent className="space-y-4 p-5">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <WorkforceDonut value={share} label="share" />
                                                            <div className="space-y-0.5">
                                                                <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                                    {department.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Department #{department.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <RowActionsMenu
                                                            actions={[
                                                                {
                                                                    label: String(department.status) === 'active' ? 'Deactivate' : 'Activate',
                                                                    icon: String(department.status) === 'active' ? PowerOff : Power,
                                                                    onClick: () => setToggleTarget(department),
                                                                },
                                                                {
                                                                    label: 'Delete',
                                                                    icon: Trash2,
                                                                    destructive: true,
                                                                    onClick: () => router.delete(route('departments.destroy', department.id)),
                                                                },
                                                            ]}
                                                        />
                                                    </div>

                                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                        <span className="line-clamp-2">
                                                            {department.description ?? 'No description'}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                                                        <div className="inline-flex items-center gap-2 rounded-full border border-[#14417A]/20 bg-[#14417A]/5 px-3 py-1 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                                                            <UsersRound className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-semibold">
                                                                {department.employee_profiles_count ?? 0}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                {(department.employee_profiles_count ?? 0) === 1 ? 'employee' : 'employees'}
                                                            </span>
                                                        </div>
                                                        <StatusBadge value={department.status} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DataIndexPage>
            </div>

            <Dialog open={!!toggleTarget} onOpenChange={(open) => !open && setToggleTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            {isActivating ? <Power className="h-5 w-5" /> : <PowerOff className="h-5 w-5" />}
                        </div>
                        <DialogTitle className="text-[#0F2E52] dark:text-blue-200">
                            {isActivating ? 'Activate' : 'Deactivate'} department
                        </DialogTitle>
                        <DialogDescription>
                            {isActivating
                                ? `This will make "${toggleTarget?.name}" available for assignments and employee routing again.`
                                : `"${toggleTarget?.name}" will be marked inactive. Existing employees remain, but it won't appear in active pickers.`}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setToggleTarget(null)} disabled={toggling}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmToggle}
                            disabled={toggling}
                            className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {toggling ? 'Saving…' : isActivating ? 'Activate' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PlatformLayout>
    );
}
