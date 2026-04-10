import {
    ActivityItem,
    BreakdownItem,
    DashboardActionCard,
    DashboardActivityFeed,
    DashboardBreakdownCard,
    DashboardInlineScore,
    DashboardMetricCard,
    DashboardQuickStat,
    DashboardRingCard,
    DashboardTrendChart,
    TrendSeriesPoint,
} from '@/components/dashboard-kit';
import PendingItemsPanel from '@/components/pending-items-panel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformLayout from '@/layouts/platform-layout';
import { type BreadcrumbItem, type PendingItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    AlarmClock,
    BookOpenCheck,
    Building2,
    ClipboardList,
    FileSearch,
    GraduationCap,
    ShieldAlert,
    ShieldCheck,
    Timer,
    UserRoundPlus,
    Users,
    Waypoints,
} from 'lucide-react';

interface CompanyAdminDashboardProps {
    hero: {
        score: number;
        rating: string;
        activeSubmissions: number;
        pendingEvidence: number;
        overdueTraining: number;
    };
    stats: {
        employees: number;
        activeAssignments: number;
        courseCompletionRate: number;
        averageTestScore: number;
        activeSubmissions: number;
        pendingEvidence: number;
    };
    kpis: {
        compliance: { score: number; rating: string; updated_at?: string | null };
        overdueAssignments: { count: number; total: number; percentage: number };
        evidenceBacklog: { pending: number; total: number; percentage: number; reviewed_last_30_days: number };
        avgReviewTime: { seconds: number; hours: number; human: string };
    };
    employeeStatusBreakdown: BreakdownItem[];
    submissionStatusBreakdown: BreakdownItem[];
    sectionScores: BreakdownItem[];
    monthlyTrend: TrendSeriesPoint[];
    latestSubmissions: Array<{
        id: number;
        title: string;
        framework?: string | null;
        status: string;
        score: number;
        submitted_at?: string | null;
    }>;
    recentTestOutcomes: Array<{
        id: number;
        employee: string;
        test: string;
        percentage: number;
        result_status: string;
        submitted_at?: string | null;
    }>;
    departmentHealth: Array<{
        id: number;
        name: string;
        employee_count: number;
        completion_rate: number;
        overdue_assignments: number;
    }>;
    peopleSnapshot: Array<{
        id: number;
        name: string;
        department: string;
        risk_level: string;
        overdue_assignments: number;
        last_login_at: string;
    }>;
    operations: {
        pendingInvitations: number;
        upcomingDeadlines: Array<{
            id: number;
            title: string;
            owner: string;
            status: string;
            due_date?: string | null;
        }>;
    };
    recentActivity: ActivityItem[];
    pendingItems: PendingItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function CompanyAdminDashboard(props: CompanyAdminDashboardProps) {
    const metricCards = [
        {
            label: 'Employees',
            value: props.stats.employees,
            detail: 'People currently operating inside your tenant workspace.',
            icon: <Users className="size-4" />,
        },
        {
            label: 'Active assignments',
            value: props.stats.activeAssignments,
            detail: 'Assignments that are assigned or currently in progress.',
            icon: <BookOpenCheck className="size-4" />,
        },
        {
            label: 'Course completion',
            value: `${Math.round(props.stats.courseCompletionRate)}%`,
            detail: 'Share of training assignments already completed.',
            icon: <GraduationCap className="size-4" />,
        },
        {
            label: 'Average test score',
            value: `${Math.round(props.stats.averageTestScore)}%`,
            detail: 'Average assessment performance across your workforce.',
            icon: <ClipboardList className="size-4" />,
            donutValue: props.stats.averageTestScore,
        },
        {
            label: 'Active submissions',
            value: props.stats.activeSubmissions,
            detail: 'Submissions currently submitted or under review.',
            icon: <ShieldCheck className="size-4" />,
        },
        {
            label: 'Evidence queue',
            value: props.stats.pendingEvidence,
            detail: 'Evidence files waiting for a reviewer decision.',
            icon: <FileSearch className="size-4" />,
        },
    ];

    return (
        <PlatformLayout breadcrumbs={breadcrumbs}>
            <Head title="Company Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
                    <Card className="border-border/70 bg-card shadow-none">
                        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
                                    Tenant operations cockpit
                                </Badge>
                                <div className="space-y-2">
                                    <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">Company operations overview</CardTitle>
                                    <CardDescription className="max-w-2xl text-sm leading-6">
                                        Track compliance posture, training completion, workforce readiness, and deadlines from a single monochrome
                                        command surface for your company.
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <DashboardQuickStat
                                    title="Compliance score"
                                    value={`${Math.round(props.hero.score)}%`}
                                    hint={props.hero.rating}
                                    donutValue={props.hero.score}
                                />
                                <DashboardQuickStat
                                    title="Pending invitations"
                                    value={`${props.operations.pendingInvitations}`}
                                    hint="Invites still waiting to be accepted"
                                />
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-border/70 bg-muted/30 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Immediate focus</CardTitle>
                            <CardDescription>Operational signals that need company-admin attention first.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <QuickQueue label="Active submissions" value={props.hero.activeSubmissions} />
                            <QuickQueue label="Evidence waiting review" value={props.hero.pendingEvidence} />
                            <QuickQueue label="Overdue training items" value={props.hero.overdueTraining} />
                            <QuickQueue label="Pending invitations" value={props.operations.pendingInvitations} />
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        icon={ShieldCheck}
                        label="Compliance %"
                        value={`${Math.round(props.kpis.compliance.score)}%`}
                        hint={props.kpis.compliance.rating}
                        accent={props.kpis.compliance.score >= 80 ? 'emerald' : props.kpis.compliance.score >= 50 ? 'amber' : 'rose'}
                        donutValue={props.kpis.compliance.score}
                    />
                    <KpiCard
                        icon={AlarmClock}
                        label="Overdue assignments"
                        value={`${props.kpis.overdueAssignments.count}`}
                        hint={`${props.kpis.overdueAssignments.percentage}% of ${props.kpis.overdueAssignments.total} total`}
                        accent="rose"
                    />
                    <KpiCard
                        icon={ShieldAlert}
                        label="Evidence backlog"
                        value={`${props.kpis.evidenceBacklog.pending}`}
                        hint={`${props.kpis.evidenceBacklog.reviewed_last_30_days} reviewed last 30d`}
                        accent="amber"
                    />
                    <KpiCard
                        icon={Timer}
                        label="Avg review time"
                        value={props.kpis.avgReviewTime.human}
                        hint="Upload → review decision"
                        accent="brand"
                    />
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {metricCards.map((item) => (
                        <DashboardMetricCard key={item.label} {...item} />
                    ))}
                </section>

                <PendingItemsPanel items={props.pendingItems} />

                <Tabs defaultValue="operations" className="space-y-4">
                    <TabsList className="h-auto w-full justify-start rounded-lg border border-border bg-muted/40 p-1">
                        <TabsTrigger value="operations" className="rounded-md px-4 py-2">
                            Operations
                        </TabsTrigger>
                        <TabsTrigger value="compliance" className="rounded-md px-4 py-2">
                            Compliance
                        </TabsTrigger>
                        <TabsTrigger value="training" className="rounded-md px-4 py-2">
                            Training
                        </TabsTrigger>
                        <TabsTrigger value="people" className="rounded-md px-4 py-2">
                            People
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="operations" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
                            <DashboardTrendChart
                                title="Operational throughput"
                                description="Six-month view of completed assignments, submitted tests, and compliance cycle activity."
                                points={props.monthlyTrend}
                                legends={[
                                    { label: 'Completed assignments', tone: 'bg-primary' },
                                    { label: 'Test attempts', tone: 'bg-primary/70' },
                                    { label: 'Submissions', tone: 'bg-primary/40' },
                                ]}
                            />
                            <DashboardActivityFeed
                                title="Recent tenant activity"
                                description="Latest administrative and compliance events across your workspace."
                                items={props.recentActivity}
                                emptyMessage="No recent tenant activity has been recorded yet."
                            />
                        </section>

                        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Upcoming due dates</CardTitle>
                                    <CardDescription>Assignments already approaching their training deadlines.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Assignment</TableHead>
                                                <TableHead>Owner</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Due</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.operations.upcomingDeadlines.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.title}</TableCell>
                                                    <TableCell>{item.owner}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {item.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">{item.due_date ?? 'No due date'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <div className="grid gap-4">
                                <DashboardActionCard
                                    title="New submission"
                                    description="Open the next compliance assessment cycle for your tenant."
                                    href="/submissions/create"
                                    icon={<ShieldCheck className="size-4" />}
                                />
                                <DashboardActionCard
                                    title="Invite employee"
                                    description="Bring more users into the workspace with the right role and department."
                                    href="/invitations/create"
                                    icon={<UserRoundPlus className="size-4" />}
                                />
                                <DashboardActionCard
                                    title="Assign training"
                                    description="Push the next wave of courses to employees who still need coverage."
                                    href="/assignments/create"
                                    icon={<BookOpenCheck className="size-4" />}
                                />
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                            <DashboardRingCard
                                title="Compliance posture"
                                description="Latest scored submission and the strongest or weakest sections underneath it."
                                value={props.hero.score}
                                subtitle={props.hero.rating}
                                items={props.sectionScores}
                            />
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Latest submissions</CardTitle>
                                    <CardDescription>Recent compliance cycles with status and scoring context.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Submission</TableHead>
                                                <TableHead>Framework</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Score</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.latestSubmissions.map((submission) => (
                                                <TableRow key={submission.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{submission.title}</div>
                                                            <div className="text-xs text-muted-foreground">{submission.submitted_at ?? 'Recently updated'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{submission.framework ?? 'Framework'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {submission.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DashboardInlineScore value={submission.score} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid gap-4 md:grid-cols-2">
                            <DashboardBreakdownCard
                                title="Employee status mix"
                                description="How your tenant workforce is distributed by access status."
                                items={props.employeeStatusBreakdown}
                                icon={<Users className="size-4" />}
                            />
                            <DashboardBreakdownCard
                                title="Submission state mix"
                                description="How compliance work is currently moving through the workflow."
                                items={props.submissionStatusBreakdown}
                                icon={<ShieldCheck className="size-4" />}
                            />
                        </section>
                    </TabsContent>

                    <TabsContent value="training" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Recent test outcomes</CardTitle>
                                    <CardDescription>Latest assessment activity across your employees.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Employee</TableHead>
                                                <TableHead>Assessment</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Score</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.recentTestOutcomes.map((attempt) => (
                                                <TableRow key={attempt.id}>
                                                    <TableCell className="font-medium">{attempt.employee}</TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div>{attempt.test}</div>
                                                            <div className="text-xs text-muted-foreground">{attempt.submitted_at ?? 'Recently submitted'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {attempt.result_status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DashboardInlineScore value={attempt.percentage} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Department training health</CardTitle>
                                    <CardDescription>Completion and overdue pressure across your departments.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {props.departmentHealth.map((department) => (
                                        <div key={department.id} className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-medium">{department.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {department.employee_count} employees · {department.overdue_assignments} overdue
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium tabular-nums">{Math.round(department.completion_rate)}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted">
                                                <div className="h-2 rounded-full bg-foreground" style={{ width: `${department.completion_rate}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </section>
                    </TabsContent>

                    <TabsContent value="people" className="space-y-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-base font-medium">People attention list</CardTitle>
                                        <CardDescription>Employees with elevated risk or overdue training pressure.</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="rounded-full">
                                        <Waypoints className="mr-1 size-3.5" />
                                        Workforce watchlist
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Risk</TableHead>
                                            <TableHead className="text-right">Overdue</TableHead>
                                            <TableHead className="text-right">Last login</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {props.peopleSnapshot.map((person) => (
                                            <TableRow key={person.id}>
                                                <TableCell className="font-medium">{person.name}</TableCell>
                                                <TableCell>{person.department}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {person.risk_level}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">{person.overdue_assignments}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{person.last_login_at}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <section className="grid gap-4 md:grid-cols-3">
                            <DashboardActionCard
                                title="Open departments"
                                description="Inspect workforce structure and balance ownership across teams."
                                href="/departments"
                                icon={<Building2 className="size-4" />}
                            />
                            <DashboardActionCard
                                title="Open employees"
                                description="Review the employee directory, risk, and training readiness."
                                href="/employees"
                                icon={<Users className="size-4" />}
                            />
                            <DashboardActionCard
                                title="Review evidence queue"
                                description="Jump directly into uploaded evidence waiting for reviewer decisions."
                                href="/evidence"
                                icon={<FileSearch className="size-4" />}
                            />
                        </section>
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformLayout>
    );
}

function QuickQueue({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/80 px-4 py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-xl font-semibold tabular-nums">{value}</span>
        </div>
    );
}

function KpiCard({
    icon: Icon,
    label,
    value,
    hint,
    accent,
    donutValue,
}: {
    icon: typeof ShieldCheck;
    label: string;
    value: string;
    hint?: string;
    accent: 'emerald' | 'amber' | 'rose' | 'brand';
    donutValue?: number;
}) {
    const accentMap: Record<string, string> = {
        emerald: 'text-emerald-600 dark:text-emerald-400',
        amber: 'text-amber-600 dark:text-amber-400',
        rose: 'text-rose-600 dark:text-rose-400',
        brand: 'text-primary',
    };

    return (
        <Card className="border-border/70 bg-card shadow-none">
            <CardContent className="flex items-start gap-4 p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted ${accentMap[accent]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
                    {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
                </div>
                {donutValue !== undefined && (
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                        <svg width="56" height="56" className="-rotate-90">
                            <circle cx="28" cy="28" r={22} stroke="currentColor" strokeWidth={5} fill="none" className="text-border" />
                            <circle
                                cx="28"
                                cy="28"
                                r={22}
                                stroke="currentColor"
                                strokeWidth={5}
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 22}
                                strokeDashoffset={2 * Math.PI * 22 - (Math.max(0, Math.min(100, donutValue)) / 100) * 2 * Math.PI * 22}
                                className={accentMap[accent]}
                            />
                        </svg>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
