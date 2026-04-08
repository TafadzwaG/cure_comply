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
    ShieldCheck,
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
    image_url?: string | null;
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
    const [startedAt] = useState(() => new Date().toISOString());

    const currentQuestion = questions[currentIndex];
    const answeredCount = answers.size;
    const unansweredCount = totalQuestions - answeredCount;
    const progressPercent =
        totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    useEffect(() => {
        const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeRemaining = useMemo(() => {
        if (!test.time_limit_minutes) return null;
        return Math.max(0, test.time_limit_minutes * 60 - elapsed);
    }, [test.time_limit_minutes, elapsed]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleSubmit = useCallback(() => {
        setSubmitting(true);

        const payload = questions.map((question) => {
            const answer = answers.get(question.id);

            return {
                question_id: question.id,
                selected_option_id: answer?.selected_option_id ?? null,
                answer_text: answer?.answer_text ?? null,
            };
        });

        router.post(
            route('tests.attempts.store', test.id),
            { answers: payload, started_at: startedAt, time_spent_seconds: elapsed },
            {
                onFinish: () => setSubmitting(false),
            },
        );
    }, [answers, questions, test.id, startedAt, elapsed]);

    useEffect(() => {
        if (timeRemaining === 0) {
            handleSubmit();
        }
    }, [timeRemaining, handleSubmit]);

    function setOptionAnswer(questionId: number, optionId: number) {
        setAnswers((prev) => {
            const next = new Map(prev);
            next.set(questionId, {
                question_id: questionId,
                selected_option_id: optionId,
            });
            return next;
        });
    }

    function setTextAnswer(questionId: number, text: string) {
        setAnswers((prev) => {
            const next = new Map(prev);

            if (text.trim()) {
                next.set(questionId, {
                    question_id: questionId,
                    answer_text: text,
                });
            } else {
                next.delete(questionId);
            }

            return next;
        });
    }

    function goToQuestion(index: number) {
        if (index >= 0 && index < totalQuestions) {
            setCurrentIndex(index);
        }
    }

    function isAnswered(questionId: number) {
        return answers.has(questionId);
    }

    return (
        <PlatformLayout>
            <Head title={`Take Test: ${test.title}`} />

            <div className="space-y-6">
                <Card className="rounded-md border-border/60 shadow-none">
                    <CardContent className="rounded-md bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-3xl space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/10">
                                        Attempt {attemptNumber}
                                        {maxAttempts ? ` of ${maxAttempts}` : ''}
                                    </Badge>
                                    <Badge className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/10">
                                        {totalQuestions} questions
                                    </Badge>
                                    <Badge className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/10">
                                        {totalMarks} marks
                                    </Badge>
                                    <Badge className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/10">
                                        Pass {test.pass_mark}%
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-2xl font-semibold tracking-tight">{test.title}</h1>
                                    <p className="text-sm text-white/80">
                                        {test.description ?? 'Complete each question and submit your answers for grading.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium tabular-nums text-white">
                                    <Clock className="h-4 w-4" />
                                    {timeRemaining !== null ? formatTime(timeRemaining) : formatTime(elapsed)}
                                </div>

                                <div className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                                    <ShieldCheck className="h-4 w-4" />
                                    {answeredCount}/{totalQuestions} answered
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 space-y-2">
                            <div className="flex items-center justify-between text-xs text-white/80">
                                <span>Progress</span>
                                <span className="tabular-nums">{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2 bg-white/15" />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
                    <Card className="h-fit rounded-md border-border/60 shadow-none xl:sticky xl:top-20">
                        <CardHeader className="border-b border-border/60 pb-4">
                            <CardTitle className="text-base font-medium">Question Navigator</CardTitle>
                            <CardDescription>
                                Move between questions and review your completion progress.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((question, index) => {
                                    const answered = isAnswered(question.id);
                                    const active = index === currentIndex;

                                    return (
                                        <button
                                            key={question.id}
                                            type="button"
                                            onClick={() => goToQuestion(index)}
                                            className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium tabular-nums transition-colors ${
                                                active
                                                    ? 'border-[#14417A] bg-[#14417A] text-white'
                                                    : answered
                                                      ? 'border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A]'
                                                      : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/30'
                                            }`}
                                            aria-label={`Question ${index + 1}`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                                    <span className="text-sm text-muted-foreground">Answered</span>
                                    <span className="text-sm font-medium tabular-nums">{answeredCount}</span>
                                </div>

                                <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                                    <span className="text-sm text-muted-foreground">Unanswered</span>
                                    <span className="text-sm font-medium tabular-nums">{unansweredCount}</span>
                                </div>

                                <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                                    <span className="text-sm text-muted-foreground">Marks</span>
                                    <span className="text-sm font-medium tabular-nums">{totalMarks}</span>
                                </div>
                            </div>

                            <Separator />

                            <Button
                                type="button"
                                onClick={() => setShowConfirm(true)}
                                disabled={submitting}
                                className="w-full rounded-md bg-[#14417A] text-white hover:bg-[#0F2E52]"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Submit test
                            </Button>
                        </CardContent>
                    </Card>

                    {currentQuestion ? (
                        <Card className="rounded-md border-border/60 shadow-none">
                            <CardHeader className="border-b border-border/60">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="rounded-md">
                                                Question {currentIndex + 1} of {totalQuestions}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="rounded-md border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A]"
                                            >
                                                {currentQuestion.marks}{' '}
                                                {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-md capitalize">
                                                {currentQuestion.question_type.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <CardTitle className="text-xl font-medium">
                                                {currentQuestion.question_text}
                                            </CardTitle>

                                            {currentQuestion.image_url ? (
                                                <img
                                                    src={currentQuestion.image_url}
                                                    alt=""
                                                    className="max-h-72 rounded-md border border-border/60 object-contain"
                                                />
                                            ) : null}
                                        </div>
                                    </div>

                                    {isAnswered(currentQuestion.id) ? (
                                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#14417A]" />
                                    ) : (
                                        <Circle className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/40" />
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                {currentQuestion.question_type === 'single_choice' ? (
                                    <RadioGroup
                                        value={String(
                                            answers.get(currentQuestion.id)?.selected_option_id ?? '',
                                        )}
                                        onValueChange={(value) =>
                                            setOptionAnswer(currentQuestion.id, Number(value))
                                        }
                                        className="space-y-3"
                                    >
                                        {currentQuestion.options.map((option, optionIndex) => {
                                            const selected =
                                                answers.get(currentQuestion.id)?.selected_option_id === option.id;

                                            return (
                                                <Label
                                                    key={option.id}
                                                    htmlFor={`option-${option.id}`}
                                                    className={`flex cursor-pointer items-center gap-4 rounded-md border px-4 py-3 transition-colors ${
                                                        selected
                                                            ? 'border-[#14417A]/20 bg-[#14417A]/5'
                                                            : 'border-border/60 hover:bg-muted/30'
                                                    }`}
                                                >
                                                    <RadioGroupItem
                                                        value={String(option.id)}
                                                        id={`option-${option.id}`}
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground">
                                                            {String.fromCharCode(65 + optionIndex)}
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
                                            onChange={(e) =>
                                                setTextAnswer(currentQuestion.id, e.target.value)
                                            }
                                            className="min-h-[180px] rounded-md border-border/60 resize-y"
                                        />
                                    </div>
                                )}
                            </CardContent>

                            <Separator />

                            <CardContent className="flex items-center justify-between gap-4 p-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={currentIndex === 0}
                                    onClick={() => goToQuestion(currentIndex - 1)}
                                    className="rounded-md"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>

                                {currentIndex < totalQuestions - 1 ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => goToQuestion(currentIndex + 1)}
                                        className="rounded-md bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                    >
                                        Next
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setShowConfirm(true)}
                                        disabled={submitting}
                                        className="rounded-md bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit test
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            </div>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-md rounded-md border-border/60">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-[#14417A]" />
                            Submit test?
                        </DialogTitle>
                        <DialogDescription>
                            {unansweredCount > 0
                                ? `You still have ${unansweredCount} unanswered ${
                                      unansweredCount === 1 ? 'question' : 'questions'
                                  }. Unanswered questions will receive 0 marks.`
                                : 'You have answered all questions. Submit your test for grading?'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md border border-border/60 bg-muted/20 p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">Answered</span>
                                <p className="font-medium tabular-nums">
                                    {answeredCount} / {totalQuestions}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Time spent</span>
                                <p className="font-medium tabular-nums">{formatTime(elapsed)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total marks</span>
                                <p className="font-medium tabular-nums">{totalMarks}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Pass mark</span>
                                <p className="font-medium tabular-nums">{test.pass_mark}%</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowConfirm(false)}
                            disabled={submitting}
                            className="rounded-md"
                        >
                            Keep answering
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="rounded-md bg-[#14417A] text-white hover:bg-[#0F2E52]"
                        >
                            {submitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Confirm submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PlatformLayout>
    );
}