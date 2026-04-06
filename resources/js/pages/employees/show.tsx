import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatLongDateTime } from '@/lib/date';
import PlatformLayout from '@/layouts/platform-layout';
import { Department, EmployeeProfile, User } from '@/types';
import { Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    BadgeCheck,
    Eye,
    FileCheck2,
    GraduationCap,
    KeyRound,
    Shield,
    UserCog,
    UserRound,
    Users,
} from 'lucide-react';

interface ManagerOption {
    id: number;
    name: string;
    email: string;
}

export default function EmployeeShow({
    employee,
    departments,
    managers,
}: {
    employee: EmployeeProfile;
    departments: Department[];
    managers: ManagerOption[];
}) {
    const profileForm = useForm({
        name: employee.user?.name ?? '',
        email: employee.user?.email ?? '',
        status: employee.user?.status ?? employee.status,
        department_id: employee.department_id ? String(employee.department_id) : 'unassigned',
        manager_id: employee.manager_id ? String(employee.manager_id) : 'none',
        job_title: employee.job_title ?? '',
        branch: employee.branch ?? '',
        employee_number: employee.employee_number ?? '',
        phone: employee.phone ?? '',
        alternate_phone: employee.alternate_phone ?? '',
        employment_type: employee.employment_type ?? '',
        start_date: employee.start_date ?? '',
        risk_level: employee.risk_level ?? '',
    });

    const userRecord = employee.user as User | undefined;
    const linkedUserId = userRecord?.id ?? employee.user_id ?? null;
    const primaryRole = userRecord?.roles?.[0]?.name?.replaceAll('_', ' ') ?? 'No role';
    const trainingCompletion = employee.summary?.assigned_courses
        ? Math.round(((employee.summary?.completed_courses ?? 0) / employee.summary.assigned_courses) * 100)
        : 0;
    const canImpersonate = !userRecord?.roles?.some((role) => role.name === 'super_admin');

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title={userRecord?.name ?? 'Employee'}
                    description="Review workforce profile, learning progress, compliance participation, and access posture from a single employee workspace."
                >
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Employee Intelligence Workspace
                    </Badge>
                    {linkedUserId ? (
                        <Button asChild variant="outline">
                            <Link href={route('users.show', linkedUserId)}>
                                <UserCog className="size-4" />
                                Open user account
                            </Link>
                        </Button>
                    ) : null}
                    {canImpersonate && linkedUserId ? (
                        <Button variant="outline" onClick={() => router.post(route('impersonation.start', linkedUserId))}>
                            <Eye className="size-4" />
                            <UserCog className="size-4" />
                            Impersonate User
                        </Button>
                    ) : null}
                </PageHeader>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Training completion" value={`${trainingCompletion}%`} detail={`${employee.summary?.completed_courses ?? 0} of ${employee.summary?.assigned_courses ?? 0} courses completed`} icon={GraduationCap} />
                    <MetricCard label="Assessment best score" value={employee.summary?.best_test_score !== null && employee.summary?.best_test_score !== undefined ? `${employee.summary.best_test_score}%` : 'N/A'} detail={`${employee.summary?.tests_taken ?? 0} attempts recorded`} icon={BadgeCheck} />
                    <MetricCard label="Compliance actions" value={employee.summary?.responses_answered ?? 0} detail={`${employee.summary?.flagged_responses ?? 0} flagged responses requiring attention`} icon={Shield} />
                    <MetricCard label="Evidence uploads" value={employee.summary?.evidence_uploaded ?? 0} detail={`${employee.summary?.overdue_courses ?? 0} overdue course items`} icon={FileCheck2} />
                </section>

                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList className="h-auto w-full justify-start rounded-xl border border-border bg-muted/35 p-1">
                        <TabsTrigger value="profile" className="rounded-lg px-4 py-2.5">Profile</TabsTrigger>
                        <TabsTrigger value="training" className="rounded-lg px-4 py-2.5">Training</TabsTrigger>
                        <TabsTrigger value="assessments" className="rounded-lg px-4 py-2.5">Assessments</TabsTrigger>
                        <TabsTrigger value="compliance" className="rounded-lg px-4 py-2.5">Compliance</TabsTrigger>
                        <TabsTrigger value="access" className="rounded-lg px-4 py-2.5">Access</TabsTrigger>
                        <TabsTrigger value="activity" className="rounded-lg px-4 py-2.5">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Employee profile</CardTitle>
                                    <CardDescription>Update the core employee record, reporting line, role context, and operational contact details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Name" error={profileForm.errors.name}>
                                            <Input value={profileForm.data.name} onChange={(event) => profileForm.setData('name', event.target.value)} />
                                        </Field>
                                        <Field label="Email" error={profileForm.errors.email}>
                                            <Input type="email" value={profileForm.data.email} onChange={(event) => profileForm.setData('email', event.target.value)} />
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Department" error={profileForm.errors.department_id}>
                                            <Select value={profileForm.data.department_id} onValueChange={(value) => profileForm.setData('department_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {departments.map((department) => (
                                                        <SelectItem key={department.id} value={String(department.id)}>
                                                            {department.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field label="Manager" error={profileForm.errors.manager_id}>
                                            <Select value={profileForm.data.manager_id} onValueChange={(value) => profileForm.setData('manager_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select manager" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No manager</SelectItem>
                                                    {managers.filter((manager) => manager.id !== employee.user_id).map((manager) => (
                                                        <SelectItem key={manager.id} value={String(manager.id)}>
                                                            {manager.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Job title" error={profileForm.errors.job_title}>
                                            <Input value={profileForm.data.job_title} onChange={(event) => profileForm.setData('job_title', event.target.value)} />
                                        </Field>
                                        <Field label="Branch" error={profileForm.errors.branch}>
                                            <Input value={profileForm.data.branch} onChange={(event) => profileForm.setData('branch', event.target.value)} />
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Employee number" error={profileForm.errors.employee_number}>
                                            <Input value={profileForm.data.employee_number} onChange={(event) => profileForm.setData('employee_number', event.target.value)} />
                                        </Field>
                                        <Field label="Employment type" error={profileForm.errors.employment_type}>
                                            <Input value={profileForm.data.employment_type} onChange={(event) => profileForm.setData('employment_type', event.target.value)} />
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Primary phone" error={profileForm.errors.phone}>
                                            <Input value={profileForm.data.phone} onChange={(event) => profileForm.setData('phone', event.target.value)} />
                                        </Field>
                                        <Field label="Alternate phone" error={profileForm.errors.alternate_phone}>
                                            <Input value={profileForm.data.alternate_phone} onChange={(event) => profileForm.setData('alternate_phone', event.target.value)} />
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Field label="Start date" error={profileForm.errors.start_date}>
                                            <Input type="date" value={profileForm.data.start_date} onChange={(event) => profileForm.setData('start_date', event.target.value)} />
                                        </Field>
                                        <Field label="Risk level" error={profileForm.errors.risk_level}>
                                            <Select value={profileForm.data.risk_level || 'unscored'} onValueChange={(value) => profileForm.setData('risk_level', value === 'unscored' ? '' : value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select risk level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unscored">Unscored</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field label="Status" error={profileForm.errors.status}>
                                            <Select value={profileForm.data.status} onValueChange={(value) => profileForm.setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="invited">Invited</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            profileForm.transform((data) => ({
                                                ...data,
                                                department_id: data.department_id === 'unassigned' ? null : Number(data.department_id),
                                                manager_id: data.manager_id === 'none' ? null : Number(data.manager_id),
                                            })).patch(route('employees.update', employee.id))
                                        }
                                    >
                                        <UserCog className="size-4" />
                                        Save employee changes
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle>Workforce snapshot</CardTitle>
                                    <CardDescription>Current ownership, reporting line, and access signals for this employee profile.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <SnapshotRow label="Primary role" value={primaryRole} />
                                    <SnapshotRow label="Department" value={employee.department?.name ?? 'Unassigned'} />
                                    <SnapshotRow label="Manager" value={employee.manager?.name ?? 'Not assigned'} />
                                    <SnapshotRow label="Last login" value={formatLongDateTime(userRecord?.last_login_at)} />
                                    <SnapshotRow label="Last password update" value={formatLongDateTime(userRecord?.last_password_changed_at)} />
                                    <SnapshotRow label="Created" value={formatLongDateTime(userRecord?.created_at)} />
                                    <Separator />
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Training progress</span>
                                            <span className="font-medium">{trainingCompletion}%</span>
                                        </div>
                                        <Progress value={trainingCompletion} className="h-2.5" />
                                    </div>
                                    <div className="rounded-xl border border-border/70 bg-background p-4 text-sm">
                                        <p className="font-medium">Direct reports</p>
                                        <p className="mt-1 text-muted-foreground">
                                            {employee.direct_reports?.length ? `${employee.direct_reports.length} people currently report into this employee.` : 'No direct reports are assigned to this employee.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="training" className="space-y-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle>Training assignments</CardTitle>
                                <CardDescription>Assigned courses, completion state, and due-date pressure for this employee.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Assigned</TableHead>
                                            <TableHead>Due date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employee.assignments?.length ? (
                                            employee.assignments.map((assignment) => (
                                                <TableRow key={assignment.id}>
                                                    <TableCell className="font-medium">{assignment.course ?? 'Untitled course'}</TableCell>
                                                    <TableCell><StatusBadge value={assignment.status} /></TableCell>
                                                    <TableCell>{formatLongDateTime(assignment.assigned_at)}</TableCell>
                                                    <TableCell>{formatLongDateTime(assignment.due_date)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <EmptyRow colSpan={4} message="No course assignments are linked to this employee yet." />
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assessments" className="space-y-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle>Assessment performance</CardTitle>
                                <CardDescription>Latest attempts, best performance, and result state for linked tests.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Test</TableHead>
                                            <TableHead>Attempt</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead>Submitted</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employee.test_attempts?.length ? (
                                            employee.test_attempts.map((attempt) => (
                                                <TableRow key={attempt.id}>
                                                    <TableCell className="font-medium">{attempt.test ?? 'Untitled test'}</TableCell>
                                                    <TableCell>Attempt {attempt.attempt_number}</TableCell>
                                                    <TableCell>{attempt.percentage ?? 'N/A'}{attempt.percentage !== null && attempt.percentage !== undefined ? '%' : ''}</TableCell>
                                                    <TableCell><StatusBadge value={attempt.result_status} /></TableCell>
                                                    <TableCell>{formatLongDateTime(attempt.submitted_at)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <EmptyRow colSpan={5} message="This employee has not completed any test attempts yet." />
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-4">
                        <div className="grid gap-6 xl:grid-cols-2">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Responses</CardTitle>
                                    <CardDescription>Compliance questions this employee has answered across active submissions.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Question</TableHead>
                                                <TableHead>Framework</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Score</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employee.compliance?.responses?.length ? (
                                                employee.compliance.responses.map((response) => (
                                                    <TableRow key={response.id}>
                                                        <TableCell className="max-w-[280px] truncate font-medium">{response.question ?? 'Untitled question'}</TableCell>
                                                        <TableCell>{response.framework ?? 'Unknown framework'}</TableCell>
                                                        <TableCell><StatusBadge value={response.status} /></TableCell>
                                                        <TableCell>{response.response_score ?? 'N/A'}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <EmptyRow colSpan={4} message="No compliance responses have been recorded for this employee." />
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Evidence and reviews</CardTitle>
                                    <CardDescription>Files uploaded by this employee and reviewer actions where applicable.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Uploads</p>
                                        {employee.compliance?.evidence_uploads?.length ? (
                                            employee.compliance.evidence_uploads.slice(0, 5).map((file) => (
                                                <div key={file.id} className="rounded-xl border border-border/70 bg-background p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium">{file.original_name}</p>
                                                            <p className="text-sm text-muted-foreground">{file.framework ?? 'Unknown framework'}</p>
                                                        </div>
                                                        <StatusBadge value={file.review_status} />
                                                    </div>
                                                    <p className="mt-2 text-xs text-muted-foreground">{formatLongDateTime(file.uploaded_at)}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No evidence uploads are linked to this employee.</p>
                                        )}
                                    </div>
                                    <Separator />
                                    <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reviewer actions</p>
                                        {employee.compliance?.review_activity?.length ? (
                                            employee.compliance.review_activity.slice(0, 4).map((review) => (
                                                <div key={review.id} className="rounded-xl border border-border/70 bg-background p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium">{review.file ?? 'Evidence item'}</p>
                                                            <p className="text-sm text-muted-foreground">{review.review_comment ?? 'No reviewer comment recorded.'}</p>
                                                        </div>
                                                        <StatusBadge value={review.review_status} />
                                                    </div>
                                                    <p className="mt-2 text-xs text-muted-foreground">{formatLongDateTime(review.reviewed_at)}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No reviewer activity is associated with this employee.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="access" className="space-y-4">
                        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Access overview</CardTitle>
                                    <CardDescription>Identity and access details are managed through the linked user account.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <SnapshotRow label="Primary role" value={primaryRole} />
                                    <SnapshotRow label="Permissions" value={`${userRecord?.permissions?.length ?? 0} direct permissions`} />
                                    <SnapshotRow label="Tenant access" value={userRecord?.tenant?.name ?? 'Platform'} />
                                    <SnapshotRow label="Last login" value={formatLongDateTime(userRecord?.last_login_at)} />
                                    <SnapshotRow label="Password changed" value={formatLongDateTime(userRecord?.last_password_changed_at)} />
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle>Support actions</CardTitle>
                                    <CardDescription>Jump directly into the full user management workspace or perform guided support actions.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ActionRow
                                        icon={UserCog}
                                        title="Open user account"
                                        description="Manage password, roles, direct permissions, and tenant assignment from the cross-tenant user workspace."
                                        action={
                                            linkedUserId ? (
                                                <Button asChild variant="outline">
                                                    <Link href={route('users.show', linkedUserId)}>
                                                        <UserCog className="size-4" />
                                                        Open account
                                                    </Link>
                                                </Button>
                                            ) : null
                                        }
                                    />
                                    <Separator />
                                    <ActionRow
                                        icon={KeyRound}
                                        title="Password and permissions"
                                        description="Use the user account page when you need to reset credentials or alter access policy for this employee."
                                    />
                                    <Separator />
                                    <ActionRow
                                        icon={Eye}
                                        title="Impersonation"
                                        description="Start an impersonation session to validate the employee experience and permission surface."
                                        action={
                                            canImpersonate && linkedUserId ? (
                                                <Button variant="outline" onClick={() => router.post(route('impersonation.start', linkedUserId))}>
                                                    <Eye className="size-4" />
                                                    <UserCog className="size-4" />
                                                    Start session
                                                </Button>
                                            ) : null
                                        }
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle>Recent activity</CardTitle>
                                <CardDescription>Latest auditable platform events associated with this employee account.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {employee.activity?.length ? (
                                    employee.activity.map((entry) => (
                                        <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background p-4">
                                            <div className="rounded-lg border border-border/70 bg-muted/35 p-2.5">
                                                <Activity className="size-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium">{entry.action}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {entry.entity_type} • {formatLongDateTime(entry.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No recent audit trail entries are available for this employee.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformLayout>
    );
}

function MetricCard({
    label,
    value,
    detail,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    detail: string;
    icon: typeof Users;
}) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    <p className="text-sm text-muted-foreground">{detail}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/35 p-3">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background p-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function ActionRow({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: typeof UserRound;
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
                <div className="rounded-xl border border-border/70 bg-background p-2.5">
                    <Icon className="size-4" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
            </div>
            {action}
        </div>
    );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-muted-foreground">
                {message}
            </TableCell>
        </TableRow>
    );
}
