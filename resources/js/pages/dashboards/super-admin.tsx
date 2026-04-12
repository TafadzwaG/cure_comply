import PendingItemsPanel from '@/components/pending-items-panel';
import { DashboardInlineScore } from '@/components/dashboard-kit';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformLayout from '@/layouts/platform-layout';
import { type BreadcrumbItem, type PendingItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BellRing,
    Building2,
    CheckCheck,
    CircleAlert,
    ClipboardCheck,
    FileSearch,
    Shield,
    TrendingUp,
    Users,
} from 'lucide-react';

interface MetricCard {
    label: string;
    value: number;
    detail: string;
    icon: typeof Building2;
}

interface BreakdownItem {
    label: string;
    value: number;
}

interface TrendPoint {
    label: string;
    tenants: number;
    users: number;
    submissions: number;
}

interface TopTenant {
    id: number;
    name: string;
    status: string;
    industry?: string | null;
    users_count: number;
    submissions_count: number;
    open_submissions_count: number;
    pending_evidence_count: number;
    average_score: number;
}

interface ActivityItem {
    id: number;
    action: string;
    entity_type: string;
    tenant: string;
    user: string;
    created_at: string;
}

interface AttentionItem {
    title: string;
    value: number;
    description: string;
}

interface Props {
    stats: {
        tenantCount: number;
        activeTenants: number;
        pendingTenants: number;
        suspendedTenants: number;
        activeUsers: number;
        openSubmissions: number;
        pendingEvidence: number;
        averageComplianceScore: number;
        greenRate: number;
    };
    tenantStatusBreakdown: BreakdownItem[];
    userRoleBreakdown: BreakdownItem[];
    submissionStatusBreakdown: BreakdownItem[];
    evidenceStatusBreakdown: BreakdownItem[];
    scoreDistribution: BreakdownItem[];
    monthlyTrend: TrendPoint[];
    topTenants: TopTenant[];
    recentActivity: ActivityItem[];
    attentionItems: AttentionItem[];
    pendingItems: PendingItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function SuperAdminDashboard(props: Props) {
    const { stats } = props;

    const metricCards: MetricCard[] = [
        {
            label: 'Registered Tenants',
            value: stats.tenantCount,
            detail: `${stats.activeTenants} active companies currently on the platform`,
            icon: Building2,
        },
        {
            label: 'Active Users',
            value: stats.activeUsers,
            detail: 'Enabled identities with access to platform workflows',
            icon: Users,
        },
        {
            label: 'Open Submission Queue',
            value: stats.openSubmissions,
            detail: 'Submitted and in-review compliance submissions',
            icon: ClipboardCheck,
        },
        {
            label: 'Pending Evidence',
            value: stats.pendingEvidence,
            detail: 'Evidence files waiting for reviewer decisions',
            icon: FileSearch,
        },
    ];

    return (
        <PlatformLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
                    <Card className="border-border/70 bg-card shadow-none">
                        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary">
                                    Platform command center
                                </Badge>
                                <div className="space-y-2">
                                    <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">Super Admin Overview</CardTitle>
                                    <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Monitor tenant growth, operational bottlenecks, evidence review queues, and compliance quality from one
                                        monochrome control surface.
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <QuickStat
                                    title="Average score"
                                    value={`${stats.averageComplianceScore}%`}
                                    hint="Across scored submissions"
                                    donutValue={stats.averageComplianceScore}
                                />
                                <QuickStat
                                    title="Green rating share"
                                    value={`${stats.greenRate}%`}
                                    hint="Tenants landing in strong posture"
                                    donutValue={stats.greenRate}
                                />
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-border/70 bg-muted/30 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Attention Queue</CardTitle>
                            <CardDescription className="text-muted-foreground">Fast operational signals that need platform action first.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {props.attentionItems.map((item) => (
                                <div key={item.title} className="space-y-2 rounded-lg border border-border/70 bg-background/80 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium">{item.title}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                        <span className="text-2xl font-semibold tabular-nums">{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Card key={item.label} className="border-border/70 bg-card shadow-none">
                                <CardHeader className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{item.label}</span>
                                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                            <Icon className="size-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-semibold tracking-tight tabular-nums">{item.value}</div>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </section>

                <PendingItemsPanel items={props.pendingItems} />

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="overview">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="compliance">
                            Compliance
                        </TabsTrigger>
                        <TabsTrigger value="operations">
                            Operations
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-base font-medium">Platform Growth</CardTitle>
                                            <CardDescription>Six-month trend across tenant acquisition, identity growth, and submission volume.</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="rounded-full">
                                            <TrendingUp className="mr-1 size-3.5" />
                                            Rolling 6 months
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <TrendChart points={props.monthlyTrend} />
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <LegendItem label="Tenants" value={sumTrend(props.monthlyTrend, 'tenants')} />
                                        <LegendItem label="Users" value={sumTrend(props.monthlyTrend, 'users')} />
                                        <LegendItem label="Submissions" value={sumTrend(props.monthlyTrend, 'submissions')} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Tenant Status Mix</CardTitle>
                                    <CardDescription>Distribution of tenant lifecycle states across the platform.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <MetricList items={props.tenantStatusBreakdown} />
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr_1fr]">
                            <BreakdownCard
                                title="Role coverage"
                                description="How platform access is distributed by role."
                                items={props.userRoleBreakdown}
                                icon={<Users className="size-4" />}
                            />
                            <BreakdownCard
                                title="Submission states"
                                description="Current flow status for compliance submissions."
                                items={props.submissionStatusBreakdown}
                                icon={<Shield className="size-4" />}
                            />
                            <BreakdownCard
                                title="Evidence decisions"
                                description="Reviewer outcomes and remaining queue pressure."
                                items={props.evidenceStatusBreakdown}
                                icon={<CheckCheck className="size-4" />}
                            />
                        </section>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Rating Distribution</CardTitle>
                                    <CardDescription>Count of scored submissions by compliance band.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {props.scoreDistribution.map((item) => (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{item.label}</span>
                                                <span className="tabular-nums text-muted-foreground">{item.value}</span>
                                            </div>
                                            <Progress className="h-2 bg-muted" value={toPercent(item.value, props.scoreDistribution)} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-base font-medium">Tenant Compliance Health</CardTitle>
                                            <CardDescription>Highest-volume tenant workspaces ranked with score and queue context.</CardDescription>
                                        </div>
                                        <Link
                                            href="/tenants"
                                            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            View tenants
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tenant</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Users</TableHead>
                                                <TableHead className="text-right">Submissions</TableHead>
                                                <TableHead className="text-right">Queue</TableHead>
                                                <TableHead className="text-right">Avg. score</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.topTenants.map((tenant) => (
                                                <TableRow key={tenant.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{tenant.name}</div>
                                                            <div className="text-xs text-muted-foreground">{tenant.industry || 'Unspecified industry'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="rounded-full capitalize">
                                                            {tenant.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">{tenant.users_count}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{tenant.submissions_count}</TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {tenant.open_submissions_count + tenant.pending_evidence_count}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DashboardInlineScore value={tenant.average_score} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </section>
                    </TabsContent>

                    <TabsContent value="operations" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.45fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Queue Priorities</CardTitle>
                                    <CardDescription>Operational categories ranked by immediate review pressure.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <QueueCard label="Tenant approvals" value={stats.pendingTenants} icon={<Building2 className="size-4" />} />
                                    <QueueCard label="Open submissions" value={stats.openSubmissions} icon={<Shield className="size-4" />} />
                                    <QueueCard label="Evidence backlog" value={stats.pendingEvidence} icon={<FileSearch className="size-4" />} />
                                    <QueueCard label="Suspended tenants" value={stats.suspendedTenants} icon={<CircleAlert className="size-4" />} />
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-base font-medium">Recent Audit Activity</CardTitle>
                                            <CardDescription>Latest support, review, and administrative events recorded by the platform.</CardDescription>
                                        </div>
                                        <Link
                                            href="/audit-logs"
                                            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Full log
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {props.recentActivity.map((activity, index) => (
                                        <div key={activity.id}>
                                            <div className="flex items-start gap-3 py-1">
                                                <div className="mt-0.5 rounded-md border border-border/70 p-2 text-muted-foreground">
                                                    <Activity className="size-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-medium">{activity.action}</p>
                                                        <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                                                            {activity.entity_type}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        {activity.user} in {activity.tenant}
                                                    </p>
                                                </div>
                                                <div className="whitespace-nowrap text-xs text-muted-foreground">{activity.created_at}</div>
                                            </div>
                                            {index < props.recentActivity.length - 1 && <Separator />}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <ActionCard
                                title="Review tenant approvals"
                                description="Move pending companies into active onboarding faster."
                                href="/tenants"
                                icon={<Building2 className="size-4" />}
                            />
                            <ActionCard
                                title="Inspect evidence queue"
                                description="Jump into the reviewer backlog and resolve pending file decisions."
                                href="/evidence"
                                icon={<BellRing className="size-4" />}
                            />
                            <ActionCard
                                title="Open reporting"
                                description="Validate exportable training, test, and compliance summaries."
                                href="/reports"
                                icon={<ClipboardCheck className="size-4" />}
                            />
                        </section>
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformLayout>
    );
}

function QuickStat({
    title,
    value,
    hint,
    donutValue,
}: {
    title: string;
    value: string;
    hint: string;
    donutValue?: number;
}) {
    return (
        <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                </div>
                {typeof donutValue === 'number' ? <DashboardInlineScore value={donutValue} size="sm" /> : null}
            </div>
        </div>
    );
}

function LegendItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
            <div className="mt-2 text-xl font-semibold tabular-nums">{value}</div>
        </div>
    );
}

function MetricList({ items }: { items: BreakdownItem[] }) {
    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="tabular-nums text-muted-foreground">{item.value}</span>
                    </div>
                    <Progress className="h-2 bg-muted" value={(item.value / total) * 100} />
                </div>
            ))}
        </div>
    );
}

function BreakdownCard({
    title,
    description,
    items,
    icon,
}: {
    title: string;
    description: string;
    items: BreakdownItem[];
    icon: React.ReactNode;
}) {
    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

    return (
        <Card className="border-border/70 bg-card shadow-none">
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base font-medium">{title}</CardTitle>
                        <CardDescription className="text-muted-foreground">{description}</CardDescription>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>{item.label}</span>
                            <span className="tabular-nums text-muted-foreground">{item.value}</span>
                        </div>
                        <Progress className="h-2 bg-muted" value={(item.value / total) * 100} />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function QueueCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-4">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-xl font-semibold tabular-nums">{value}</span>
        </div>
    );
}

function ActionCard({
    title,
    description,
    href,
    icon,
}: {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
}) {
    return (
        <Link href={href} className="block">
            <Card className="h-full border-border/70 bg-card shadow-none transition-colors hover:bg-muted/40">
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
                        <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium">{title}</CardTitle>
                        <CardDescription className="text-muted-foreground">{description}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}

function TrendChart({ points }: { points: TrendPoint[] }) {
    const values = points.flatMap((point) => [point.tenants, point.users, point.submissions]);
    const max = Math.max(...values, 1);

    return (
        <div className="space-y-4">
            <div className="grid h-64 grid-cols-6 items-end gap-3 rounded-lg border border-border/70 bg-muted/30 p-4">
                {points.map((point) => (
                    <div key={point.label} className="flex h-full flex-col justify-end gap-2">
                        <div className="flex h-full items-end justify-center gap-1.5">
                            <Bar value={point.tenants} max={max} />
                            <Bar value={point.users} max={max} />
                            <Bar value={point.submissions} max={max} />
                        </div>
                        <div className="text-center text-xs text-muted-foreground">{point.label}</div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    Tenants
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary/70" />
                    Users
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary/40" />
                    Submissions
                </span>
            </div>
        </div>
    );
}

function Bar({ value, max }: { value: number; max: number }) {
    const height = Math.max((value / max) * 100, value > 0 ? 8 : 2);

    return <div className="w-3 rounded-sm bg-primary" style={{ height: `${height}%`, opacity: Math.max(0.32, value / max) }} />;
}

function sumTrend(points: TrendPoint[], key: 'tenants' | 'users' | 'submissions') {
    return points.reduce((sum, point) => sum + point[key], 0);
}

function toPercent(value: number, items: BreakdownItem[]) {
    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

    return (value / total) * 100;
}
