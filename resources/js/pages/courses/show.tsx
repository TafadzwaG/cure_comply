import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, useForm } from '@inertiajs/react';
import { BookOpen, ChevronRight, FileText, ImagePlus, Layers3, Loader2, Pencil, PlaySquare, ShieldCheck, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Lesson {
    id: number;
    title: string;
    status: string;
    content_type?: string | null;
}

interface Module {
    id: number;
    title: string;
    lessons?: Lesson[];
}

interface Course {
    id: number;
    title: string;
    status: string;
    description?: string | null;
    estimated_minutes?: number | null;
    image_url?: string | null;
    modules?: Module[];
}

function StatusPill({ value }: { value: string }) {
    const styles: Record<string, string> = {
        published:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
        draft:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
        archived:
            'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
    };

    return (
        <Badge
            variant="outline"
            className={`capitalize font-medium ${styles[value?.toLowerCase()] ?? 'border-border bg-background text-foreground'}`}
        >
            {value}
        </Badge>
    );
}

function LessonTypeBadge({ value }: { value?: string | null }) {
    if (!value) {
        return (
            <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
                No content type
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className="border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
        >
            {value}
        </Badge>
    );
}

export default function CourseShow({ course, canManage }: { course: Course; canManage: boolean }) {
    const modules = course.modules ?? [];
    const lessonsCount = modules.reduce((total, module) => total + (module.lessons?.length ?? 0), 0);
    const [showEdit, setShowEdit] = useState(false);

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <Card className="overflow-hidden border-0 shadow-none">
                    <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {course.image_url && (
                                <img
                                    src={course.image_url}
                                    alt={course.title}
                                    className="h-32 w-48 shrink-0 rounded-xl border border-white/20 object-cover shadow-lg"
                                />
                            )}
                            <div className="max-w-3xl space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                        PrivacyCure Course Builder
                                    </Badge>
                                    <StatusPill value={course.status} />
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
                                    <p className="text-sm text-white/80">
                                        {course.description ??
                                            'Module and lesson builder view for the selected course.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                                        {modules.length} modules
                                    </Badge>
                                    <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                                        {lessonsCount} lessons
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {canManage && (
                                    <Button
                                        variant="outline"
                                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                                        onClick={() => setShowEdit(true)}
                                    >
                                        <Pencil className="size-4" />
                                        Edit course
                                    </Button>
                                )}
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                                >
                                    <Link href={route('courses.index')}>Back to Courses</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                            <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-[#0F2E52] dark:text-blue-200">
                                        Course Outline
                                    </CardTitle>
                                    <CardDescription>
                                        Expand modules to review lessons and content types.
                                    </CardDescription>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                >
                                    {modules.length} modules
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            {modules.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full space-y-3">
                                    {modules.map((module, index) => (
                                        <AccordionItem
                                            key={module.id}
                                            value={String(module.id)}
                                            className="overflow-hidden rounded-2xl border border-[#14417A]/10 px-0"
                                        >
                                            <AccordionTrigger className="px-5 py-4 hover:no-underline">
                                                <div className="flex items-center gap-3 text-left">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                                        <Layers3 className="h-4 w-4" />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium text-[#0F2E52] dark:text-blue-200">
                                                                {module.title}
                                                            </p>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                                            >
                                                                Module {index + 1}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {module.lessons?.length ?? 0} lessons
                                                        </p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="border-t border-border/60 px-5 pb-5 pt-4">
                                                <div className="flex flex-col gap-3">
                                                    {(module.lessons?.length ?? 0) > 0 ? (
                                                        module.lessons?.map((lesson, lessonIndex) => (
                                                            <div
                                                                key={lesson.id}
                                                                className="rounded-2xl border border-border/60 p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                                                            >
                                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                                            <PlaySquare className="h-4 w-4" />
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <p className="font-medium text-[#0F2E52] dark:text-blue-200">
                                                                                    {lesson.title}
                                                                                </p>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                                                                >
                                                                                    Lesson {lessonIndex + 1}
                                                                                </Badge>
                                                                            </div>

                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <LessonTypeBadge
                                                                                    value={lesson.content_type}
                                                                                />
                                                                                <StatusPill value={lesson.status} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                                                            No lessons have been added to this module yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <p className="mt-4 font-medium text-[#0F2E52] dark:text-blue-200">
                                        No modules added yet
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Start building the course outline by adding your first module.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-[#14417A]/15 shadow-none">
                            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                <CardTitle className="text-[#0F2E52] dark:text-blue-200">
                                    Course Summary
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4 p-6">
                                <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                        <Layers3 className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-[#0F2E52] dark:text-blue-200">Modules</p>
                                        <p className="text-sm text-muted-foreground">
                                            {modules.length} total modules in this course.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-[#0F2E52] dark:text-blue-200">Lessons</p>
                                        <p className="text-sm text-muted-foreground">
                                            {lessonsCount} total lessons across all modules.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-[#0F2E52] dark:text-blue-200">Status</p>
                                        <div className="pt-1">
                                            <StatusPill value={course.status} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#14417A]/15 shadow-none">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-[#0F2E52] dark:text-blue-200">
                                            Builder guidance
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Keep lessons grouped by topic, then publish the course only after
                                            reviewing module order, lesson status, and linked assessments.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {canManage && <EditCourseDialog course={course} open={showEdit} onOpenChange={setShowEdit} />}
        </PlatformLayout>
    );
}

function EditCourseDialog({
    course,
    open,
    onOpenChange,
}: {
    course: Course;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<{
        _method: string;
        title: string;
        description: string;
        status: string;
        estimated_minutes: number | '';
        image: File | null;
        remove_image: boolean;
    }>({
        _method: 'patch',
        title: course.title,
        description: course.description ?? '',
        status: course.status,
        estimated_minutes: course.estimated_minutes ?? '',
        image: null,
        remove_image: false,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleImageChange(file: File | null) {
        form.setData('image', file);
        form.setData('remove_image', false);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    const currentImage = preview ?? (form.data.remove_image ? null : course.image_url ?? null);

    function handleSubmit() {
        // Use POST + _method=patch so file upload works through Inertia
        form.post(route('courses.update', course.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>Update the course details and publishing status.</DialogDescription>
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
                            rows={4}
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            placeholder="Optional description for this course..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Course image</Label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                        />
                        {currentImage ? (
                            <div className="relative inline-block">
                                <img src={currentImage} alt="Preview" className="h-32 w-56 rounded-md border border-border/60 object-cover" />
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
                                className="flex h-32 w-56 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground hover:border-[#14417A]/40 hover:bg-[#14417A]/5"
                            >
                                <ImagePlus className="h-5 w-5" />
                                Upload image
                            </button>
                        )}
                        {form.errors.image && <p className="text-sm text-destructive">{form.errors.image}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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

                        <div className="space-y-2">
                            <Label htmlFor="estimated_minutes">Estimated minutes</Label>
                            <Input
                                id="estimated_minutes"
                                type="number"
                                min={1}
                                value={form.data.estimated_minutes}
                                onChange={(e) =>
                                    form.setData('estimated_minutes', e.target.value === '' ? '' : Number(e.target.value))
                                }
                                placeholder="e.g. 60"
                            />
                            {form.errors.estimated_minutes && (
                                <p className="text-sm text-destructive">{form.errors.estimated_minutes}</p>
                            )}
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