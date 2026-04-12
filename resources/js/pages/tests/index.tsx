import { DataIndexPage } from '@/components/data-index-page';
import { EmptyState } from '@/components/empty-state';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters } from '@/types';
import { Head, Link } from '@inertiajs/react';
import moment from 'moment';
import { ClipboardCheck, Eye, FolderKanban, GraduationCap, History, PenSquare, PlayCircle, ShieldCheck, TimerReset, UserCheck } from 'lucide-react';

interface TestRecord {
    id: number;
    title: string;
    status: string;
    pass_mark: number;
    questions_count?: number;
    course?: { id: number; title: string } | null;
}

interface EmployeeTestRecord {
    id: number;
    title: string;
    course?: string | null;
    questions_count: number;
    pass_mark: number;
    status: string;
    assignment_status?: string | null;
    due_date?: string | null;
    attempts_count: number;
    best_score: number;
    latest_result_status?: string | null;
    latest_attempt_id?: number | null;
    can_take: boolean;
}

interface EmployeeAttemptRecord {
    id: number;
    test_id: number;
    test_title: string;
    attempt_number: number;
    percentage: number;
    result_status?: string | null;
    submitted_at?: string | null;
}

interface EmployeeWorkspace {
    stats: {
        mandatory: number;
        public: number;
        attempted: number;
        attempts: number;
    };
    assignedTests: EmployeeTestRecord[];
    publicTests: EmployeeTestRecord[];
    recentAttempts: EmployeeAttemptRecord[];
}

function StatusPill({ value }: { value: string }) {
    const tones: Record<string, string> = {
        published: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
        draft: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
        archived: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
    };

    return (
        <Badge variant="outline" className={`capitalize font-medium ${tones[value.toLowerCase()] ?? 'border-border bg-background text-foreground'}`}>
            {value}
        </Badge>
    );
}

export default function TestsIndex({
    tests,
    courses,
    filters,
    stats,
    employeeWorkspace,
}: {
    tests?: Paginated<TestRecord>;
    courses?: Array<{ id: number; title: string }>;
    filters?: TableFilters;
    stats?: Record<string, number>;
    employeeWorkspace?: EmployeeWorkspace;
}) {
    return (
        <PlatformLayout>
            <Head title="Tests" />
            {employeeWorkspace ? (
                <EmployeeTestsIndex workspace={employeeWorkspace} />
            ) : (
                <AdminTestsIndex
                    tests={tests!}
                    courses={courses ?? []}
                    filters={filters!}
                    stats={stats!}
                />
            )}
        </PlatformLayout>
    );
}

