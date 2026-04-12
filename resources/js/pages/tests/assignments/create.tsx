import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, CalendarDays, CheckSquare, ClipboardCheck, Loader2, Send, ShieldCheck, UserCheck, UsersRound, XCircle } from 'lucide-react';
import type { ElementType } from 'react';
import { toast } from 'sonner';

interface TenantOption {
    id: number;
    name: string;
    status: string;
}

interface TestOption {
    id: number;
    title: string;
    status: string;
    pass_mark: number;
    course?: {
        id: number;
        title: string;
    } | null;
}

interface EmployeeOption {
    id: number;
    name: string;
    email: string;
    department?: string | null;
    job_title?: string | null;
}

interface Props {
    tenants: TenantOption[];
    tests: TestOption[];
    employees: EmployeeOption[];
    selectedTenantId?: number | null;
    selectedTestId?: number | null;
    isSuperAdmin: boolean;
}

interface AssignmentFormData {
    tenant_id: string;
    test_id: string;
    assigned_to_user_ids: string[];
    due_date: string;
    status: string;
}

export default function TestAssignmentCreate({
    tenants,
    tests,
    employees,
    selectedTenantId,
    selectedTestId,
    isSuperAdmin,
}: Props) {
    const form = useForm<AssignmentFormData>({
        tenant_id: selectedTenantId ? String(selectedTenantId) : '',
        test_id: selectedTestId ? String(selectedTestId) : '',
        assigned_to_user_ids: [],
        due_date: '',
        status: 'assigned',
    });

    const selectedTest = tests.find((test) => String(test.id) === form.data.test_id);
    const selectedTenant = tenants.find((tenant) => String(tenant.id) === form.data.tenant_id);
    const selectedCount = form.data.assigned_to_user_ids.length;
    const tenantIsRequired = isSuperAdmin && !form.data.tenant_id;

    function reloadForTenant(tenantId: string) {
        form.setData((current) => ({
            ...current,
            tenant_id: tenantId,
            assigned_to_user_ids: [],
        }));

        router.get(
            route('tests.assignments.create'),
            {
                tenant_id: tenantId,
                test_id: form.data.test_id || undefined,
            },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function toggleEmployee(employeeId: string, checked: boolean) {
        form.setData(
            'assigned_to_user_ids',
            checked
                ? Array.from(new Set([...form.data.assigned_to_user_ids, employeeId]))
                : form.data.assigned_to_user_ids.filter((id) => id !== employeeId),
        );
    }

    function toggleSelectAll(checked: boolean) {
        form.setData('assigned_to_user_ids', checked ? employees.map((employee) => String(employee.id)) : []);
    }

    function submit() {
        if (!form.data.test_id) {
            toast.error('Select a test before assigning employees.');
            return;
        }

        if (isSuperAdmin && !form.data.tenant_id) {
            toast.error('Select a tenant before choosing employees.');
            return;
        }

        if (!selectedCount) {
            toast.error('Select at least one employee.');
            return;
        }

        form.post(route('tests.assignments.store', { test: form.data.test_id }), {
            preserveScroll: true,
            onError: (errors) => {
                const message = Object.values(errors).join('\n');
                toast.error(message || 'Test assignment could not be saved.');
            },
        });
    }

    return (
        <PlatformLayout>
            <Head title="Assign test" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <PageHeader
                        title="Assign test"
                        description="Create mandatory test assignments for employees. Super admins choose a tenant first, then select that tenant's employees."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('tests.index')}>
                                <ArrowLeft className="size-4" />
                                Back to tests
                            </Link>
                        </Button>
                    </div>
                </div>

                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="border-border/70 shadow-none">
                        <CardContent className="flex items-start justify-between gap-4 p-5">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Selected test</p>
                                <p className="text-2xl font-semibold tracking-tight">{selectedTest ? 'Ready' : 'Required'}</p>
                                <p className="text-sm text-muted-foreground">{selectedTest?.title ?? 'Choose the assessment employees must complete.'}</p>
                            </div>
                            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                <ClipboardCheck className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 shadow-none">
                        <CardContent className="flex items-start justify-between gap-4 p-5">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Employees</p>
                                <p className="text-2xl font-semibold tracking-tight">{selectedCount}</p>
                                <p className="text-sm text-muted-foreground">{employees.length} employees available in the current scope.</p>
                            </div>
                            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                <UsersRound className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 shadow-none">
                        <CardContent className="flex items-start justify-between gap-4 p-5">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Delivery</p>
                                <p className="text-2xl font-semibold tracking-tight">{form.data.due_date ? 'Dated' : 'Open'}</p>
                                <p className="text-sm text-muted-foreground">{form.data.due_date || 'Due date is optional for this assignment.'}</p>
                            </div>
                            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                <CalendarDays className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex flex-col gap-1">
                                    <CardTitle className="text-base font-medium">Assignment details</CardTitle>
                                    <CardDescription>Select the assessment, tenant scope, employees, and due date.</CardDescription>
                                </div>
                                <Badge variant="outline">{selectedCount} selected</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                {isSuperAdmin ? (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="tenant_id">Tenant</Label>
                                        <Select value={form.data.tenant_id || undefined} onValueChange={reloadForTenant}>
                                            <SelectTrigger id="tenant_id" aria-invalid={!!form.errors.tenant_id}>
                                                <SelectValue placeholder="Select tenant first" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {tenants.map((tenant) => (
                                                        <SelectItem key={tenant.id} value={String(tenant.id)}>
                                                            {tenant.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.tenant_id ? <p className="text-sm text-destructive">{form.errors.tenant_id}</p> : null}
                                    </div>
                                ) : null}

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="test_id">Test</Label>
                                    <Select value={form.data.test_id || undefined} onValueChange={(value) => form.setData('test_id', value)}>
                                        <SelectTrigger id="test_id" aria-invalid={!!form.errors.test_id}>
                                            <SelectValue placeholder="Select test" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {tests.map((test) => (
                                                    <SelectItem key={test.id} value={String(test.id)}>
                                                        {test.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {form.errors.test_id ? <p className="text-sm text-destructive">{form.errors.test_id}</p> : null}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="due_date">Due date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={form.data.due_date}
                                        onChange={(event) => form.setData('due_date', event.target.value)}
                                        aria-invalid={!!form.errors.due_date}
                                    />
                                    {form.errors.due_date ? <p className="text-sm text-destructive">{form.errors.due_date}</p> : null}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="status">Initial status</Label>
                                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                        <SelectTrigger id="status" aria-invalid={!!form.errors.status}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="assigned">Assigned</SelectItem>
                                                <SelectItem value="in_progress">In progress</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {form.errors.status ? <p className="text-sm text-destructive">{form.errors.status}</p> : null}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-sm font-medium">Employees</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {tenantIsRequired ? 'Choose a tenant to load employees.' : 'Select one or many employees to receive this mandatory test.'}
                                        </p>
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                        <Checkbox
                                            checked={employees.length > 0 && selectedCount === employees.length}
                                            disabled={!employees.length}
                                            onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                        />
                                        Select all
                                    </label>
                                </div>

                                {tenantIsRequired ? (
                                    <EmptyState
                                        icon={Building2}
                                        title="Select a tenant"
                                        description="Super admins assign tests inside a tenant scope so the employee list stays tenant-safe."
                                    />
                                ) : employees.length ? (
                                    <div className="overflow-hidden rounded-xl border border-border/70">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[52px]">Select</TableHead>
                                                    <TableHead>Employee</TableHead>
                                                    <TableHead>Department</TableHead>
                                                    <TableHead>Role</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {employees.map((employee) => {
                                                    const employeeId = String(employee.id);
                                                    const checked = form.data.assigned_to_user_ids.includes(employeeId);

                                                    return (
                                                        <TableRow key={employee.id} data-state={checked ? 'selected' : undefined}>
                                                            <TableCell>
                                                                <Checkbox
                                                                    aria-label={`Select ${employee.name}`}
                                                                    checked={checked}
                                                                    onCheckedChange={(value) => toggleEmployee(employeeId, !!value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-medium">{employee.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{employee.email}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{employee.department ?? 'Unassigned'}</TableCell>
                                                            <TableCell>{employee.job_title ?? 'Employee'}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={UsersRound}
                                        title="No employees found"
                                        description="There are no active employee profiles in this tenant yet."
                                    />
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button type="button" disabled={form.processing || tenantIsRequired || selectedCount === 0 || !form.data.test_id} onClick={submit}>
                                    {form.processing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                    Send assignment
                                </Button>
                                <Button type="button" variant="outline" disabled={form.processing} onClick={() => form.reset('assigned_to_user_ids', 'due_date')}>
                                    <XCircle className="size-4" />
                                    Clear form
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base font-medium">Assignment summary</CardTitle>
                                <CardDescription>Confirm the current scope before sending.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 text-sm">
                                <SummaryRow icon={Building2} label="Tenant" value={isSuperAdmin ? (selectedTenant?.name ?? 'Not selected') : 'Current tenant'} />
                                <SummaryRow icon={ClipboardCheck} label="Test" value={selectedTest?.title ?? 'Not selected'} />
                                <SummaryRow icon={UsersRound} label="Employees" value={`${selectedCount} selected`} />
                                <SummaryRow icon={CalendarDays} label="Due date" value={form.data.due_date || 'No due date'} />
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base font-medium">Selected test</CardTitle>
                                <CardDescription>Published tests are immediately available in the employee workspace.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedTest ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-medium">{selectedTest.title}</p>
                                                <p className="text-sm text-muted-foreground">{selectedTest.course?.title ?? 'Standalone assessment'}</p>
                                            </div>
                                            <StatusBadge value={selectedTest.status} />
                                        </div>
                                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                                            Pass mark is {selectedTest.pass_mark}%. Employees receive an in-app notification after assignment.
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyState icon={ClipboardCheck} title="No test selected" description="Choose the assessment employees should complete." />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base font-medium">Delivery notes</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <GuidanceItem icon={ShieldCheck} title="Tenant-safe" description="Company admins only assign to employees in their tenant. Super admins choose the target tenant first." />
                                <GuidanceItem icon={UserCheck} title="Mandatory workspace item" description="Assigned tests appear in the employee's mandatory tests tab." />
                                <GuidanceItem icon={CheckSquare} title="Bulk-ready" description="Select all employees or target a smaller group before sending." />
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </PlatformLayout>
    );
}

function SummaryRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
            <div className="rounded-lg border border-border/70 bg-background p-2">
                <Icon className="size-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                <p className="truncate font-medium">{value}</p>
            </div>
        </div>
    );
}

function GuidanceItem({ icon: Icon, title, description }: { icon: ElementType; title: string; description: string }) {
    return (
        <div className="flex gap-3">
            <div className="rounded-lg border border-border/70 bg-muted/30 p-2">
                <Icon className="size-4" />
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
