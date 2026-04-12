import { BrandCard } from '@/components/brand-card';
import { EmptyState } from '@/components/empty-state';
import { IconChip } from '@/components/icon-chip';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import moment from 'moment';
import {
    Award,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    FileText,
    FolderKanban,
    GraduationCap,
    ImagePlus,
    Layers3,
    Loader2,
    Pencil,
    PlayCircle,
    Plus,
    Rocket,
    Settings2,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserCheck,
    UsersRound,
    X,
    XCircle,
} from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';

interface Option {
    id: number;
    option_text: string;
    is_correct: boolean;
    sort_order: number;
}

interface Question {
    id: number;
    question_type: string;
    question_text: string;
    image_url?: string | null;
    marks: number;
    is_active: boolean;
    sort_order: number;
    options: Option[];
}

interface Course {
    id: number;
    title: string;
}

interface Attempt {
    id: number;
    attempt_number: number;
    score: number;
    percentage: number;
    result_status: string;
    submitted_at?: string | null;
}

interface TestData {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    pass_mark: number;
    time_limit_minutes?: number | null;
    max_attempts?: number | null;
    course?: Course | null;
    questions: Question[];
    assignments?: TestAssignment[];
}

interface TestAssignment {
    id: number;
    status: string;
    due_date?: string | null;
    assigned_at?: string | null;
    assigned_to_user_id: number;
    assigned_to?: { id: number; name: string; email: string } | null;
    assigned_by?: { id: number; name: string } | null;
}

interface Props {
    test: TestData;
    attempts: Attempt[];
    canTake: boolean;
    canManage: boolean;
    attemptsUsed: number;
    maxAttempts?: number | null;
    courses: Course[];
    assignableEmployees: Array<{ id: number; name: string; email: string }>;
}

interface OptionFormData {
    id?: number | null;
    option_text: string;
    is_correct: boolean;
}

interface QuestionFormData {
    _method?: string;
    question_text: string;
    question_type: string;
    marks: number;
    is_active: boolean;
    image: File | null;
    remove_image: boolean;
    options: OptionFormData[];
}

const emptyQuestion: QuestionFormData = {
    question_text: '',
    question_type: 'single_choice',
    marks: 1,
    is_active: true,
    image: null,
    remove_image: false,
    options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
    ],
};