function AdminTestsIndex({
    tests,
    courses,
    filters,
    stats,
}: {
    tests: Paginated<TestRecord>;
    courses: Array<{ id: number; title: string }>;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        { label: 'Tests', value: stats.total, detail: 'Assessments in the question bank.', icon: ClipboardCheck },
        { label: 'Published', value: stats.published, detail: 'Ready for employee attempts.', icon: GraduationCap },
        { label: 'Draft', value: stats.draft, detail: 'Still being prepared.', icon: PenSquare },
        { label: 'Archived', value: stats.archived, detail: 'Inactive assessments retained.', icon: FolderKanban },
    ];

    return (
        <div className="space-y-6">
            <DataIndexPage
                title="Tests"
                description="Create assessments linked to training content and monitor the publishing pipeline."
                stats={statItems}
                actions={[
                    { label: 'Add New Test', href: route('tests.create'), icon: ClipboardCheck },
                    { label: 'Assign Test', href: route('tests.assignments.create'), icon: UserCheck, variant: 'outline' },
                ]}
                filters={filters}
                filterConfigs={[
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { label: 'Draft', value: 'draft' },
                            { label: 'Published', value: 'published' },
                            { label: 'Archived', value: 'archived' },
                        ],
                    },
                    {
                        key: 'course_id',
                        label: 'Course',
                        options: courses.map((course) => ({ label: course.title, value: String(course.id) })),
                    },
                ]}
                paginated={tests}
                tableTitle="Assessment Bank"
                tableDescription="Each published test can be taken by assigned employees."
                exportable
            >
                <Card className="border-border/70 shadow-none">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base font-medium">Assessment Bank</CardTitle>
                                <CardDescription>Full test inventory across drafts, published items, and archived assessments.</CardDescription>
                            </div>
                            <Badge variant="outline">{tests.total ?? tests.data.length} records</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableTableHead label="Test" column="title" filters={filters} />
                                        <TableHead>Course</TableHead>
                                        <TableHead>Questions</TableHead>
                                        <SortableTableHead label="Status" column="status" filters={filters} />
                                        <TableHead>Pass mark</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tests.data.map((test) => (
                                        <TableRow key={test.id}>
                                            <TableCell>
                                                <Link href={route('tests.show', test.id)} className="font-medium text-foreground hover:text-primary hover:underline">
                                                    {test.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{test.course?.title ?? 'Standalone'}</TableCell>
                                            <TableCell>{test.questions_count ?? 0}</TableCell>
                                            <TableCell><StatusPill value={test.status} /></TableCell>
                                            <TableCell>{test.pass_mark}%</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={route('tests.assignments.create', { test_id: test.id })}>
                                                        <UserCheck className="size-4" />
                                                        Assign
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </DataIndexPage>
        </div>
    );
}

function EmployeeTestsIndex({ workspace }: { workspace: EmployeeWorkspace }) {
    const statCards = [
        { label: 'Mandatory tests', value: workspace.stats.mandatory, detail: 'Assigned by your company admin.', icon: ShieldCheck },
        { label: 'Public tests', value: workspace.stats.public, detail: 'Published tests you can open anytime.', icon: ClipboardCheck },
        { label: 'Tests attempted', value: workspace.stats.attempted, detail: 'Unique assessments you have already attempted.', icon: GraduationCap },
        { label: 'Total attempts', value: workspace.stats.attempts, detail: 'All recorded tries under your account.', icon: TimerReset },
    ];

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-none">
                <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                    <div className="space-y-2">
                        <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">PrivacyCure Test Workspace</Badge>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your assigned and public tests</h1>
                        <p className="max-w-3xl text-sm leading-6 text-white/80">
                            Mandatory tests appear separately from public assessments so you can see what is required, what is optional, and whether your next action is to take or retake.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ label, value, detail, icon: Icon }) => (
                    <Card key={label} className="border-border/70 shadow-none">
                        <CardContent className="flex items-start justify-between gap-4 p-5">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                                <p className="text-2xl font-semibold tracking-tight">{value}</p>
                                <p className="text-sm text-muted-foreground">{detail}</p>
                            </div>
                            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                <Icon className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <Tabs defaultValue="mandatory" className="space-y-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="mandatory">Assigned tests</TabsTrigger>
                    <TabsTrigger value="public">Public tests</TabsTrigger>
                </TabsList>

                <TabsContent value="mandatory">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Mandatory tests</CardTitle>
                            <CardDescription>Tests assigned directly to you by the company. These are the required assessments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EmployeeTestTable tests={workspace.assignedTests} emptyTitle="No assigned tests" emptyDescription="Assigned assessments will appear here with due dates and attempt history." dueLabel="Due date" showAssignmentStatus />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="public">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Public tests</CardTitle>
                            <CardDescription>Published assessments that are open to you without a direct assignment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EmployeeTestTable tests={workspace.publicTests} emptyTitle="No public tests available" emptyDescription="Only open published tests appear in this tab." dueLabel="Availability" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className="border-border/70 shadow-none">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Recent attempts</CardTitle>
                    <CardDescription>Your latest submitted test attempts and outcomes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {workspace.recentAttempts.length ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Test</TableHead>
                                        <TableHead>Attempt</TableHead>
                                        <TableHead>Result</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                        <TableHead className="text-right">Submitted</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workspace.recentAttempts.map((attempt) => (
                                        <TableRow key={attempt.id}>
                                            <TableCell className="font-medium">{attempt.test_title}</TableCell>
                                            <TableCell>Attempt {attempt.attempt_number}</TableCell>
                                            <TableCell>{attempt.result_status ? <StatusBadge value={attempt.result_status} /> : 'Pending'}</TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">{attempt.percentage}%</TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">{attempt.submitted_at ? moment(attempt.submitted_at).format('DD MMM YYYY') : 'Recently'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={route('tests.attempts.show', [attempt.test_id, attempt.id])}>
                                                        <History className="mr-2 size-4" />
                                                        Review
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState icon={History} title="No attempts yet" description="Your submitted assessments will appear here once you start taking tests." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function EmployeeTestTable({
    tests,
    emptyTitle,
    emptyDescription,
    dueLabel,
    showAssignmentStatus = false,
}: {
    tests: EmployeeTestRecord[];
    emptyTitle: string;
    emptyDescription: string;
    dueLabel: string;
    showAssignmentStatus?: boolean;
}) {
    if (!tests.length) {
        return <EmptyState icon={ClipboardCheck} title={emptyTitle} description={emptyDescription} />;
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Assessment</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Latest result</TableHead>
                        <TableHead>{dueLabel}</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tests.map((test) => {
                        const action = getEmployeePrimaryAction(test);

                        return (
                            <TableRow key={`${test.is_mandatory ? 'mandatory' : 'public'}-${test.id}`}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{test.title}</div>
                                        <div className="text-xs text-muted-foreground">{test.questions_count} questions · pass mark {test.pass_mark}%</div>
                                    </div>
                                </TableCell>
                                <TableCell>{test.course ?? 'Standalone'}</TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium tabular-nums">{test.attempts_count}</div>
                                        <div className="text-xs text-muted-foreground">{test.attempts_count > 0 ? `Best ${test.best_score}%` : 'Not attempted yet'}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{test.latest_result_status ? <StatusBadge value={test.latest_result_status} /> : <span className="text-sm text-muted-foreground">Not attempted</span>}</TableCell>
                                <TableCell>
                                    <div className="space-y-1 text-sm">
                                        <div>{test.due_date ? moment(test.due_date).format('DD MMM YYYY') : 'Open now'}</div>
                                        <div className="text-xs text-muted-foreground capitalize">{showAssignmentStatus ? (test.assignment_status?.replaceAll('_', ' ') ?? 'Assigned') : test.status.replaceAll('_', ' ')}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {action ? (
                                            <Button asChild size="sm">
                                                <Link href={action.href}>
                                                    {action.kind === 'take' ? <PlayCircle className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
                                                    {action.label}
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline" disabled>Unavailable</Button>
                                        )}
                                        {test.latest_attempt_id && test.can_take ? (
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={route('tests.attempts.show', [test.id, test.latest_attempt_id])}>
                                                    <History className="mr-2 size-4" />
                                                    Result
                                                </Link>
                                            </Button>
                                        ) : null}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

function getEmployeePrimaryAction(test: EmployeeTestRecord): { href: string; label: string; kind: 'take' | 'view' } | null {
    if (test.can_take) {
        return {
            href: route('tests.attempts.create', test.id),
            label: test.attempts_count > 0 ? 'Retake' : 'Take',
            kind: 'take',
        };
    }

    if (test.latest_attempt_id) {
        return {
            href: route('tests.attempts.show', [test.id, test.latest_attempt_id]),
            label: 'View result',
            kind: 'view',
        };
    }

    return null;
}
