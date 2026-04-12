import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatLongDateTime } from '@/lib/date';
import PlatformLayout from '@/layouts/platform-layout';
import { Department, EmployeeProfile, IndexStat, Paginated, SharedData, TableFilters, Tenant } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Activity, AlertTriangle, BriefcaseBusiness, Download, Loader2, ShieldAlert, UploadCloud, Users, X } from 'lucide-react';
import { DragEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function EmployeesIndex({
    employees,
    departments,
    tenants,
    filters,
    stats,
}: {
    employees: Paginated<EmployeeProfile>;
    departments: Department[];
    tenants: Array<Pick<Tenant, 'id' | 'name'>>;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const { auth, tenant } = usePage<SharedData>().props;
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const isSuperAdmin = auth.user?.display_role === 'super_admin' || auth.user?.roles?.some((role) => role.name === 'super_admin');

    const statItems: IndexStat[] = [
        { label: 'Employees', value: stats.total, detail: 'People profiles available inside the current workspace.', icon: Users },
        { label: 'Active access', value: stats.active, detail: 'Employees currently able to use the platform.', icon: BriefcaseBusiness },
        { label: 'Overdue training', value: stats.overdue, detail: 'Assignments that need immediate follow-up.', icon: AlertTriangle },
        { label: 'Average test score', value: `${stats.avgTestScore}%`, detail: 'Latest assessment performance across employees.', icon: Activity },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Employees"
                    description="Track workforce identity, learning progress, compliance participation, and operational risk in one index."
                    stats={statItems}
                    actions={[
                        { label: 'Invite Employee', href: route('invitations.create'), icon: Users },
                        { label: 'Import Employees', onClick: () => setImportDialogOpen(true), icon: UploadCloud, variant: 'outline' },
                        { label: 'Download Template', onClick: () => window.location.assign(route('employees.import-template')), icon: Download, variant: 'outline' },
                    ]}
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
                                                {profile.branch ? ` - ${profile.branch}` : ''}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div>{profile.department?.name ?? 'Unassigned'}</div>
                                            <div className="text-xs text-muted-foreground">Manager: {profile.manager_name ?? 'Not assigned'}</div>
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
                                            <div className="font-medium">
                                                {profile.latest_test_percentage ?? 'N/A'}
                                                {profile.latest_test_percentage !== null && profile.latest_test_percentage !== undefined ? '%' : ''}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Latest scored attempt</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatLongDateTime(profile.last_login_at)}</TableCell>
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
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DataIndexPage>

                <EmployeeImportDialog
                    open={importDialogOpen}
                    onOpenChange={setImportDialogOpen}
                    isSuperAdmin={!!isSuperAdmin}
                    currentTenant={tenant ?? null}
                    tenants={tenants}
                />
            </div>
        </PlatformLayout>
    );
}

interface EmployeeImportFormData {
    tenant_id: string;
    file: File | null;
}

function EmployeeImportDialog({
    open,
    onOpenChange,
    isSuperAdmin,
    currentTenant,
    tenants,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isSuperAdmin: boolean;
    currentTenant: Tenant | null;
    tenants: Array<Pick<Tenant, 'id' | 'name'>>;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const form = useForm<EmployeeImportFormData>({
        tenant_id: currentTenant?.id ? String(currentTenant.id) : '',
        file: null,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        form.clearErrors();
        form.setData({
            tenant_id: currentTenant?.id ? String(currentTenant.id) : '',
            file: null,
        });
        setIsDragging(false);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [open, currentTenant?.id]);

    const applyFile = (file: File | null) => {
        form.setData('file', file);
        setIsDragging(false);
    };

    const submit = () => {
        form.post(route('employees.import'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                onOpenChange(false);
                const success = (page.props as SharedData).flash?.success;
                toast.success(success ?? 'Employee import completed.');
            },
            onError: (errors) => {
                const message = Object.values(errors).join('\n');
                toast.error(message || 'The employee import could not be completed.');
            },
        });
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        applyFile(event.dataTransfer.files?.[0] ?? null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import employees</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file. Existing tenant users are updated in place, and new email addresses are queued as invitations.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {isSuperAdmin ? (
                        <Field label="Company" error={form.errors.tenant_id}>
                            <Select value={form.data.tenant_id || undefined} onValueChange={(value) => form.setData('tenant_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenants.map((tenant) => (
                                        <SelectItem key={tenant.id} value={String(tenant.id)}>
                                            {tenant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    ) : (
                        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                            Imported employees will be applied to <span className="font-medium text-foreground">{currentTenant?.name ?? 'your company'}</span>.
                        </div>
                    )}

                    <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                        Template columns: <span className="font-medium text-foreground">Name, Email, Role, Department, Job Title, Employment Type, Start Date, Risk Level, Branch, Employee Number, Phone, Alternate Phone</span>.
                    </div>

                    <Field label="Spreadsheet file" error={form.errors.file}>
                        <label
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className="block"
                        >
                            <div
                                className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-6 py-8 text-center transition-colors hover:border-[#14417A]/40 hover:bg-[#14417A]/5"
                                style={isDragging ? { borderColor: '#14417A', backgroundColor: 'rgba(20, 65, 122, 0.05)' } : undefined}
                                onClick={() => inputRef.current?.click()}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#14417A]/10 bg-[#14417A]/5">
                                    <UploadCloud className="size-5 text-[#14417A]" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium">{form.data.file?.name ?? 'Drag and drop an Excel or CSV file here'}</div>
                                    <div className="text-xs text-muted-foreground">Accepted formats: .xlsx and .csv. Maximum file size: 20 MB.</div>
                                </div>
                                {form.data.file ? <div className="text-xs text-muted-foreground">{(form.data.file.size / 1024).toFixed(1)} KB selected</div> : null}
                            </div>
                            <Input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx,.csv"
                                onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
                                className="sr-only"
                            />
                        </label>

                        {form.data.file ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    applyFile(null);

                                    if (inputRef.current) {
                                        inputRef.current.value = '';
                                    }
                                }}
                            >
                                <X className="size-4" />
                                Clear selected file
                            </Button>
                        ) : null}
                    </Field>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.processing}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={submit} disabled={form.processing}>
                        {form.processing ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                        Import employees
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
