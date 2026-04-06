import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Circle,
    Clock,
    Loader2,
    Send,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Option {
    id: number;
    option_text: string;
    sort_order: number;
}

interface Question {
    id: number;
    question_type: string;
    question_text: string;
    marks: number;
    sort_order: number;
    options: Option[];
}

interface TestData {
    id: number;
    title: string;
    description?: string | null;
    pass_mark: number;
    time_limit_minutes?: number | null;
    max_attempts?: number | null;
    questions: Question[];
}

interface AnswerPayload {
    question_id: number;
    selected_option_id?: number | null;
    answer_text?: string | null;
}

interface Props {
    test: TestData;
    attemptNumber: number;
    maxAttempts?: number | null;
}

export default function TestTake({ test, attemptNumber, maxAttempts }: Props) {
    const questions = test.questions;
    const totalQuestions = questions.length;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<number, AnswerPayload>>(new Map());
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    const currentQuestion = questions[currentIndex];
    const answeredCount = answers.size;
    const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeRemaining = useMemo(() => {
        if (!test.time_limit_minutes) return null;
        return Math.max(0, test.time_limit_minutes * 60 - elapsed);
    }, [test.time_limit_minutes, elapsed]);

    // Auto-submit on time expiry
    useEffect(() => {
        if (timeRemaining === 0) {
            handleSubmit();
        }
    }, [timeRemaining]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    function setOptionAnswer(questionId: number, optionId: number) {
        setAnswers((prev) => {
            const next = new Map(prev);
            next.set(questionId, { question_id: questionId, selected_option_id: optionId });
            return next;
        });
    }

    function setTextAnswer(questionId: number, text: string) {
        setAnswers((prev) => {
            const next = new Map(prev);
            if (text.trim()) {
                next.set(questionId, { question_id: questionId, answer_text: text });
            } else {
                next.delete(questionId);
            }
            return next;
        });
    }

    function handleSubmit() {
        setSubmitting(true);
        const payload = questions.map((q) => {
            const ans = answers.get(q.id);
            return {
                question_id: q.id,
                selected_option_id: ans?.selected_option_id ?? null,
                answer_text: ans?.answer_text ?? null,
            };
        });

        router.post(route('tests.attempts.store', test.id), { answers: payload }, {
            onFinish: () => setSubmitting(false),
        });
    }

    function goToQuestion(index: number) {
        if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
    }

    const isAnswered = (qId: number) => answers.has(qId);
    const unansweredCount = totalQuestions - answeredCount;

    return (
        <PlatformLayout>
            <Head title={`Take Test: ${test.title}`} />

            <div className="flex flex-col gap-5">
                {/* Header */}
                <Card className="border-border/60 shadow-none">
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                                        Attempt {attemptNumber}{maxAttempts ? ` of ${maxAttempts}` : ''}
                                    </Badge>
                                    <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider">
                                        {totalQuestions} questions
                                    </Badge>
                                    <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider">
                                        {totalMarks} marks
                                    </Badge>
                                    <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider">
                                        Pass: {test.pass_mark}%
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-semibold tracking-tight text-[#002753] dark:text-slate-100">
                                    {test.title}
                                </CardTitle>
                                {test.description && (
                                    <CardDescription>{test.description}</CardDescription>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {timeRemaining !== null && (
                                    <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold tabular-nums ${
                                        timeRemaining < 60
                                            ? 'border border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300'
                                            : timeRemaining < 300
                                              ? 'border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                              : 'border border-border bg-muted text-foreground'
                                    }`}>
                                        <Clock className="size-4" />
                                        {formatTime(timeRemaining)}
                                    </div>
                                )}
                                {!test.time_limit_minutes && (
                                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2 text-sm tabular-nums text-muted-foreground">
                                        <Clock className="size-4" />
                                        {formatTime(elapsed)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{answeredCount} of {totalQuestions} answered</span>
                                <span className="tabular-nums">{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                        </div>
                    </CardHeader>
                </Card>

                {/* Main content */}
                <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
                    {/* Question navigator sidebar */}
                    <Card className="h-fit border-border/60 shadow-none xl:sticky xl:top-20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => {
                                    const answered = isAnswered(q.id);
                                    const active = idx === currentIndex;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => goToQuestion(idx)}
                                            className={`flex size-10 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-all ${
                                                active
                                                    ? 'bg-[#14417A] text-white shadow-sm'
                                                    : answered
                                                      ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                      : 'border border-border bg-white text-muted-foreground hover:bg-muted/60 dark:bg-slate-900'
                                            }`}
                                            aria-label={`Question ${idx + 1}${answered ? ', answered' : ', not answered'}${active ? ', current' : ''}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded border border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40" />
                                    Answered ({answeredCount})
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded border border-border bg-white dark:bg-slate-900" />
                                    Unanswered ({unansweredCount})
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <Button
                                className="w-full"
                                onClick={() => setShowConfirm(true)}
                                disabled={submitting}
                            >
                                <Send className="size-4" />
                                Submit test
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Question card */}
                    {currentQuestion && (
                        <Card className="border-border/60 shadow-none">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="rounded-full tabular-nums">
                                                Question {currentIndex + 1} of {totalQuestions}
                                            </Badge>
                                            <Badge variant="secondary" className="rounded-full tabular-nums">
                                                {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                                                {currentQuestion.question_type.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg font-medium text-[#002753] dark:text-slate-100">
                                            {currentQuestion.question_text}
                                        </CardTitle>
                                    </div>

                                    {isAnswered(currentQuestion.id) ? (
                                        <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <Circle className="mt-1 size-5 shrink-0 text-muted-foreground/30" />
                                    )}
                                </div>
                            </CardHeader>

                            <Separator />

                            <CardContent className="py-6">
                                {currentQuestion.question_type === 'single_choice' ? (
                                    <RadioGroup
                                        value={String(answers.get(currentQuestion.id)?.selected_option_id ?? '')}
                                        onValueChange={(value) => setOptionAnswer(currentQuestion.id, Number(value))}
                                        className="flex flex-col gap-3"
                                    >
                                        {currentQuestion.options.map((option, optIdx) => {
                                            const selected = answers.get(currentQuestion.id)?.selected_option_id === option.id;

                                            return (
                                                <Label
                                                    key={option.id}
                                                    htmlFor={`option-${option.id}`}
                                                    className={`flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-all ${
                                                        selected
                                                            ? 'border-[#14417A] bg-[#d6e3ff]/30 dark:border-blue-500 dark:bg-blue-950/30'
                                                            : 'border-border/60 hover:border-border hover:bg-muted/40'
                                                    }`}
                                                >
                                                    <RadioGroupItem value={String(option.id)} id={`option-${option.id}`} />
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        <span className="text-sm">{option.option_text}</span>
                                                    </div>
                                                </Label>
                                            );
                                        })}
                                    </RadioGroup>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor={`text-answer-${currentQuestion.id}`}>Your answer</Label>
                                        <Textarea
                                            id={`text-answer-${currentQuestion.id}`}
                                            placeholder="Type your answer here..."
                                            rows={6}
                                            value={answers.get(currentQuestion.id)?.answer_text ?? ''}
                                            onChange={(e) => setTextAnswer(currentQuestion.id, e.target.value)}
                                            className="resize-y"
                                        />
                                    </div>
                                )}
                            </CardContent>

                            <Separator />

                            <CardContent className="flex items-center justify-between gap-4 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentIndex === 0}
                                    onClick={() => goToQuestion(currentIndex - 1)}
                                >
                                    <ArrowLeft className="size-4" />
                                    Previous
                                </Button>

                                {currentIndex < totalQuestions - 1 ? (
                                    <Button
                                        size="sm"
                                        onClick={() => goToQuestion(currentIndex + 1)}
                                    >
                                        Next
                                        <ArrowRight className="size-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => setShowConfirm(true)}
                                        disabled={submitting}
                                    >
                                        <Send className="size-4" />
                                        Submit test
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Confirmation dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {unansweredCount > 0 && <AlertTriangle className="size-5 text-amber-500" />}
                            Submit test?
                        </DialogTitle>
                        <DialogDescription>
                            {unansweredCount > 0 ? (
                                <>
                                    You have <span className="font-semibold text-amber-600">{unansweredCount} unanswered</span>{' '}
                                    {unansweredCount === 1 ? 'question' : 'questions'}. Unanswered questions will receive 0 marks.
                                </>
                            ) : (
                                'You have answered all questions. Submit your test for grading?'
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">Answered</span>
                                <p className="font-semibold tabular-nums">{answeredCount} / {totalQuestions}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Time spent</span>
                                <p className="font-semibold tabular-nums">{formatTime(elapsed)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total marks</span>
                                <p className="font-semibold tabular-nums">{totalMarks}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Pass mark</span>
                                <p className="font-semibold tabular-nums">{test.pass_mark}%</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting}>
                            Keep answering
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                            Confirm submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PlatformLayout>
    );
}
