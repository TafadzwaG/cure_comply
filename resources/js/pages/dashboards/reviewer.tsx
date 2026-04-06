import {
    ActivityItem,
    BreakdownItem,
    DashboardActionCard,
    DashboardActivityFeed,
    DashboardBreakdownCard,
    DashboardMetricCard,
    DashboardQuickStat,
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
import { ClipboardCheck, Eye, FileCheck2, FileSearch, ShieldAlert, Sparkles } from 'lucide-react';

interface ReviewerDashboardProps {
    hero: {
        pendingEvidence: number;
        submissionsInReview: number;
        reviewsCompletedToday: number;
        rejectedRate: number;
    };
    stats: {
        pendingEvidence: number;
        approvedToday: number;
        rejectedToday: number;
        flaggedResponses: number;
        submissionsInReview: number;
        averageTurnaroundHours: number;
    };
    weeklyTrend: TrendSeriesPoint[];
    evidenceStatusBreakdown: BreakdownItem[];
    reviewQueue: Array<{
        id: number;
        file: string;
        framework: string;
        question: string;
        uploader: string;
        waiting?: string | null;
    }>;
    recentDecisions: Array<{
        id: number;
        framework: string;
        question: string;
        review_status: string;
        comment?: string | null;
        reviewed_at?: string | null;
    }>;
    submissionHotspots: Array<{
        id: number;
        title: string;
        framework?: string | null;
        status: string;
        pending_evidence_count: number;
        rejected_evidence_count: number;
    }>;
    attentionItems: Array<{
        title: string;
        value: number;
        description: string;
    }>;
    recentActivity: ActivityItem[];
    pendingItems: PendingItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function ReviewerDashboard(props: ReviewerDashboardProps) {
    const metricCards = [
        {
            label: 'Pending evidence',
            value: props.stats.pendingEvidence,
            detail: 'Evidence files currently waiting for review.',
            icon: <Eye className="size-4" />,
        },
        {
            label: 'Approved today',
            value: props.stats.approvedToday,
            detail: 'Review approvals completed by you today.',
            icon: <FileCheck2 className="size-4" />,
        },
        {
            label: 'Rejected today',
            value: props.stats.rejectedToday,
            detail: 'Evidence items you have sent back today.',
            icon: <ShieldAlert className="size-4" />,
        },
        {
            label: 'Flagged responses',
            value: props.stats.flaggedResponses,
            detail: 'Responses that need extra reviewer scrutiny.',
            icon: <Sparkles className="size-4" />,
        },
        {
            label: 'Submissions in review',
            value: props.stats.submissionsInReview,
            detail: 'Compliance submissions currently under active review.',
            icon: <ClipboardCheck className="size-4" />,
        },
        {
            label: 'Average turnaround',
            value: `${Math.round(props.stats.averageTurnaroundHours)}h`,
            detail: 'Average time from upload to reviewer decision.',
            icon: <FileSearch className="size-4" />,
        },
    ];

    return (
        <PlatformLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviewer Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
                    <Card className="border-border/70 bg-card shadow-none">
                        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
                                    Review command center
                                </Badge>
                                <div className="space-y-2">
                                    <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">Reviewer queue overview</CardTitle>
                                    <CardDescription className="max-w-2xl text-sm leading-6">
                                        Prioritize pending evidence, inspect decision quality, and keep compliance scoring moving with a focused
                                        reviewer workspace.
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <DashboardQuickStat
                                    title="Pending evidence"
                                    value={`${props.hero.pendingEvidence}`}
                                    hint="Files waiting for reviewer action"
                                />
                                <DashboardQuickStat
                                    title="Rejected rate"
                                    value={`${Math.round(props.hero.rejectedRate)}%`}
                                    hint="Share of evidence currently rejected"
                                />
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-border/70 bg-muted/30 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Priority checks</CardTitle>
                            <CardDescription>Signals that should shape your next review decisions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {props.attentionItems.map((item) => (
                                <div key={item.title} className="rounded-lg border border-border/70 bg-background/80 p-4">
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

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {metricCards.map((item) => (
                        <DashboardMetricCard key={item.label} {...item} />
                    ))}
                </section>

                <PendingItemsPanel items={props.pendingItems} />

                <Tabs defaultValue="queue" className="space-y-4">
                    <TabsList className="h-auto w-full justify-start rounded-lg border border-border bg-muted/40 p-1">
                        <TabsTrigger value="queue" className="rounded-md px-4 py-2">
                            Queue
                        </TabsTrigger>
                        <TabsTrigger value="decisions" className="rounded-md px-4 py-2">
                            Decisions
                        </TabsTrigger>
                        <TabsTrigger value="submissions" className="rounded-md px-4 py-2">
                            Submissions
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="rounded-md px-4 py-2">
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="queue" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Prioritized evidence queue</CardTitle>
                                    <CardDescription>Oldest pending evidence first, with uploader and question context.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Evidence</TableHead>
                                                <TableHead>Framework</TableHead>
                                                <TableHead>Uploader</TableHead>
                                                <TableHead className="text-right">Waiting</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.reviewQueue.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{item.file}</div>
                                                            <div className="text-xs text-muted-foreground line-clamp-2">{item.question}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{item.framework}</TableCell>
                                                    <TableCell>{item.uploader}</TableCell>
                                                    <TableCell className="text-right text-muted-foreground">{item.waiting ?? 'Recently uploaded'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <div className="grid gap-4">
                                <DashboardActionCard
                                    title="Open review queue"
                                    description="Jump into the full queue and decide pending evidence items."
                                    href="/evidence"
                                    icon={<Eye className="size-4" />}
                                />
                                <DashboardActionCard
                                    title="Review pending evidence"
                                    description="Focus on evidence that is directly blocking review progress."
                                    href="/evidence?status=pending"
                                    icon={<FileSearch className="size-4" />}
                                />
                                <DashboardActionCard
                                    title="View flagged submissions"
                                    description="Inspect responses and submissions that carry elevated quality concerns."
                                    href="/submissions"
                                    icon={<ShieldAlert className="size-4" />}
                                />
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="decisions" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                            <DashboardBreakdownCard
                                title="Decision mix"
                                description="How tenant evidence currently breaks down by review result."
                                items={props.evidenceStatusBreakdown}
                                icon={<FileCheck2 className="size-4" />}
                            />
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Recent decisions</CardTitle>
                                    <CardDescription>Your latest evidence review outcomes and comments.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Framework</TableHead>
                                                <TableHead>Question</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Reviewed</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.recentDecisions.map((decision) => (
                                                <TableRow key={decision.id}>
                                                    <TableCell>{decision.framework}</TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="line-clamp-2">{decision.question}</div>
                                                            {decision.comment ? (
                                                                <div className="text-xs text-muted-foreground line-clamp-2">{decision.comment}</div>
                                                            ) : null}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {decision.review_status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">{decision.reviewed_at ?? 'Recently'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </section>
                    </TabsContent>

                    <TabsContent value="submissions" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Submission hotspots</CardTitle>
                                    <CardDescription>Submissions with the heaviest pending or rejected evidence pressure.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Submission</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Pending</TableHead>
                                                <TableHead className="text-right">Rejected</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.submissionHotspots.map((submission) => (
                                                <TableRow key={submission.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{submission.title}</div>
                                                            <div className="text-xs text-muted-foreground">{submission.framework ?? 'Framework'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {submission.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">{submission.pending_evidence_count}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{submission.rejected_evidence_count}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <DashboardTrendChart
                                title="Decision trend"
                                description="Weekly movement across approvals, rejections, and incoming pending evidence."
                                points={props.weeklyTrend}
                                legends={[
                                    { label: 'Approved reviews', tone: 'bg-[#083d77]' },
                                    { label: 'Rejected reviews', tone: 'bg-[#194781]' },
                                    { label: 'Pending evidence', tone: 'bg-[#00b9ce]' },
                                ]}
                            />
                        </section>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <DashboardActivityFeed
                            title="Reviewer activity"
                            description="Recent review and administrative actions recorded under your account."
                            items={props.recentActivity}
                            emptyMessage="No reviewer activity has been recorded yet."
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformLayout>
    );
}
