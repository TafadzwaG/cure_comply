import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    ImagePlus,
    Loader2,
    Pencil,
    PlayCircle,
    Plus,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';

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
}

interface Props {
    test: TestData;
    attempts: Attempt[];
    canTake: boolean;
    canManage: boolean;
    attemptsUsed: number;
    maxAttempts?: number | null;
    courses: Course[];
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

export default function TestShow({ test, attempts, canTake, canManage, attemptsUsed, maxAttempts, courses }: Props) {
    const totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);
    const bestAttempt = attempts.length > 0
        ? attempts.reduce((best, a) => (a.percentage > best.percentage ? a : best))
        : null;

    const [showDialog, setShowDialog] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [showEditTest, setShowEditTest] = useState(false);

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

            <div className="flex flex-col gap-5">
                <PageHeader
                    title={test.title}
                    description={test.description || 'Review the test structure, manage questions, and take the assessment.'}
                >
                    {canManage && (
                        <Button
                            variant="outline"
                            className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/20"
                            onClick={() => setShowEditTest(true)}
                        >
                            <Pencil className="size-4" />
                            Edit test
                        </Button>
                    )}
                    {canTake && (
                        <Button asChild className="rounded-md bg-white text-[#0F2E52] hover:bg-white/90">
                            <Link href={route('tests.attempts.create', test.id)}>
                                <PlayCircle className="size-4" />
                                Take test
                            </Link>
                        </Button>
                    )}
                </PageHeader>

