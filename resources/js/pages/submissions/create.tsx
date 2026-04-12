import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { useForm } from '@inertiajs/react';
import { CalendarClock, ClipboardCheck, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';

interface EmployeeOption {
    id: number;
    tenant_id: number | null;
    name: string;
    email: string;
}

export default function SubmissionsCreate({
    frameworks,
    employees = [],
    tenants = [],
    isSuperAdmin = false,
}: {
    frameworks: Array<{ id: number; name: string }>;
    employees?: EmployeeOption[];
    tenants?: Array<{ id: number; name: string }>;
    isSuperAdmin?: boolean;
}) {
    const form = useForm({
        tenant_id: '',
        compliance_framework_id: '',
        title: '',
        reporting_period: '2026-Q1',
        assigned_to_user_ids: [] as number[],
    });

    const assignableEmployees = useMemo(() => {
        if (!isSuperAdmin) {
            return employees;
        }

        if (!form.data.tenant_id) {
            return [];
        }

        return employees.filter((employee) => String(employee.tenant_id) === form.data.tenant_id);
    }, [employees, form.data.tenant_id, isSuperAdmin]);

    const toggleAssignee = (employeeId: number, checked: boolean) => {
        const current = new Set(form.data.assigned_to_user_ids);

        if (checked) {
            current.add(employeeId);
        } else {
            current.delete(employeeId);
        }

        form.setData('assigned_to_user_ids', Array.from(current));
    };

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="New Submission" description="Start a tenant compliance submission against a selected framework version." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader><CardTitle>Submission Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Select
                                        value={form.data.tenant_id}
                                        onValueChange={(value) => {
                                            form.setData('tenant_id', value);
                                            form.setData('assigned_to_user_ids', []);
                                        }}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Tenant" /></SelectTrigger>
                                        <SelectContent>{tenants.map((tenant) => <SelectItem key={tenant.id} value={String(tenant.id)}>{tenant.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <InputError message={form.errors.tenant_id} />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Select value={form.data.compliance_framework_id} onValueChange={(value) => form.setData('compliance_framework_id', value)}>
                                    <SelectTrigger><SelectValue placeholder="Framework" /></SelectTrigger>
                                    <SelectContent>{frameworks.map((framework) => <SelectItem key={framework.id} value={String(framework.id)}>{framework.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={form.errors.compliance_framework_id} />
                            </div>
                            <div className="space-y-2">
                                <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="Submission title" />
                                <InputError message={form.errors.title} />
                            </div>
                            <div className="space-y-2">
                                <Input value={form.data.reporting_period} onChange={(e) => form.setData('reporting_period', e.target.value)} placeholder="Reporting period" />
                                <InputError message={form.errors.reporting_period} />
                            </div>
                            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                                <div className="mb-4 space-y-1">
                                    <h3 className="text-sm font-medium text-foreground">Assign employees</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Employees only see submissions assigned to them by a company admin or super admin.
                                    </p>
                                </div>

                                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                    {assignableEmployees.map((employee) => (
                                        <Label
                                            key={employee.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-normal transition-colors hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                checked={form.data.assigned_to_user_ids.includes(employee.id)}
                                                onCheckedChange={(checked) => toggleAssignee(employee.id, checked === true)}
                                            />
                                            <span className="flex flex-col">
                                                <span className="font-medium text-foreground">{employee.name}</span>
                                                <span className="text-xs text-muted-foreground">{employee.email}</span>
                                            </span>
                                        </Label>
                                    ))}

                                    {assignableEmployees.length === 0 && (
                                        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                                            {isSuperAdmin && !form.data.tenant_id
                                                ? 'Select a tenant to choose employee assignees.'
                                                : 'No employees are available for this tenant yet.'}
                                        </div>
                                    )}
                                </div>
                                <InputError message={form.errors.assigned_to_user_ids} />
                            </div>
                            <Button disabled={form.processing} onClick={() => form.post(route('submissions.store'))}>
                                {form.processing ? 'Creating submission...' : 'Create Submission'}
                            </Button>
                        </CardContent>
                    </Card>
                    <CreateGuidancePanel
                        title="What happens next"
                        description="The submission becomes the working record for answering questions and attaching evidence."
                        items={[
                            { title: 'Submission is opened in draft', description: 'The record is created and can be refined before final submission.', icon: ClipboardCheck },
                            { title: 'Framework questions become available', description: 'The linked framework determines the section and question structure for responses.', icon: FileSpreadsheet },
                            { title: 'Reporting period anchors the cycle', description: 'The selected period supports tracking, exports, and historical analysis.', icon: CalendarClock },
                            { title: 'Scoring remains controlled', description: 'Scores are only calculated after response progress and review actions move forward.', icon: ShieldCheck },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}
