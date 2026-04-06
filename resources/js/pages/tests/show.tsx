import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    PlayCircle,
} from 'lucide-react';

interface Option {
    id: number;
    option_text: string;
}

interface Question {
    id: number;
    question_type: string;
    question_text: string;
    marks: number;
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
}

interface Props {
    test: TestData;
    attempts: Attempt[];
    canTake: boolean;
    attemptsUsed: number;
    maxAttempts?: number | null;
}

export default function TestShow({ test, attempts, canTake, attemptsUsed, maxAttempts }: Props) {
    const totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);
    const bestAttempt = attempts.length > 0
        ? attempts.reduce((best, a) => (a.percentage > best.percentage ? a : best))
        : null;

    return (
        <PlatformLayout>
            <Head title={test.title} />

            <div className="flex flex-col gap-5">
                <PageHeader
                    title={test.title}
                    description={test.description || 'Review the test structure, your attempts, and take the assessment.'}
                >
                    {canTake && (
                        <Button asChild>
                            <Link href={route('tests.attempts.create', test.id)}>
                                <PlayCircle className="size-4" />
                                Take test
                            </Link>
                        </Button>
                    )}
                </PageHeader>

                {/* Test info cards */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard icon={<FileText className="size-4" />} label="Questions" value={String(test.questions.length)} detail={`${totalMarks} total marks`} />
                    <InfoCard icon={<Award className="size-4" />} label="Pass mark" value={`${test.pass_mark}%`} detail="Minimum score to pass" />
                    <InfoCard icon={<Clock className="size-4" />} label="Time limit" value={test.time_limit_minutes ? `${test.time_limit_minutes} min` : 'Unlimited'} detail={test.time_limit_minutes ? 'Timed assessment' : 'No time restriction'} />
                    <InfoCard icon={<GraduationCap className="size-4" />} label="Attempts" value={maxAttempts ? `${attemptsUsed}/${maxAttempts}` : `${attemptsUsed}`} detail={maxAttempts ? `${maxAttempts - attemptsUsed} remaining` : 'Unlimited retakes'} />
                </div>

                {/* Best score highlight */}
                {bestAttempt && (
                    <Card className={`border shadow-none ${
                        bestAttempt.result_status === 'passed'
                            ? 'border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                            : 'border-amber-200/60 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
                    }`}>
                        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`size-5 ${
                                    bestAttempt.result_status === 'passed'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-amber-600 dark:text-amber-400'
                                }`} />
                                <div>
                                    <p className="text-sm font-semibold text-[#002753] dark:text-slate-100">
                                        Best score: {bestAttempt.percentage}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Attempt {bestAttempt.attempt_number} — <StatusBadge value={bestAttempt.result_status} />
                                    </p>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('tests.attempts.show', [test.id, bestAttempt.id])}>
                                    View result
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
                    {/* Previous attempts */}
                    <Card className="border-border/60 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Your Attempts</CardTitle>
                            <CardDescription>
                                {attempts.length === 0
                                    ? 'You have not attempted this test yet.'
                                    : `${attempts.length} ${attempts.length === 1 ? 'attempt' : 'attempts'} recorded.`}
                            </CardDescription>
                        </CardHeader>
                        {attempts.length > 0 ? (
                            <CardContent>
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
                                                <TableCell><StatusBadge value={attempt.result_status} /></TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {attempt.submitted_at
                                                        ? new Date(attempt.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('tests.attempts.show', [test.id, attempt.id])}>
                                                            Review
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        ) : (
                            <CardContent className="py-8 text-center">
                                <GraduationCap className="mx-auto size-10 text-muted-foreground/30" />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {canTake ? 'Start the test to see your results here.' : 'This test is not available for taking.'}
                                </p>
                                {canTake && (
                                    <Button className="mt-4" size="sm" asChild>
                                        <Link href={route('tests.attempts.create', test.id)}>
                                            <PlayCircle className="size-4" />
                                            Take test now
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        )}
                    </Card>

                    {/* Question bank preview */}
                    <Card className="border-border/60 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base font-medium">Question Bank</CardTitle>
                                    <CardDescription>
                                        {test.questions.length} questions across {totalMarks} total marks.
                                        {test.course && (
                                            <> Linked to <span className="font-medium">{test.course.title}</span>.</>
                                        )}
                                    </CardDescription>
                                </div>
                                <StatusBadge value={test.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {test.questions.map((question, idx) => (
                                <div key={question.id} className="rounded-xl border border-border/60 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                                                {idx + 1}
                                            </span>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-[#002753] dark:text-slate-100">
                                                    {question.question_text}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {question.options.map((option) => (
                                                        <span
                                                            key={option.id}
                                                            className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground"
                                                        >
                                                            {option.option_text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                                                {question.question_type.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant="secondary" className="rounded-full tabular-nums">
                                                {question.marks}m
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PlatformLayout>
    );
}

function InfoCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
    return (
        <Card className="border-border/60 shadow-none">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <div className="rounded-xl bg-[#d6e3ff] p-2 text-[#083d77] dark:bg-slate-800 dark:text-blue-400">{icon}</div>
                </div>
                <div>
                    <div className="text-2xl font-semibold tracking-tight tabular-nums text-[#002753] dark:text-slate-100">{value}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </div>
            </CardHeader>
        </Card>
    );
}
