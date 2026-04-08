import {
    ActivityItem,
    DashboardActionCard,
    DashboardActivityFeed,
    DashboardInlineScore,
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
import { BookOpen, CheckCircle2, ClipboardCheck, FileSearch, ShieldCheck, TimerReset } from 'lucide-react';

interface EmployeeDashboardProps {
    hero: {
        trainingCompletion: number;
        activeAssignments: number;
        pendingTests: number;
        complianceTasks: number;
    };
    stats: {
        assignedCourses: number;
        completedLessons: number;
        testsPassed: number;
        pendingResponses: number;
        evidenceTasks: number;
        latestScore: number;
    };
    latestRating: string;
    monthlyTrend: TrendSeriesPoint[];
    nextActions: Array<{
        id: number;
        title: string;
        description: string;
        meta?: string | null;
        created_at?: string | null;
    }>;
    currentCourses: Array<{
        id: number;
        course: string;
        status: string;
        progress: number;
        due_date?: string | null;
    }>;
    assessments: {
        available: Array<{
            id: number;
            title: string;
            course?: string | null;
            attempts: number;
            best_score: number;
        }>;
        recentAttempts: Array<{
            id: number;
            test: string;
            percentage: number;
            result_status: string;
            submitted_at?: string | null;
        }>;
    };
    compliance: {
        draftResponses: number;
        completedResponses: number;
        evidenceTasks: number;
        items: Array<{
            id: number;
            question: string;
            framework: string;
            submission: string;
            status: string;
            response_score: number;
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

export default function EmployeeDashboard(props: EmployeeDashboardProps) {
    const metricCards = [
        {
            label: 'Assigned courses',
            value: props.stats.assignedCourses,
            detail: 'Training allocations currently attached to your profile.',
            icon: <BookOpen className="size-4" />,
        },
        {
            label: 'Completed lessons',
            value: props.stats.completedLessons,
            detail: 'Lessons you have already completed across assigned learning paths.',
            icon: <CheckCircle2 className="size-4" />,
        },
        {
            label: 'Tests passed',
            value: props.stats.testsPassed,
            detail: 'Assessment attempts already landed in a passing state.',
            icon: <ClipboardCheck className="size-4" />,
        },
        {
            label: 'Pending responses',
            value: props.stats.pendingResponses,
            detail: 'Draft compliance responses that still need your attention.',
            icon: <ShieldCheck className="size-4" />,
        },
        {
            label: 'Evidence tasks',
            value: props.stats.evidenceTasks,
            detail: 'Items that still need evidence uploads or reviewer decisions.',
            icon: <FileSearch className="size-4" />,
        },
        {
            label: 'Latest score',
            value: `${Math.round(props.stats.latestScore)}%`,
            detail: props.latestRating,
            icon: <TimerReset className="size-4" />,
            donutValue: props.stats.latestScore,
        },
    ];

    return (
        <PlatformLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
                    <Card className="border-border/70 bg-card shadow-none">
                        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-2">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
                                    Personal work hub
                                </Badge>
                                <div className="space-y-2">
                                    <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">Your learning and compliance work</CardTitle>
                                    <CardDescription className="max-w-2xl text-sm leading-6">
                                        Stay on top of training, assessments, evidence tasks, and compliance responses from one focused workspace.
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <DashboardQuickStat
                                    title="Training completion"
                                    value={`${Math.round(props.hero.trainingCompletion)}%`}
                                    hint="Progress across your assigned course work"
                                    donutValue={props.hero.trainingCompletion}
                                />
                                <DashboardQuickStat
                                    title="Compliance tasks"
                                    value={`${props.hero.complianceTasks}`}
                                    hint="Draft responses and evidence tasks still open"
                                />
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-border/70 bg-muted/30 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Right now</CardTitle>
                            <CardDescription>Your immediate workload at a glance.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <QuickQueue label="Active assignments" value={props.hero.activeAssignments} />
                            <QuickQueue label="Pending tests" value={props.hero.pendingTests} />
                            <QuickQueue label="Compliance tasks" value={props.hero.complianceTasks} />
                            <QuickQueue label="Evidence tasks" value={props.stats.evidenceTasks} />
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {metricCards.map((item) => (
                        <DashboardMetricCard key={item.label} {...item} />
                    ))}
                </section>

                <PendingItemsPanel items={props.pendingItems} />

                <Tabs defaultValue="work" className="space-y-4">
                    <TabsList className="h-auto w-full justify-start rounded-lg border border-border bg-muted/40 p-1">
                        <TabsTrigger value="work" className="rounded-md px-4 py-2">
                            My work
                        </TabsTrigger>
                        <TabsTrigger value="training" className="rounded-md px-4 py-2">
                            Training
                        </TabsTrigger>
                        <TabsTrigger value="assessments" className="rounded-md px-4 py-2">
                            Assessments
                        </TabsTrigger>
                        <TabsTrigger value="compliance" className="rounded-md px-4 py-2">
                            Compliance
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="work" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
                            <DashboardTrendChart
                                title="Personal progress trend"
                                description="Six-month movement across lessons completed, tests submitted, and compliance responses answered."
                                points={props.monthlyTrend}
                                legends={[
                                    { label: 'Lessons completed', tone: 'bg-[#083d77]' },
                                    { label: 'Test attempts', tone: 'bg-[#194781]' },
                                    { label: 'Responses answered', tone: 'bg-[#00b9ce]' },
                                ]}
                            />
                            <DashboardActivityFeed
                                title="Next actions"
                                description="The clearest next moves to keep your work moving."
                                items={props.nextActions}
                                emptyMessage="You do not have any urgent next actions right now."
                            />
                        </section>

                        <section className="grid gap-4 md:grid-cols-3">
                            <DashboardActionCard
                                title="Continue training"
                                description="Return to your course work and keep completion moving."
                                href="/assignments"
                                icon={<BookOpen className="size-4" />}
                            />
                            <DashboardActionCard
                                title="Take test"
                                description="Open available assessments linked to your current courses."
                                href="/tests"
                                icon={<ClipboardCheck className="size-4" />}
                            />
                            <DashboardActionCard
                                title="Open submissions"
                                description="Finish draft compliance responses and upload missing evidence."
                                href="/submissions"
                                icon={<ShieldCheck className="size-4" />}
                            />
                        </section>
                    </TabsContent>

                    <TabsContent value="training" className="space-y-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base font-medium">Current courses</CardTitle>
                                <CardDescription>Assignments you are expected to complete right now.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Progress</TableHead>
                                            <TableHead className="text-right">Due</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {props.currentCourses.map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell className="font-medium">{course.course}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {course.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium tabular-nums">{Math.round(course.progress)}%</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{course.due_date ?? 'No due date'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assessments" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Available tests</CardTitle>
                                    <CardDescription>Assessments attached to your assigned courses.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Assessment</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead className="text-right">Attempts</TableHead>
                                                <TableHead className="text-right">Best</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.assessments.available.map((test) => (
                                                <TableRow key={test.id}>
                                                    <TableCell className="font-medium">{test.title}</TableCell>
                                                    <TableCell>{test.course ?? 'Course'}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{test.attempts}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DashboardInlineScore value={test.best_score} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Recent attempts</CardTitle>
                                    <CardDescription>Your latest submitted assessment attempts and outcomes.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Assessment</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Score</TableHead>
                                                <TableHead className="text-right">Submitted</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.assessments.recentAttempts.map((attempt) => (
                                                <TableRow key={attempt.id}>
                                                    <TableCell className="font-medium">{attempt.test}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {attempt.result_status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DashboardInlineScore value={attempt.percentage} />
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">{attempt.submitted_at ?? 'Recently'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </section>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-4">
                        <section className="grid gap-4 md:grid-cols-3">
                            <DashboardMetricCard
                                label="Draft responses"
                                value={props.compliance.draftResponses}
                                detail="Responses you started but have not completed yet."
                                icon={<ShieldCheck className="size-4" />}
                            />
                            <DashboardMetricCard
                                label="Completed responses"
                                value={props.compliance.completedResponses}
                                detail="Responses you already submitted inside active compliance flows."
                                icon={<CheckCircle2 className="size-4" />}
                            />
                            <DashboardMetricCard
                                label="Evidence tasks"
                                value={props.compliance.evidenceTasks}
                                detail="Response items still missing required evidence attachments."
                                icon={<FileSearch className="size-4" />}
                            />
                        </section>

                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base font-medium">Compliance work items</CardTitle>
                                <CardDescription>Your most recent compliance responses and response scores.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Question</TableHead>
                                            <TableHead>Framework</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {props.compliance.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium line-clamp-2">{item.question}</div>
                                                        <div className="text-xs text-muted-foreground">{item.submission}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.framework}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {item.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DashboardInlineScore value={item.response_score} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <DashboardActivityFeed
                    title="Recent activity"
                    description="Administrative and workflow events recorded under your account."
                    items={props.recentActivity}
                    emptyMessage="No recent employee activity has been recorded yet."
                />
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