                {/* Info cards */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard icon={<FileText className="size-4" />} label="Questions" value={String(test.questions.length)} detail={`${totalMarks} total marks`} />
                    <InfoCard icon={<Award className="size-4" />} label="Pass mark" value={`${test.pass_mark}%`} detail="Minimum score to pass" />
                    <InfoCard icon={<Clock className="size-4" />} label="Time limit" value={test.time_limit_minutes ? `${test.time_limit_minutes} min` : 'Unlimited'} detail={test.time_limit_minutes ? 'Timed assessment' : 'No time restriction'} />
                    <InfoCard icon={<GraduationCap className="size-4" />} label="Attempts" value={maxAttempts ? `${attemptsUsed}/${maxAttempts}` : `${attemptsUsed}`} detail={maxAttempts ? `${maxAttempts - attemptsUsed} remaining` : 'Unlimited retakes'} />
                </div>

                {/* Best score */}
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
                    {/* Attempts */}
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

                    {/* Question bank */}
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
                                <div className="flex items-center gap-2">
                                    <StatusBadge value={test.status} />
                                    {canManage && (
                                        <Button size="sm" onClick={openAdd}>
                                            <Plus className="size-4" />
                                            Add question
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {test.questions.length === 0 && (
                                <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-8 text-center">
                                    <FileText className="mx-auto size-10 text-muted-foreground/30" />
                                    <p className="mt-3 text-sm font-medium text-muted-foreground">No questions yet</p>
                                    <p className="mt-1 text-xs text-muted-foreground/70">Add questions to build this assessment.</p>
                                    {canManage && (
                                        <Button className="mt-4" size="sm" onClick={openAdd}>
                                            <Plus className="size-4" />
                                            Add first question
                                        </Button>
                                    )}
                                </div>
                            )}

                            {test.questions.map((question, idx) => (
                                <div key={question.id} className={`rounded-xl border p-4 ${question.is_active ? 'border-border/60' : 'border-border/40 bg-muted/20 opacity-60'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0 space-y-2">
                                                <p className="text-sm font-medium text-[#002753] dark:text-slate-100">
                                                    {question.question_text}
                                                </p>
                                                {question.image_url && (
                                                    <img
                                                        src={question.image_url}
                                                        alt=""
                                                        className="max-h-40 rounded-lg border border-border/60 object-contain"
                                                    />
                                                )}
                                                {question.question_type === 'single_choice' && question.options.length > 0 && (
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
                                                                {option.is_correct && <CheckCircle2 className="size-3" />}
                                                                {option.option_text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {!question.is_active && (
                                                    <Badge variant="outline" className="rounded-full text-[10px] text-amber-600">Inactive</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                                                {question.question_type.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant="secondary" className="rounded-full tabular-nums">
                                                {question.marks}m
                                            </Badge>
                                            {canManage && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(question)}>
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(question.id)}
                                                        disabled={deleting === question.id}
                                                    >
                                                        {deleting === question.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {canManage && (
                <>
                    <QuestionDialog
                        testId={test.id}
                        open={showDialog}
                        onOpenChange={setShowDialog}
                        question={editingQuestion}
                    />
                    <EditTestDialog
                        test={test}
                        courses={courses}
                        open={showEditTest}
                        onOpenChange={setShowEditTest}
                    />
                </>
            )}
        </PlatformLayout>
    );
}

/* ───── Edit test dialog ───── */

function EditTestDialog({
    test,
    courses,
    open,
    onOpenChange,
}: {
    test: TestData;
    courses: Course[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm({
        course_id: test.course?.id ? String(test.course.id) : '',
        title: test.title,
        description: test.description ?? '',
        pass_mark: test.pass_mark,
        time_limit_minutes: test.time_limit_minutes ?? '',
        max_attempts: test.max_attempts ?? 1,
        status: test.status,
    });

    function handleSubmit() {
        form.patch(route('tests.update', test.id), {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Test</DialogTitle>
                    <DialogDescription>Update the test details, scoring, and availability.</DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        {form.errors.title && <p className="text-sm text-destructive">{form.errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            rows={3}
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            placeholder="Optional description for this test..."
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select
                                value={form.data.course_id || 'none'}
                                onValueChange={(v) => form.setData('course_id', v === 'none' ? '' : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Standalone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Standalone (no course)</SelectItem>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.data.status} onValueChange={(v) => form.setData('status', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="pass_mark">Pass mark (%)</Label>
                            <Input
                                id="pass_mark"
                                type="number"
                                min={0}
                                max={100}
                                value={form.data.pass_mark}
                                onChange={(e) => form.setData('pass_mark', Number(e.target.value))}
                            />
                            {form.errors.pass_mark && <p className="text-sm text-destructive">{form.errors.pass_mark}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time_limit_minutes">Time limit (min)</Label>
                            <Input
                                id="time_limit_minutes"
                                type="number"
                                min={1}
                                value={form.data.time_limit_minutes}
                                onChange={(e) =>
                                    form.setData('time_limit_minutes', e.target.value === '' ? '' : Number(e.target.value))
                                }
                                placeholder="Unlimited"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_attempts">Max attempts</Label>
                            <Input
                                id="max_attempts"
                                type="number"
                                min={1}
                                value={form.data.max_attempts}
                                onChange={(e) => form.setData('max_attempts', Number(e.target.value))}
                            />
                            {form.errors.max_attempts && <p className="text-sm text-destructive">{form.errors.max_attempts}</p>}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={form.processing}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={form.processing}>
                        {form.processing && <Loader2 className="size-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ───── Question add/edit dialog ───── */

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
                  options: question.options.map((o) => ({
                      id: o.id,
                      option_text: o.option_text,
                      is_correct: o.is_correct,
                  })),
              }
            : { ...emptyQuestion, options: emptyQuestion.options.map((o) => ({ ...o })) },
    );

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleImageChange(file: File | null) {
        form.setData('image', file);
        form.setData('remove_image', false);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    const currentImage = preview ?? (form.data.remove_image ? null : question?.image_url ?? null);

    // Reset form when dialog opens with new question context
    const [lastQuestionId, setLastQuestionId] = useState<number | null>(null);
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
                options: question.options.map((o) => ({
                    id: o.id,
                    option_text: o.option_text,
                    is_correct: o.is_correct,
                })),
            });
        } else {
            form.setData({
                ...emptyQuestion,
                options: emptyQuestion.options.map((o) => ({ ...o })),
            });
        }
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function addOption() {
        form.setData('options', [...form.data.options, { option_text: '', is_correct: false }]);
    }

    function removeOption(index: number) {
        form.setData('options', form.data.options.filter((_, i) => i !== index));
    }

    function updateOption(index: number, patch: Partial<OptionFormData>) {
        form.setData(
            'options',
            form.data.options.map((o, i) => (i === index ? { ...o, ...patch } : o)),
        );
    }

    function setCorrectOption(index: number) {
        form.setData(
            'options',
            form.data.options.map((o, i) => ({ ...o, is_correct: i === index })),
        );
    }

    function handleSubmit() {
        if (isEdit && question) {
            // Use POST + _method=patch so file upload works through Inertia
            form.transform((data) => ({ ...data, _method: 'patch' }));
            form.post(route('tests.questions.update', [testId, question.id]), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });
        } else {
            form.post(route('tests.questions.store', testId), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                },
            });
        }
    }

    const isSingleChoice = form.data.question_type === 'single_choice';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Question' : 'Add Question'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the question details and answer options.' : 'Create a new question with answer options for this test.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Question text */}
                    <div className="space-y-2">
                        <Label htmlFor="question_text">Question</Label>
                        <Textarea
                            id="question_text"
                            rows={3}
                            value={form.data.question_text}
                            onChange={(e) => form.setData('question_text', e.target.value)}
                            placeholder="Enter the question text..."
                        />
                        {form.errors.question_text && <p className="text-sm text-destructive">{form.errors.question_text}</p>}
                    </div>

                    {/* Image upload */}
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
                                        if (preview) URL.revokeObjectURL(preview);
                                        setPreview(null);
                                        form.setData('image', null);
                                        form.setData('remove_image', true);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
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
                                Upload image (JPG, PNG, WEBP — max 4MB)
                            </button>
                        )}
                        {form.errors.image && <p className="text-sm text-destructive">{form.errors.image}</p>}
                    </div>

                    {/* Type + Marks row */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Question type</Label>
                            <Select value={form.data.question_type} onValueChange={(v) => form.setData('question_type', v)}>
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
                            <Label htmlFor="is_active" className="text-sm">Active</Label>
                        </div>
                    </div>

                    {/* Options (for single_choice) */}
                    {isSingleChoice && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Answer options</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                    <Plus className="size-3.5" />
                                    Add option
                                </Button>
                            </div>

                            {form.data.options.length === 0 && (
                                <p className="text-sm text-muted-foreground">Add at least 2 options for a single choice question.</p>
                            )}

                            <div className="space-y-2">
                                {form.data.options.map((option, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
                                            {String.fromCharCode(65 + idx)}
                                        </span>

                                        <Input
                                            value={option.option_text}
                                            onChange={(e) => updateOption(idx, { option_text: e.target.value })}
                                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                            className="flex-1"
                                        />

                                        <Button
                                            type="button"
                                            variant={option.is_correct ? 'default' : 'outline'}
                                            size="sm"
                                            className={`shrink-0 ${option.is_correct ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                            onClick={() => setCorrectOption(idx)}
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
                                            onClick={() => removeOption(idx)}
                                            disabled={form.data.options.length <= 2}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {form.data.options.length > 0 && !form.data.options.some((o) => o.is_correct) && (
                                <p className="text-sm text-amber-600">Mark one option as the correct answer.</p>
                            )}
                        </div>
                    )}

                    {!isSingleChoice && (
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                            <p className="text-sm text-muted-foreground">
                                Text questions require manual review. The answer will be collected as free-form text and marked as pending review.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={form.processing}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={form.processing}>
                        {form.processing && <Loader2 className="size-4 animate-spin" />}
                        {isEdit ? 'Save changes' : 'Add question'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ───── sub-components ───── */

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