export default function TestShow({ test, attempts, canTake, canManage, attemptsUsed, maxAttempts, courses, assignableEmployees }: Props) {
    const totalMarks = test.questions.reduce((sum, question) => sum + question.marks, 0);
    const activeQuestions = test.questions.filter((question) => question.is_active).length;
    const readiness = test.questions.length ? Math.round((activeQuestions / test.questions.length) * 100) : 0;
    const bestAttempt = attempts.length > 0 ? attempts.reduce((best, item) => (item.percentage > best.percentage ? item : best)) : null;
    const assignments = test.assignments ?? [];
    const pendingAssignments = assignments.filter((assignment) => assignment.status !== 'completed').length;
    const defaultTab = typeof window === 'undefined' ? 'overview' : new URLSearchParams(window.location.search).get('tab') ?? 'overview';

    const [showDialog, setShowDialog] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const publishForm = useForm({});

    function openAdd() {
        setEditingQuestion(null);
        setShowDialog(true);
    }

    function openEdit(question: Question) {
        setEditingQuestion(question);
        setShowDialog(true);
    }

    function handleDelete(questionId: number) {
        setDeleting(questionId);
        router.delete(route('tests.questions.destroy', [test.id, questionId]), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    }

    return (
        <PlatformLayout>
            <Head title={test.title} />

            <div className="space-y-6">
                <PageHeader
                    title={test.title}
                    description={test.description || 'Manage the assessment shell, question bank, and learner attempt history from one builder workspace.'}
                >
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Test workspace
                    </Badge>
                    {canTake ? (
                        <Button asChild>
                            <Link href={route('tests.attempts.create', test.id)}>
                                <PlayCircle className="size-4" />
                                Take test
                            </Link>
                        </Button>
                    ) : null}
                </PageHeader>

                <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
                    <BrandCard
                        title="Assessment builder"
                        description="Build the assessment shell, question bank, and learner rules in one place."
                        className="bg-card"
                        headerRight={<IconChip icon={<ClipboardCheck className="size-4" />} />}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                    Assessment builder
                                </Badge>
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    Shape the test shell, then build the question bank from the tabs below
                                </h2>
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Use the overview to monitor readiness, the question tab to manage the assessment bank, and the settings tab to control thresholds and publishing.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <MetricTile label="Questions" value={`${test.questions.length}`} detail={`${totalMarks} total marks`} icon={<FileText className="size-4" />} />
                                <MetricTile label="Coverage" value={`${readiness}%`} detail={`${activeQuestions} active questions`} icon={<ShieldCheck className="size-4" />} />
                                <MetricTile label="Pass mark" value={`${test.pass_mark}%`} detail="Minimum score to pass" icon={<Award className="size-4" />} />
                                <MetricTile
                                    label="Attempts"
                                    value={maxAttempts ? `${attemptsUsed}/${maxAttempts}` : `${attemptsUsed}`}
                                    detail={maxAttempts ? `${Math.max((maxAttempts ?? 0) - attemptsUsed, 0)} remaining` : 'Unlimited retakes'}
                                    icon={<GraduationCap className="size-4" />}
                                />
                                <MetricTile label="Assignments" value={`${assignments.length}`} detail={`${pendingAssignments} open`} icon={<UsersRound className="size-4" />} />
                            </div>
                        </div>
                    </BrandCard>

                    <BrandCard
                        title="Builder rail"
                        description="Keep the assessment controlled while the bank is still evolving."
                        className="bg-muted/20"
                        headerRight={<IconChip icon={<Settings2 className="size-4" />} className="border border-border/70 bg-background p-2.5 text-foreground" />}
                    >
                        <div className="space-y-4">
                            <RailItem icon={<Layers3 className="size-4" />} title="Question bank first" description="Add and refine questions before moving the test to published." />
                            <RailItem icon={<FolderKanban className="size-4" />} title="Delivery context" description={test.course ? `Currently linked to ${test.course.title}.` : 'This assessment is currently standalone.'} />
                            <RailItem icon={<Clock className="size-4" />} title="Attempt controls" description={test.time_limit_minutes ? `Each attempt is limited to ${test.time_limit_minutes} minutes.` : 'No timer is enforced at the moment.'} />
                            <RailItem icon={<ShieldCheck className="size-4" />} title="Scoring confidence" description={`Learners need ${test.pass_mark}% to pass with ${maxAttempts ? `${maxAttempts} attempt${maxAttempts === 1 ? '' : 's'}` : 'unlimited attempts'}.`} />
                        </div>
                    </BrandCard>
                </section>

                <Tabs defaultValue={defaultTab} className="space-y-4">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="overview">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="questions">
                            Questions
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="assignments">
                            Assignments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                            <BrandCard
                                title="Assessment readiness"
                                description="Track how complete and active the current question bank is."
                                headerRight={<Badge variant="outline">{activeQuestions} active questions</Badge>}
                            >
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#002753] dark:text-white">Question readiness</span>
                                            <span className="tabular-nums text-muted-foreground">{readiness}%</span>
                                        </div>
                                        <Progress className="h-2 bg-[#e6e8ea]" value={readiness} />
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        <OverviewTile label="Question bank" value={`${test.questions.length}`} detail="Items in the current bank" />
                                        <OverviewTile label="Total marks" value={`${totalMarks}`} detail="Available score weight" />
                                        <OverviewTile label="Attempts" value={`${attemptsUsed}`} detail="Attempts already recorded" />
                                    </div>

                                    {bestAttempt ? (
                                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <IconChip icon={<CheckCircle2 className="size-4" />} className="mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-[#002753] dark:text-white">
                                                            Best recorded attempt: {bestAttempt.percentage}%
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Attempt {bestAttempt.attempt_number} and currently <span className="font-medium">{bestAttempt.result_status}</span>.
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" asChild>
                                                    <Link href={route('tests.attempts.show', [test.id, bestAttempt.id])}>View result</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={GraduationCap}
                                            title="No attempts yet"
                                            description={canTake ? 'Learner attempts will appear here once the test has been taken.' : 'The test is not currently open for attempts.'}
                                            action={canTake ? { label: 'Take test now', href: route('tests.attempts.create', test.id) } : undefined}
                                        />
                                    )}
                                </div>
                            </BrandCard>

                            <BrandCard
                                title="Quick actions"
                                description="Jump directly to the main assessment workflows."
                                headerRight={<IconChip icon={<Sparkles className="size-4" />} />}
                            >
                                <div className="grid gap-3">
                                    {canManage ? (
                                        <Button onClick={openAdd} className="justify-start gap-2">
                                            <Plus className="size-4" />
                                            Add question
                                        </Button>
                                    ) : null}
                                    {canManage ? (
                                        <Button asChild variant="outline" className="justify-start gap-2">
                                            <Link href={route('tests.assignments.create', { test_id: test.id })}>
                                                <UserCheck className="size-4" />
                                                Assign employees
                                            </Link>
                                        </Button>
                                    ) : null}
                                    {canManage && test.status !== 'published' ? (
                                        <Button type="button" variant="outline" className="justify-start gap-2" onClick={() => setPublishDialogOpen(true)}>
                                            <Rocket className="size-4" />
                                            Publish test
                                        </Button>
                                    ) : null}
                                    {canTake ? (
                                        <Button asChild variant="outline" className="justify-start gap-2">
                                            <Link href={route('tests.attempts.create', test.id)}>
                                                <PlayCircle className="size-4" />
                                                Start attempt
                                            </Link>
                                        </Button>
                                    ) : null}
                                    <Button asChild variant="outline" className="justify-start gap-2">
                                        <Link href={route('tests.index')}>
                                            <ClipboardCheck className="size-4" />
                                            Return to tests
                                        </Link>
                                    </Button>
                                </div>
                            </BrandCard>
                        </section>

                        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                            <BrandCard
                                title="Question composition"
                                description="Review the current balance of question types and active items."
                                headerRight={<Badge variant="outline">{test.questions.length} questions</Badge>}
                            >
                                <div className="space-y-4">
                                    <CoverageBar
                                        label="Single choice"
                                        value={test.questions.filter((question) => question.question_type === 'single_choice').length}
                                        total={test.questions.length}
                                        icon={<CheckCircle2 className="size-4" />}
                                    />
                                    <CoverageBar
                                        label="Text answer"
                                        value={test.questions.filter((question) => question.question_type === 'text').length}
                                        total={test.questions.length}
                                        icon={<FileText className="size-4" />}
                                    />
                                    <CoverageBar
                                        label="Active questions"
                                        value={activeQuestions}
                                        total={test.questions.length}
                                        icon={<ShieldCheck className="size-4" />}
                                    />
                                </div>
                            </BrandCard>

                            <BrandCard
                                title="Builder guidance"
                                description="Use this checklist while preparing the assessment."
                                headerRight={<IconChip icon={<ShieldCheck className="size-4" />} />}
                            >
                                <div className="space-y-4">
                                    <GuidanceStep title="1. Confirm the shell" description="Check pass mark, attempt limits, and timing before publishing the assessment." />
                                    <GuidanceStep title="2. Build the bank" description="Write the question set, add options, and attach visuals where they improve clarity." />
                                    <GuidanceStep title="3. Publish deliberately" description="Only switch to published after reviewing wording, answer correctness, and learner flow." />
                                </div>
                            </BrandCard>
                        </section>
                    </TabsContent>

                    <TabsContent value="questions" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.22fr_0.78fr]">
                            <BrandCard
                                title="Question bank"
                                description={`Manage ${test.questions.length} questions across ${totalMarks} total marks.`}
                                headerRight={
                                    <div className="flex items-center gap-2">
                                        <StatusBadge value={test.status} />
                                        {canManage ? (
                                            <Button size="sm" onClick={openAdd}>
                                                <Plus className="size-4" />
                                                Add question
                                            </Button>
                                        ) : null}
                                    </div>
                                }
                            >
                                <div className="space-y-3">
                                    {test.questions.length === 0 ? (
                                        <EmptyState
                                            icon={FileText}
                                            title="No questions yet"
                                            description="Add the first question to start building the assessment bank."
                                            action={canManage ? { label: 'Add first question', onClick: openAdd } : undefined}
                                        />
                                    ) : (
                                        test.questions.map((question, index) => (
                                            <QuestionRow
                                                key={question.id}
                                                question={question}
                                                index={index}
                                                canManage={canManage}
                                                deleting={deleting}
                                                onEdit={openEdit}
                                                onDelete={handleDelete}
                                            />
                                        ))
                                    )}
                                </div>
                            </BrandCard>

                            <BrandCard
                                title="Attempt history"
                                description={
                                    attempts.length === 0
                                        ? 'No learner attempts have been recorded yet.'
                                        : `${attempts.length} ${attempts.length === 1 ? 'attempt' : 'attempts'} recorded for the current user.`
                                }
                                headerRight={<IconChip icon={<GraduationCap className="size-4" />} />}
                            >
                                {attempts.length > 0 ? (
                                    <div className="overflow-hidden rounded-xl border border-border/70">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>#</TableHead>
                                                    <TableHead>Score</TableHead>
                                                    <TableHead>Result</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {attempts.map((attempt) => (
                                                    <TableRow key={attempt.id}>
                                                        <TableCell className="tabular-nums">{attempt.attempt_number}</TableCell>
                                                        <TableCell className="font-medium tabular-nums">{attempt.percentage}%</TableCell>
                                                        <TableCell>
                                                            <StatusBadge value={attempt.result_status} />
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {attempt.submitted_at
                                                                ? new Date(attempt.submitted_at).toLocaleDateString('en-GB', {
                                                                      day: 'numeric',
                                                                      month: 'short',
                                                                      year: 'numeric',
                                                                  })
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={route('tests.attempts.show', [test.id, attempt.id])}>Review</Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={GraduationCap}
                                        title="No attempts yet"
                                        description={canTake ? 'Start the test to see attempt history and results here.' : 'This test is not currently available for attempts.'}
                                        action={canTake ? { label: 'Take test now', href: route('tests.attempts.create', test.id) } : undefined}
                                    />
                                )}
                            </BrandCard>
                        </section>
                    </TabsContent>

                    <TabsContent value="settings">
                        <TestSettingsPanel test={test} courses={courses} />
                    </TabsContent>

                    <TabsContent value="assignments" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                            <BrandCard
                                title="Assign this test"
                                description="Assign this assessment to employees in the current company and keep track of due dates."
                                headerRight={<Badge variant="outline">{assignments.length} assignments</Badge>}
                            >
                                {canManage ? (
                                    <TestAssignmentForm testId={test.id} employees={assignableEmployees} />
                                ) : (
                                    <EmptyState
                                        icon={UserCheck}
                                        title="Assignments are manager controlled"
                                        description="Only test managers can assign this assessment to company employees."
                                    />
                                )}
                            </BrandCard>

                            <BrandCard
                                title="Assignment guidance"
                                description="Use assignments when a company admin needs a clear target list and due date for a test."
                                headerRight={<IconChip icon={<UsersRound className="size-4" />} />}
                            >
                                <div className="space-y-4">
                                    <RailItem icon={<UserCheck className="size-4" />} title="Tenant-safe employee list" description="Only employees from the current company appear in the selector." />
                                    <RailItem icon={<CalendarDays className="size-4" />} title="Optional due dates" description="Set a deadline when the test should appear in follow-up and overdue views." />
                                    <RailItem icon={<ClipboardCheck className="size-4" />} title="Direct learner access" description="Assigned employees receive a notification and can open the test from their workspace." />
                                </div>
                            </BrandCard>
                        </section>

                        <BrandCard
                            title="Recent test assignments"
                            description="Monitor who has been assigned this assessment and the current delivery posture."
                            headerRight={<Badge variant="outline">{pendingAssignments} open</Badge>}
                        >
                            {assignments.length ? (
                                <div className="overflow-hidden rounded-xl border border-border/70">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Employee</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Due date</TableHead>
                                                <TableHead>Assigned</TableHead>
                                                <TableHead className="w-[140px] text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignments.map((assignment) => (
                                                <TableRow key={assignment.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-medium">{assignment.assigned_to?.name ?? 'Unknown employee'}</p>
                                                            <p className="text-xs text-muted-foreground">{assignment.assigned_to?.email ?? ''}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge value={assignment.status} />
                                                    </TableCell>
                                                    <TableCell>{assignment.due_date ? moment(assignment.due_date).format('dddd, D MMM YYYY') : 'No due date'}</TableCell>
                                                    <TableCell>{assignment.assigned_at ? moment(assignment.assigned_at).format('D MMM YYYY') : 'Recently'}</TableCell>
                                                    <TableCell className="text-right">
                                                        {canManage ? <AssignmentDeleteButton testId={test.id} assignmentId={assignment.id} /> : null}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={UsersRound}
                                    title="No employees assigned yet"
                                    description="Assign this test to employees in the current company to start tracking delivery."
                                />
                            )}
                        </BrandCard>
                    </TabsContent>
                </Tabs>
            </div>

            {canManage ? (
                <QuestionDialog
                    testId={test.id}
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    question={editingQuestion}
                />
            ) : null}

            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Publish this test?</DialogTitle>
                        <DialogDescription>
                            Publishing makes the assessment available in learner flows and company assignment workflows. Confirm that the question bank,
                            pass mark, and attempt settings are ready.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                            <IconChip icon={<Rocket className="size-4" />} className="mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-medium text-[#002753] dark:text-white">{test.title}</p>
                                <p>
                                    {test.questions.length} questions, {totalMarks} marks, {readiness}% active coverage.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setPublishDialogOpen(false)} disabled={publishForm.processing}>
                            <X className="size-4" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={publishForm.processing}
                            onClick={() =>
                                publishForm.post(route('tests.publish', { test: test.id }), {
                                    preserveScroll: true,
                                    onSuccess: () => setPublishDialogOpen(false),
                                })
                            }
                        >
                            {publishForm.processing ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                            Publish test
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PlatformLayout>
    );
}

function TestSettingsPanel({ test, courses }: { test: TestData; courses: Course[] }) {
    const form = useForm({
        course_id: test.course?.id ? String(test.course.id) : '',
        title: test.title,
        description: test.description ?? '',
        pass_mark: test.pass_mark,
        time_limit_minutes: test.time_limit_minutes ?? '',
        max_attempts: test.max_attempts ?? 1,
        status: test.status,
    });

    return (
        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <BrandCard
                title="Assessment settings"
                description="Update the shell, threshold, attempt rules, and publishing state."
                headerRight={<IconChip icon={<Settings2 className="size-4" />} />}
            >
                <div className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <SettingsField label="Title" htmlFor="title" error={form.errors.title}>
                            <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        </SettingsField>

                        <SettingsField label="Course" error={form.errors.course_id}>
                            <Select
                                value={form.data.course_id || 'none'}
                                onValueChange={(value) => form.setData('course_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Standalone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Standalone (no course)</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={String(course.id)}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </SettingsField>
                    </div>

                    <SettingsField label="Description" htmlFor="description" error={form.errors.description}>
                        <Textarea
                            id="description"
                            rows={4}
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            placeholder="Optional assessment summary."
                        />
                    </SettingsField>

                    <div className="grid gap-5 md:grid-cols-4">
                        <SettingsField label="Pass mark" htmlFor="pass_mark" error={form.errors.pass_mark}>
                            <Input
                                id="pass_mark"
                                type="number"
                                min={0}
                                max={100}
                                value={form.data.pass_mark}
                                onChange={(e) => form.setData('pass_mark', Number(e.target.value))}
                            />
                        </SettingsField>

                        <SettingsField label="Time limit" htmlFor="time_limit_minutes" error={form.errors.time_limit_minutes}>
                            <Input
                                id="time_limit_minutes"
                                type="number"
                                min={1}
                                value={form.data.time_limit_minutes}
                                onChange={(e) => form.setData('time_limit_minutes', e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="Unlimited"
                            />
                        </SettingsField>

                        <SettingsField label="Max attempts" htmlFor="max_attempts" error={form.errors.max_attempts}>
                            <Input
                                id="max_attempts"
                                type="number"
                                min={1}
                                value={form.data.max_attempts}
                                onChange={(e) => form.setData('max_attempts', Number(e.target.value))}
                            />
                        </SettingsField>

                        <SettingsField label="Status" error={form.errors.status}>
                            <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </SettingsField>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            disabled={form.processing}
                            onClick={() =>
                                form.patch(route('tests.update', test.id), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            {form.processing ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                            Save changes
                        </Button>

                        <Button asChild variant="outline">
                            <Link href={route('tests.index')}>Back to tests</Link>
                        </Button>
                    </div>
                </div>
            </BrandCard>

            <BrandCard
                title="Settings notes"
                description="A quick summary of the current assessment controls."
                headerRight={<IconChip icon={<ShieldCheck className="size-4" />} />}
            >
                <div className="space-y-4">
                    <GuidanceStep title="Publishing" description="Keep the test in draft while the bank is incomplete, then publish once questions and scoring are reviewed." />
                    <GuidanceStep
                        title="Retakes"
                        description={test.max_attempts ? `Learners can attempt this assessment ${test.max_attempts} time${test.max_attempts === 1 ? '' : 's'}.` : 'Retakes are not currently capped.'}
                    />
                    <GuidanceStep
                        title="Timer"
                        description={test.time_limit_minutes ? `The assessment currently enforces a ${test.time_limit_minutes}-minute time limit.` : 'No time limit is currently enforced.'}
                    />
                </div>
            </BrandCard>
        </section>
    );
}

function QuestionRow({
    question,
    index,
    canManage,
    deleting,
    onEdit,
    onDelete,
}: {
    question: Question;
    index: number;
    canManage: boolean;
    deleting: number | null;
    onEdit: (question: Question) => void;
    onDelete: (questionId: number) => void;
}) {
    return (
        <div className={`rounded-xl border p-4 ${question.is_active ? 'border-border/60' : 'border-border/40 bg-muted/20 opacity-70'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                        {index + 1}
                    </span>
                    <div className="min-w-0 space-y-2">
                        <p className="text-sm font-medium text-[#002753] dark:text-white">{question.question_text}</p>
                        {question.image_url ? (
                            <img src={question.image_url} alt="" className="max-h-40 rounded-lg border border-border/60 object-contain" />
                        ) : null}
                        {question.question_type === 'single_choice' && question.options.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {question.options.map((option) => (
                                    <span
                                        key={option.id}
                                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs ${
                                            option.is_correct
                                                ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : 'bg-muted/60 text-muted-foreground'
                                        }`}
                                    >
                                        {option.is_correct ? <CheckCircle2 className="size-3" /> : null}
                                        {option.option_text}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                        {!question.is_active ? (
                            <Badge variant="outline" className="rounded-full text-[10px] text-amber-600">
                                Inactive
                            </Badge>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                        {question.question_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full tabular-nums">
                        {question.marks}m
                    </Badge>
                    {canManage ? (
                        <>
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(question)}>
                                <Pencil className="size-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:text-destructive"
                                onClick={() => onDelete(question.id)}
                                disabled={deleting === question.id}
                            >
                                {deleting === question.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                            </Button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function TestAssignmentForm({ testId, employees }: { testId: number; employees: Array<{ id: number; name: string; email: string }> }) {
    const form = useForm({
        assigned_to_user_ids: [] as string[],
        due_date: '',
    });

    const selectedCount = form.data.assigned_to_user_ids.length;

    function toggleEmployee(employeeId: string, checked: boolean) {
        form.setData(
            'assigned_to_user_ids',
            checked
                ? Array.from(new Set([...form.data.assigned_to_user_ids, employeeId]))
                : form.data.assigned_to_user_ids.filter((id) => id !== employeeId),
        );
    }

    function toggleSelectAll(checked: boolean) {
        form.setData(
            'assigned_to_user_ids',
            checked ? employees.map((employee) => String(employee.id)) : [],
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
                <SettingsField label="Employees" error={form.errors.assigned_to_user_ids}>
                    <div className="space-y-3 rounded-xl border border-border/70 bg-background p-3">
                        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                            <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                <Checkbox
                                    checked={employees.length > 0 && selectedCount === employees.length}
                                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                    aria-label="Select all employees"
                                />
                                Select all
                            </label>
                            <span className="text-xs text-muted-foreground">{selectedCount} selected</span>
                        </div>

                        <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                            {employees.length ? (
                                employees.map((employee) => {
                                    const employeeId = String(employee.id);
                                    const checked = form.data.assigned_to_user_ids.includes(employeeId);

                                    return (
                                        <label
                                            key={employee.id}
                                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:border-[#14417A]/30 hover:bg-[#14417A]/5"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(value) => toggleEmployee(employeeId, !!value)}
                                                aria-label={`Select ${employee.name}`}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-[#002753] dark:text-white">{employee.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{employee.email}</p>
                                            </div>
                                        </label>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground">No company employees available.</p>
                            )}
                        </div>
                    </div>
                </SettingsField>

                <SettingsField label="Due date" error={form.errors.due_date}>
                    <Input type="date" value={form.data.due_date} onChange={(event) => form.setData('due_date', event.target.value)} />
                </SettingsField>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                Assigned employees receive a notification and can open the test directly from their workspace. Select one or many employees, then add a due date when you want clearer follow-up.
            </div>

            <div className="flex flex-wrap gap-3">
                <Button
                    type="button"
                    disabled={form.processing || employees.length === 0 || selectedCount === 0}
                    onClick={() =>
                        form.post(route('tests.assignments.store', { test: testId }), {
                            preserveScroll: true,
                            onSuccess: () => form.reset(),
                        })
                    }
                >
                    {form.processing ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
                    Assign employees
                </Button>
                <Button type="button" variant="outline" disabled={form.processing} onClick={() => form.reset()}>
                    <XCircle className="size-4" />
                    Clear form
                </Button>
            </div>
        </div>
    );
}

function AssignmentDeleteButton({ testId, assignmentId }: { testId: number; assignmentId: number }) {
    const [processing, setProcessing] = useState(false);

    return (
        <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={processing}
            onClick={() => {
                setProcessing(true);
                router.delete(route('tests.assignments.destroy', { test: testId, assignment: assignmentId }), {
                    preserveScroll: true,
                    onFinish: () => setProcessing(false),
                });
            }}
        >
            {processing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Remove
        </Button>
    );
}

function QuestionDialog({
    testId,
    open,
    onOpenChange,
    question,
}: {
    testId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: Question | null;
}) {
    const isEdit = !!question;
    const form = useForm<QuestionFormData>(
        question
            ? {
                  question_text: question.question_text,
                  question_type: question.question_type,
                  marks: question.marks,
                  is_active: question.is_active,
                  image: null,
                  remove_image: false,
                  options: question.options.map((option) => ({
                      id: option.id,
                      option_text: option.option_text,
                      is_correct: option.is_correct,
                  })),
              }
            : { ...emptyQuestion, options: emptyQuestion.options.map((option) => ({ ...option })) },
    );

    const [preview, setPreview] = useState<string | null>(null);
    const [lastQuestionId, setLastQuestionId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function resetDialogForm() {
        form.setData({
            ...emptyQuestion,
            options: emptyQuestion.options.map((option) => ({ ...option })),
        });
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    function handleImageChange(file: File | null) {
        form.setData('image', file);
        form.setData('remove_image', false);
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    const currentImage = preview ?? (form.data.remove_image ? null : question?.image_url ?? null);

    if (open && (question?.id ?? null) !== lastQuestionId) {
        setLastQuestionId(question?.id ?? null);

        if (question) {
            form.setData({
                question_text: question.question_text,
                question_type: question.question_type,
                marks: question.marks,
                is_active: question.is_active,
                image: null,
                remove_image: false,
                options: question.options.map((option) => ({
                    id: option.id,
                    option_text: option.option_text,
                    is_correct: option.is_correct,
                })),
            });
        } else {
            form.setData({
                ...emptyQuestion,
                options: emptyQuestion.options.map((option) => ({ ...option })),
            });
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    function addOption() {
        form.setData('options', [...form.data.options, { option_text: '', is_correct: false }]);
    }

    function removeOption(index: number) {
        form.setData(
            'options',
            form.data.options.filter((_, optionIndex) => optionIndex !== index),
        );
    }

    function updateOption(index: number, patch: Partial<OptionFormData>) {
        form.setData(
            'options',
            form.data.options.map((option, optionIndex) => (optionIndex === index ? { ...option, ...patch } : option)),
        );
    }

    function setCorrectOption(index: number) {
        form.setData(
            'options',
            form.data.options.map((option, optionIndex) => ({ ...option, is_correct: optionIndex === index })),
        );
    }

    function handleSubmit() {
        if (isEdit && question) {
            form.transform((data) => ({ ...data, _method: 'patch' }));
            form.post(route('tests.questions.update', [testId, question.id]), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });

            return;
        }

        form.post(route('tests.questions.store', testId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                resetDialogForm();
            },
        });
    }

    const isSingleChoice = form.data.question_type === 'single_choice';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit question' : 'Add question'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the question details and answer options.' : 'Create a new question with answer options for this assessment.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="question_text">Question</Label>
                        <Textarea
                            id="question_text"
                            rows={3}
                            value={form.data.question_text}
                            onChange={(e) => form.setData('question_text', e.target.value)}
                            placeholder="Enter the question text..."
                        />
                        {form.errors.question_text ? <p className="text-sm text-destructive">{form.errors.question_text}</p> : null}
                    </div>

                    <div className="space-y-2">
                        <Label>Image (optional)</Label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                        />
                        {currentImage ? (
                            <div className="relative inline-block">
                                <img src={currentImage} alt="Preview" className="max-h-40 rounded-md border border-border/60 object-contain" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (preview) {
                                            URL.revokeObjectURL(preview);
                                        }
                                        setPreview(null);
                                        form.setData('image', null);
                                        form.setData('remove_image', true);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-[#0F2E52] shadow"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-28 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground hover:border-[#14417A]/40 hover:bg-[#14417A]/5"
                            >
                                <ImagePlus className="h-5 w-5" />
                                Upload image (JPG, PNG, WEBP - max 4MB)
                            </button>
                        )}
                        {form.errors.image ? <p className="text-sm text-destructive">{form.errors.image}</p> : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Question type</Label>
                            <Select value={form.data.question_type} onValueChange={(value) => form.setData('question_type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single_choice">Single choice</SelectItem>
                                    <SelectItem value="text">Text answer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="marks">Marks</Label>
                            <Input
                                id="marks"
                                type="number"
                                min={1}
                                value={form.data.marks}
                                onChange={(e) => form.setData('marks', Number(e.target.value))}
                            />
                        </div>

                        <div className="flex items-end gap-2 pb-1">
                            <Checkbox
                                id="is_active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) => form.setData('is_active', !!checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm">
                                Active
                            </Label>
                        </div>
                    </div>

                    {isSingleChoice ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Answer options</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                    <Plus className="size-3.5" />
                                    Add option
                                </Button>
                            </div>

                            {form.data.options.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Add at least 2 options for a single choice question.</p>
                            ) : null}

                            <div className="space-y-2">
                                {form.data.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
                                            {String.fromCharCode(65 + index)}
                                        </span>

                                        <Input
                                            value={option.option_text}
                                            onChange={(e) => updateOption(index, { option_text: e.target.value })}
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                            className="flex-1"
                                        />

                                        <Button
                                            type="button"
                                            variant={option.is_correct ? 'default' : 'outline'}
                                            size="sm"
                                            className={`shrink-0 ${option.is_correct ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                            onClick={() => setCorrectOption(index)}
                                            title="Mark as correct answer"
                                        >
                                            {option.is_correct ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                                            {option.is_correct ? 'Correct' : 'Wrong'}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 shrink-0 text-destructive hover:text-destructive"
                                            onClick={() => removeOption(index)}
                                            disabled={form.data.options.length <= 2}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {form.data.options.length > 0 && !form.data.options.some((option) => option.is_correct) ? (
                                <p className="text-sm text-amber-600">Mark one option as the correct answer.</p>
                            ) : null}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                            <p className="text-sm text-muted-foreground">
                                Text questions require manual review. The answer will be collected as free-form text and marked as pending review.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={form.processing}>
                        <XCircle className="size-4" />
                        Cancel
                    </Button>
                    <Button type="button" variant="outline" onClick={resetDialogForm} disabled={form.processing}>
                        <Trash2 className="size-4" />
                        Clear form
                    </Button>
                    <Button onClick={handleSubmit} disabled={form.processing}>
                        {form.processing ? <Loader2 className="size-4 animate-spin" /> : null}
                        {!form.processing ? <SaveIcon /> : null}
                        {isEdit ? 'Save changes' : 'Add question'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MetricTile({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
                <IconChip icon={icon} />
                <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold text-[#002753] dark:text-white">{value}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
            </div>
        </div>
    );
}

function RailItem({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background p-4">
            <IconChip icon={icon} className="mt-0.5" />
            <div className="space-y-1">
                <p className="text-sm font-medium text-[#002753] dark:text-white">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function OverviewTile({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#002753] dark:text-white">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
    );
}

function CoverageBar({
    label,
    value,
    total,
    icon,
}: {
    label: string;
    value: number;
    total: number;
    icon: ReactNode;
}) {
    const percent = total ? Math.round((value / total) * 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-[#002753] dark:text-white">
                    {icon}
                    {label}
                </span>
                <span className="tabular-nums text-muted-foreground">{value}</span>
            </div>
            <Progress className="h-2 bg-[#e6e8ea]" value={percent} />
        </div>
    );
}

function GuidanceStep({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-sm font-medium text-[#002753] dark:text-white">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
    );
}

function SettingsField({
    label,
    children,
    error,
    htmlFor,
}: {
    label: string;
    children: ReactNode;
    error?: string;
    htmlFor?: string;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

function SaveIcon() {
    return <ClipboardCheck className="size-4" />;
}
