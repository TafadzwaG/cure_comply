import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    RotateCcw,
    XCircle,
} from 'lucide-react';

interface SelectedOption {
    id: number;
    option_text: string;
}

interface AnswerQuestion {
    id: number;
    question_text: string;
    marks: number;
    question_type: string;
}

interface Answer {
    id: number;
    question: AnswerQuestion | null;
    selected_option: SelectedOption | null;
    answer_text?: string | null;
    is_correct: boolean;
    marks_awarded: number;
}

interface Attempt {
    id: number;
    attempt_number: number;
    score: number;
    percentage: number;
    result_status: string;
    started_at?: string | null;
    submitted_at?: string | null;
    answers: Answer[];
}

interface TestData {
    id: number;
    title: string;
    pass_mark: number;
    max_attempts?: number | null;
}

interface Props {
    test: TestData;
    attempt: Attempt;
}

export default function TestResult({ test, attempt }: Props) {
    const passed = attempt.result_status === 'passed';
    const totalMarks = attempt.answers.reduce((sum, a) => sum + (a.question?.marks ?? 0), 0);
    const correctCount = attempt.answers.filter((a) => a.is_correct).length;
    const totalQuestions = attempt.answers.length;

    return (
        <PlatformLayout>
            <Head title={`Results: ${test.title}`} />

            <div className="flex flex-col gap-5">
                {/* Result hero */}
                <Card className={`border shadow-none ${
                    passed
                        ? 'border-emerald-300/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:border-emerald-800 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/20'
                        : 'border-red-300/60 bg-gradient-to-br from-red-50 via-white to-red-50/50 dark:border-red-800 dark:from-red-950/30 dark:via-slate-900 dark:to-red-950/20'
                }`}>
                    <CardHeader>
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`flex size-16 items-center justify-center rounded-2xl ${
                                    passed
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                }`}>
                                    {passed ? <Award className="size-8" /> : <XCircle className="size-8" />}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                                            Attempt {attempt.attempt_number}
                                        </Badge>
                                        <StatusBadge value={attempt.result_status} />
                                    </div>

                                    <CardTitle className="text-2xl font-semibold tracking-tight text-[#002753] dark:text-slate-100">
                                        {test.title}
                                    </CardTitle>

                                    <CardDescription className="text-sm">
                                        {passed
                                            ? 'Congratulations! You have passed this assessment.'
                                            : `You did not reach the ${test.pass_mark}% pass mark. Review the breakdown below.`}
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <ScoreStat label="Score" value={`${attempt.percentage}%`} large />
                                <Separator orientation="vertical" className="hidden h-12 md:block" />
                                <ScoreStat label="Marks" value={`${attempt.score}/${totalMarks}`} />
                                <Separator orientation="vertical" className="hidden h-12 md:block" />
                                <ScoreStat label="Correct" value={`${correctCount}/${totalQuestions}`} />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Pass mark: {test.pass_mark}%</span>
                                <span className="tabular-nums">{attempt.percentage}%</span>
                            </div>
                            <div className="relative">
                                <Progress value={attempt.percentage} className={`h-3 ${passed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-red-500'}`} />
                                <div
                                    className="absolute top-0 h-3 w-0.5 bg-[#002753] dark:bg-white"
                                    style={{ left: `${test.pass_mark}%` }}
                                    title={`Pass mark: ${test.pass_mark}%`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('tests.show', test.id)}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to test
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('tests.index')}>All tests</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={route('tests.attempts.create', test.id)}>
                                <RotateCcw className="size-4" />
                                Retake test
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Answer breakdown */}
                <Card className="border-border/60 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Answer Breakdown</CardTitle>
                        <CardDescription>Review each question, your answer, and whether it was correct.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {attempt.answers.map((answer, idx) => (
                            <div
                                key={answer.id}
                                className={`rounded-xl border p-4 ${
                                    answer.is_correct
                                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                                        : 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-xs font-semibold text-muted-foreground dark:bg-slate-900">
                                                {idx + 1}
                                            </span>
                                            <p className="text-sm font-medium text-[#002753] dark:text-slate-100">
                                                {answer.question?.question_text}
                                            </p>
                                        </div>

                                        <div className="ml-9 space-y-1 text-sm">
                                            <p className="text-muted-foreground">
                                                <span className="font-medium">Your answer: </span>
                                                {answer.selected_option?.option_text ?? answer.answer_text ?? (
                                                    <span className="italic text-muted-foreground/60">No answer provided</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <Badge variant="outline" className="rounded-full tabular-nums">
                                            {answer.marks_awarded}/{answer.question?.marks ?? 0}
                                        </Badge>
                                        {answer.is_correct ? (
                                            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                            <XCircle className="size-5 text-red-500 dark:text-red-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </PlatformLayout>
    );
}

function ScoreStat({ label, value, large }: { label: string; value: string; large?: boolean }) {
    return (
        <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`font-semibold tabular-nums text-[#002753] dark:text-slate-100 ${large ? 'text-3xl' : 'text-xl'}`}>
                {value}
            </p>
        </div>
    );
}
