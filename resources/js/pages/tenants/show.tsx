import { RowActionsMenu } from '@/components/row-actions-menu';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { formatLongDateTime } from '@/lib/date';
import { SharedData, Tenant } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, BarChart3, Building2, CheckCircle2, FolderKanban, Mail, Phone, PieChart, ShieldCheck, Users2 } from 'lucide-react';

interface TenantUser {
    id: number;
    name: string;
    email: string;
    status?: string;
    roles?: Array<{ id: number; name: string }>;
    employee_profile?: {
        job_title?: string | null;
        branch?: string | null;
        department?: { id: number; name: string } | null;
    } | null;
}

interface TenantDepartment {
    id: number;
    name: string;
    status?: string;
    employee_profiles_count?: number;
}

interface RecentSubmission {
    id: number;
    title: string;
    status: string;
    framework?: string | null;
    reporting_period?: string | null;
    submitted_at?: string | null;
    score?: number | null;
    rating?: string | null;
}

interface TenantShowData extends Tenant {
    users?: TenantUser[];
    departments?: TenantDepartment[];
}

export default function TenantShow({
    tenant,
    stats,
    compliance,
    roleMix,
    recentSubmissions,
}: {
    tenant: TenantShowData;
    stats: {
        users: number;
        activeUsers: number;
        invitedUsers: number;
        departments: number;
        submissions: number;
        submittedSubmissions: number;
        scoredSubmissions: number;
        averageScore?: number | null;
        latestScore?: number | null;
        latestRating?: string | null;
        pendingEvidence: number;
        approvedEvidence: number;
        rejectedEvidence: number;
    };
    compliance: {
        score?: number | null;
        rating?: string | null;
        calculated_at?: string | null;
        sections: Array<{ id: number; name?: string | null; score: number; rating?: string | null }>;
    };
    roleMix: {
        company_admin: number;
        reviewer: number;
        employee: number;
    };
    recentSubmissions: RecentSubmission[];
}) {
    const { auth } = usePage<SharedData>().props;
    const canImpersonate = auth.permissions.includes('impersonate users');
    const donutScore = Math.max(0, Math.min(100, Math.round(Number(compliance.score ?? 0))));

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title={tenant.name}
                    description="Tenant command view with workspace metadata, compliance health, department structure, and user access."
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge value={tenant.status} />
                        <Button variant="outline" asChild>
                            <Link href={route('tenants.edit', tenant.id)}>Edit tenant</Link>
                        </Button>
                    </div>
                </PageHeader>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard title="Workspace users" value={String(stats.users)} detail={`${stats.activeUsers} active · ${stats.invitedUsers} invited`} icon={Users2} />
                    <MetricCard title="Departments" value={String(stats.departments)} detail={`${tenant.departments?.length ?? 0} currently configured`} icon={Building2} />
                    <MetricCard title="Compliance submissions" value={String(stats.submissions)} detail={`${stats.scoredSubmissions} scored · ${stats.submittedSubmissions} submitted`} icon={FolderKanban} />
                    <MetricCard
                        title="Average compliance"
                        value={stats.averageScore !== null && stats.averageScore !== undefined ? `${stats.averageScore}%` : 'Pending'}
                        detail={stats.latestRating ?? 'No rating available yet'}
                        icon={BarChart3}
                    />
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle>Tenant profile</CardTitle>
                            <CardDescription>Core company data, contact ownership, and workspace footprint.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4 text-sm">
                                <InfoRow label="Registration number" value={tenant.registration_number ?? 'Not set'} />
                                <InfoRow label="Industry" value={tenant.industry ?? 'Not set'} />
                                <InfoRow label="Company size" value={tenant.company_size ?? 'Not set'} />
                                <InfoRow label="Contact person" value={tenant.contact_name ?? 'Not set'} />
                                <InfoRow label="Contact email" value={tenant.contact_email ?? 'Not set'} icon={Mail} />
                                <InfoRow label="Contact phone" value={tenant.contact_phone ?? 'Not set'} icon={Phone} />
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-muted/15 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Compliance posture</p>
                                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                                            {compliance.score !== null && compliance.score !== undefined ? `${Math.round(compliance.score)}%` : 'Pending'}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {compliance.rating ?? 'No rating yet'}
                                            {compliance.calculated_at ? ` · ${formatLongDateTime(compliance.calculated_at)}` : ''}
                                        </p>
                                    </div>
                                    <DonutScore value={donutScore} />
                                </div>

                                <div className="mt-5 space-y-3">
                                    {compliance.sections.length > 0 ? (
                                        compliance.sections.slice(0, 4).map((section) => (
                                            <div key={section.id} className="space-y-2">
                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                    <span>{section.name ?? 'Section'}</span>
                                                    <span className="font-medium">{Math.round(section.score)}%</span>
                                                </div>
                                                <Progress value={section.score} className="h-2 bg-muted/45" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                                            No section score breakdown is available for this tenant yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 bg-muted/15 shadow-none">
                        <CardHeader>
                            <CardTitle>Operational health</CardTitle>
                            <CardDescription>Evidence review load and role distribution inside the workspace.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <HealthRow label="Pending evidence" value={stats.pendingEvidence} icon={AlertCircle} />
                            <HealthRow label="Approved evidence" value={stats.approvedEvidence} icon={CheckCircle2} />
                            <HealthRow label="Rejected evidence" value={stats.rejectedEvidence} icon={AlertCircle} />

                            <div className="rounded-xl border border-border/70 bg-background p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                    <ShieldCheck className="size-4" />
                                    Role mix
                                </div>
                                <div className="space-y-3 text-sm">
                                    <RoleRow label="Company admins" value={roleMix.company_admin} />
                                    <RoleRow label="Reviewers" value={roleMix.reviewer} />
                                    <RoleRow label="Employees" value={roleMix.employee} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle>Departments</CardTitle>
                            <CardDescription>Department footprint and staffing distribution inside the tenant.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(tenant.departments ?? []).map((department) => (
                                <div key={department.id} className="rounded-xl border border-border/70 bg-muted/15 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">{department.name}</p>
                                            <p className="text-sm text-muted-foreground">{department.employee_profiles_count ?? 0} linked employees</p>
                                        </div>
                                        <StatusBadge value={department.status ?? 'active'} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle>Recent submissions</CardTitle>
                            <CardDescription>Latest compliance cycles and the most recent score context for the tenant.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Submission</TableHead>
                                        <TableHead>Framework</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentSubmissions.length > 0 ? (
                                        recentSubmissions.map((submission) => (
                                            <TableRow key={submission.id}>
                                                <TableCell>
                                                    <div className="font-medium">{submission.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {submission.reporting_period ?? 'No reporting period'}
                                                        {submission.submitted_at ? ` · ${formatLongDateTime(submission.submitted_at)}` : ''}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{submission.framework ?? 'N/A'}</TableCell>
                                                <TableCell>
                                                    <StatusBadge value={submission.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{submission.score !== null && submission.score !== undefined ? `${Math.round(submission.score)}%` : 'Pending'}</div>
                                                    <div className="text-sm text-muted-foreground">{submission.rating ?? 'Not rated'}</div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                                                No compliance submissions have been created for this tenant yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/70 shadow-none">
                    <CardHeader>
                        <CardTitle>Workspace members</CardTitle>
                        <CardDescription>Users, departments, and support actions available inside the tenant workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[70px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenant.users?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                            {user.employee_profile?.job_title ? (
                                                <div className="text-xs text-muted-foreground">{user.employee_profile.job_title}</div>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>{user.employee_profile?.department?.name ?? 'Unassigned'}</TableCell>
                                        <TableCell>{user.roles?.[0]?.name?.replace('_', ' ') ?? 'No role'}</TableCell>
                                        <TableCell>
                                            <StatusBadge value={user.status ?? 'active'} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <RowActionsMenu
                                                actions={[
                                                    { label: 'View user', href: route('users.show', user.id) },
                                                    ...(canImpersonate ? [{ label: 'Impersonate User', href: route('impersonation.start', user.id), method: 'post' as const }] : []),
                                                ]}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PlatformLayout>
    );
}

function MetricCard({
    title,
    value,
    detail,
    icon: Icon,
}: {
    title: string;
    value: string;
    detail: string;
    icon: typeof Users2;
}) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    <p className="text-sm text-muted-foreground">{detail}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/35 p-2.5">
                    <Icon className="size-4" />
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon?: typeof Mail;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="flex items-center gap-2 text-right font-medium">
                {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
                {value}
            </span>
        </div>
    );
}

function HealthRow({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof AlertCircle;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="rounded-lg border border-border/70 bg-muted/25 p-2">
                    <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-lg font-semibold">{value}</span>
        </div>
    );
}

function RoleRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <span className="font-medium">{value}</span>
            </div>
            <Progress value={Math.min(100, value * 25)} className="h-2 bg-muted/45" />
        </div>
    );
}

function DonutScore({ value }: { value: number }) {
    return (
        <div className="relative grid size-32 place-items-center rounded-full border border-border/70 bg-muted/20">
            <div
                className="absolute inset-2 rounded-full"
                style={{
                    background: `conic-gradient(hsl(var(--foreground)) ${value * 3.6}deg, hsl(var(--muted)) 0deg)`,
                }}
            />
            <div className="absolute inset-5 rounded-full bg-background" />
            <div className="relative z-10 flex flex-col items-center">
                <PieChart className="size-4 text-muted-foreground" />
                <span className="mt-1 text-2xl font-semibold">{value}%</span>
            </div>
        </div>
    );
}
