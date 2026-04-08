import { BrandCard } from '@/components/brand-card';
import { EmptyState } from '@/components/empty-state';
import { IconChip } from '@/components/icon-chip';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Clock3,
    FileText,
    FolderUp,
    Grip,
    ImagePlus,
    Layers3,
    Loader2,
    Pencil,
    PlayCircle,
    Plus,
    Rocket,
    Save,
    Settings2,
    ShieldCheck,
    Sparkles,
    Trash2,
    Video,
    X,
} from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';

interface Lesson {
    id: number;
    title: string;
    status: string;
    content_type?: string | null;
    content_body?: string | null;
    video_url?: string | null;
    embed_url?: string | null;
    file_url?: string | null;
    estimated_minutes?: number | null;
    sort_order?: number | null;
}

interface Module {
    id: number;
    title: string;
    description?: string | null;
    sort_order?: number | null;
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

const lessonTypeOptions = [
    { value: 'text', label: 'Text lesson', icon: FileText },
    { value: 'video', label: 'Video lesson', icon: Video },
    { value: 'file', label: 'File lesson', icon: FolderUp },
] as const;

export default function CourseShow({ course, canManage }: { course: Course; canManage: boolean }) {
    const modules = course.modules ?? [];
    const lessons = modules.flatMap((module) => module.lessons ?? []);
    const lessonsCount = lessons.length;
    const modulesWithLessons = modules.filter((module) => (module.lessons?.length ?? 0) > 0).length;
    const lessonCoverage = modules.length ? Math.round((modulesWithLessons / modules.length) * 100) : 0;
    const averageLessonsPerModule = modules.length ? (lessonsCount / modules.length).toFixed(1) : '0.0';
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const publishForm = useForm({});
    const defaultTab = useMemo(() => {
        if (typeof window === 'undefined') {
            return 'overview';
        }

        return new URLSearchParams(window.location.search).get('tab') ?? 'overview';
    }, []);

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title={course.title}
                    description={
                        course.description ??
                        'Build the course structure, configure lessons, and prepare content for assignment from one workspace.'
                    }
                >
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Course builder
                    </Badge>
                </PageHeader>

                <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
                    <Card className="border-border/70 bg-card shadow-none">
                        <CardContent className="space-y-6 p-6">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                                <div className="space-y-3">
                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                        Builder workspace
                                    </Badge>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-semibold tracking-tight">
                                            Shape the course shell, then build modules and lesson content
                                        </h2>
                                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                            Use the same workspace to define module order, add lesson content, attach files, and embed trusted videos for playback.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <TopMetricCard label="Modules" value={modules.length} icon={Layers3} />
                                    <TopMetricCard label="Lessons" value={lessonsCount} icon={FileText} />
                                    <TopMetricCard label="Coverage" value={`${lessonCoverage}%`} icon={ShieldCheck} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <SummaryCard label="Duration" value={`${course.estimated_minutes ?? 0} mins`} detail="Estimated learner time" icon={<Clock3 className="size-4" />} />
                                <SummaryCard label="Build coverage" value={`${lessonCoverage}%`} detail="Modules with at least one lesson" icon={<ShieldCheck className="size-4" />} />
                                <SummaryCard label="Lesson density" value={averageLessonsPerModule} detail="Average lessons per module" icon={<Grip className="size-4" />} />
                                <SummaryCard label="Status" value={toTitleCase(course.status)} detail="Current publishing state" icon={<Sparkles className="size-4" />} />
                            </div>
                        </CardContent>
                    </Card>

                    <BrandCard
                        title="Builder rail"
                        description="Keep the course ready for assignment while you build."
                        className="bg-muted/20"
                        headerRight={<IconChip icon={<Settings2 className="size-4" />} className="border border-border/70 bg-background p-2.5 text-foreground" />}
                    >
                        <div className="space-y-4">
                            <InsightRow icon={Layers3} title="Start with modules" description="Set module order first so lesson content stays organized by topic." />
                            <InsightRow icon={Video} title="Embed trusted videos" description="YouTube and Vimeo links are normalized safely and rendered inside the course builder." />
                            <InsightRow icon={FolderUp} title="Attach supporting files" description="Use file lessons for worksheets, PDFs, and downloadable supporting material." />
                            <InsightRow icon={ShieldCheck} title="Publish last" description="Keep courses in draft until module coverage, lessons, and content quality are ready." />
                        </div>
                    </BrandCard>
                </section>

                <Tabs defaultValue={defaultTab} className="space-y-4">
                    <TabsList className="h-auto w-full justify-start rounded-lg border border-border bg-muted/40 p-1">
                        <TabsTrigger value="overview" className="rounded-md px-4 py-2">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="modules" className="rounded-md px-4 py-2">
                            Modules & lessons
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-md px-4 py-2">
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                            <BrandCard
                                title="Course readiness"
                                description="Track how much of the course structure is already in place."
                                headerRight={<Badge variant="outline">{modulesWithLessons} of {modules.length} modules active</Badge>}
                            >
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#002753] dark:text-white">Module coverage</span>
                                            <span className="tabular-nums text-[#434750] dark:text-neutral-400">{lessonCoverage}%</span>
                                        </div>
                                        <Progress className="h-2 bg-[#e6e8ea]" value={lessonCoverage} />
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        <OverviewTile label="Modules" value={`${modules.length}`} detail="Structured course sections" />
                                        <OverviewTile label="Lessons" value={`${lessonsCount}`} detail="Learning items in total" />
                                        <OverviewTile label="Duration" value={`${course.estimated_minutes ?? 0} mins`} detail="Estimated learner time" />
                                    </div>
                                </div>
                            </BrandCard>

                            <BrandCard
                                title="Quick actions"
                                description="Jump directly to the main builder steps."
                                headerRight={<IconChip icon={<BookOpen className="size-4" />} />}
                            >
                                <div className="grid gap-3">
                                    <Button asChild className="justify-start gap-2">
                                        <Link href={route('courses.show', { course: course.id, tab: 'modules' })}>
                                            <Plus className="size-4" />
                                            Build modules and lessons
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="justify-start gap-2">
                                        <Link href={route('tests.create')}>
                                            <ShieldCheck className="size-4" />
                                            Create linked assessment
                                        </Link>
                                    </Button>
                                    {canManage && course.status !== 'published' ? (
                                        <Button type="button" variant="outline" className="justify-start gap-2" onClick={() => setPublishDialogOpen(true)}>
                                            <Rocket className="size-4" />
                                            Publish course
                                        </Button>
                                    ) : null}
                                    <Button asChild variant="outline" className="justify-start gap-2">
                                        <Link href={route('courses.index')}>
                                            <BookOpen className="size-4" />
                                            Return to course library
                                        </Link>
                                    </Button>
                                </div>
                            </BrandCard>
                        </section>

                        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                            <BrandCard
                                title="Module sequence"
                                description="Current module order and lesson counts."
                                headerRight={<Badge variant="outline">{modules.length} modules</Badge>}
                            >
                                <div className="space-y-3">
                                    {modules.length ? (
                                        modules.map((module, index) => (
                                            <div key={module.id} className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                                                <IconChip icon={<Layers3 className="size-4" />} className="mt-0.5" />
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-medium text-[#002753] dark:text-white">{module.title}</p>
                                                        <Badge variant="outline">Module {index + 1}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{module.description || 'No module summary yet.'}</p>
                                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                        {module.lessons?.length ?? 0} lessons
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState
                                            icon={Layers3}
                                            title="No modules yet"
                                            description="Create the first module to start structuring the course."
                                            action={canManage ? { label: 'Open builder tab', href: route('courses.show', { course: course.id, tab: 'modules' }) } : undefined}
                                        />
                                    )}
                                </div>
                            </BrandCard>

                            <BrandCard
                                title="Lesson type coverage"
                                description="Balance written content, embedded videos, and file-based lessons."
                                headerRight={<IconChip icon={<Video className="size-4" />} />}
                            >
                                <div className="space-y-4">
                                    {lessonTypeOptions.map(({ value, label, icon: Icon }) => {
                                        const count = lessons.filter((lesson) => lesson.content_type === value).length;
                                        const percent = lessonsCount ? Math.round((count / lessonsCount) * 100) : 0;

                                        return (
                                            <div key={value} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="inline-flex items-center gap-2 text-[#002753] dark:text-white">
                                                        <Icon className="size-4" />
                                                        {label}
                                                    </span>
                                                    <span className="tabular-nums text-muted-foreground">{count}</span>
                                                </div>
                                                <Progress className="h-2 bg-[#e6e8ea]" value={percent} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </BrandCard>
                        </section>
                    </TabsContent>

                    <TabsContent value="modules" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
                            <BrandCard
                                title="Module and lesson builder"
                                description="Create modules, then add text, video, or file-based lessons inside each one."
                                headerRight={<Badge variant="outline">{lessonsCount} lessons</Badge>}
                            >
                                <div className="space-y-6">
                                    {canManage ? <ModuleCreateForm courseId={course.id} nextSortOrder={(modules.at(-1)?.sort_order ?? modules.length) + 1} /> : null}

                                    {modules.length ? (
                                        modules.map((module) => (
                                            <ModuleBuilderCard key={module.id} courseId={course.id} module={module} canManage={canManage} />
                                        ))
                                    ) : (
                                        <EmptyState
                                            icon={Layers3}
                                            title="No modules added"
                                            description="Start by creating the first module, then add lesson content underneath it."
                                        />
                                    )}
                                </div>
                            </BrandCard>

                            <div className="space-y-4">
                                <BrandCard
                                    title="Builder guidance"
                                    description="Use this as the content checklist while building."
                                    headerRight={<IconChip icon={<Sparkles className="size-4" />} />}
                                >
                                    <div className="space-y-4">
                                        <GuidanceStep title="1. Define module order" description="Set the teaching sequence first, then place lessons under the right module." />
                                        <GuidanceStep title="2. Choose the right lesson type" description="Use text for written guidance, video for embedded walkthroughs, and file for downloadable resources." />
                                        <GuidanceStep title="3. Keep duration realistic" description="Estimated minutes should reflect the learner effort required for each lesson." />
                                        <GuidanceStep title="4. Publish after review" description="Only move to published once content is complete and lesson coverage looks balanced." />
                                    </div>
                                </BrandCard>

                                <BrandCard
                                    title="Current coverage"
                                    description="A quick operational snapshot while you build."
                                    headerRight={<IconChip icon={<ShieldCheck className="size-4" />} />}
                                >
                                    <div className="space-y-4">
                                        <CoverageRow label="Modules with lessons" value={`${modulesWithLessons}/${modules.length}`} />
                                        <CoverageRow label="Average lessons per module" value={averageLessonsPerModule} />
                                        <CoverageRow label="Published state" value={toTitleCase(course.status)} />
                                    </div>
                                </BrandCard>
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                            <BrandCard
                                title="Course settings"
                                description="Update the course shell, status, duration, and visual identity."
                                headerRight={<IconChip icon={<Pencil className="size-4" />} />}
                            >
                                <CourseSettingsForm course={course} />
                            </BrandCard>

                            <BrandCard
                                title="Publishing notes"
                                description="Recommended controls before assigning this course."
                                headerRight={<Badge variant="outline">{toTitleCase(course.status)}</Badge>}
                            >
                                <div className="space-y-4">
                                    <InsightRow icon={BookOpen} title="Course shell" description="Keep the title and course summary tight so admins understand assignment purpose." />
                                    <InsightRow icon={ShieldCheck} title="Publishing state" description="Draft keeps incomplete content out of active assignment and reporting flows." />
                                    <InsightRow icon={ImagePlus} title="Visual identity" description="A course image helps the course stand out inside learning and assignment surfaces." />
                                </div>
                            </BrandCard>
                        </section>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Publish this course?</DialogTitle>
                        <DialogDescription>
                            Publishing makes this course available for assignment and surfaces it more broadly across learning flows. Make sure the
                            module structure and lessons are ready.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                            <IconChip icon={<Rocket className="size-4" />} className="mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-medium text-[#002753] dark:text-white">{course.title}</p>
                                <p>
                                    {modules.length} modules, {lessonsCount} lessons, {lessonCoverage}% module coverage.
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
                                publishForm.post(route('courses.publish', { course: course.id }), {
                                    preserveScroll: true,
                                    onSuccess: () => setPublishDialogOpen(false),
                                })
                            }
                        >
                            {publishForm.processing ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                            Publish course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PlatformLayout>
    );
}

function ModuleCreateForm({ courseId, nextSortOrder }: { courseId: number; nextSortOrder: number }) {
    const form = useForm({
        title: '',
        description: '',
        sort_order: nextSortOrder,
    });

    return (
        <Card className="border-border/70 bg-muted/20 shadow-none">
            <CardHeader>
                <CardTitle className="text-base font-medium">Add module</CardTitle>
                <CardDescription>Create the next structural section for this course.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                    <Field label="Module title" error={form.errors.title}>
                        <Input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} placeholder="e.g. POPIA fundamentals" />
                    </Field>
                    <Field label="Sort order" error={form.errors.sort_order}>
                        <Input type="number" min={1} value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} />
                    </Field>
                </div>

                <Field label="Description" error={form.errors.description}>
                    <Textarea rows={3} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} placeholder="Optional summary for what this module covers." />
                </Field>

                <Button
                    type="button"
                    disabled={form.processing}
                    onClick={() =>
                        form.post(route('courses.modules.store', { course: courseId }), {
                            preserveScroll: true,
                            onSuccess: () => form.reset('title', 'description'),
                        })
                    }
                >
                    {form.processing ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    Add module
                </Button>
            </CardContent>
        </Card>
    );
}

function ModuleBuilderCard({ courseId, module, canManage }: { courseId: number; module: Module; canManage: boolean }) {
    const form = useForm({
        _method: 'patch',
        title: module.title,
        description: module.description ?? '',
        sort_order: module.sort_order ?? 1,
    });

    return (
        <Card className="border-border/70 shadow-none">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.04] to-transparent">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <IconChip icon={<Layers3 className="size-4" />} />
                            <CardTitle className="text-base font-medium">{module.title}</CardTitle>
                        </div>
                        <CardDescription>{module.lessons?.length ?? 0} lessons inside this module.</CardDescription>
                    </div>

                    {canManage ? (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={form.processing}
                                onClick={() =>
                                    form.post(route('courses.modules.update', { course: courseId, module: module.id }), {
                                        preserveScroll: true,
                                    })
                                }
                            >
                                {form.processing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                Save
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                                onClick={() => {
                                    if (confirm('Delete this module and its lessons?')) {
                                        form.delete(route('courses.modules.destroy', { course: courseId, module: module.id }), {
                                            preserveScroll: true,
                                        });
                                    }
                                }}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        </div>
                    ) : null}
                </div>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
                <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                    <Field label="Module title" error={form.errors.title}>
                        <Input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />
                    </Field>
                    <Field label="Sort order" error={form.errors.sort_order}>
                        <Input type="number" min={1} value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} />
                    </Field>
                </div>

                <Field label="Description" error={form.errors.description}>
                    <Textarea rows={3} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                </Field>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-[#002753] dark:text-white">Lessons</h4>
                        <Badge variant="outline">{module.lessons?.length ?? 0}</Badge>
                    </div>

                    {(module.lessons?.length ?? 0) > 0 ? (
                        <div className="space-y-4">
                            {module.lessons?.map((lesson) => (
                                <LessonEditorCard key={lesson.id} courseId={courseId} moduleId={module.id} lesson={lesson} canManage={canManage} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={FileText} title="No lessons yet" description="Add the first lesson below to start filling this module with content." />
                    )}

                    {canManage ? <LessonCreateForm courseId={courseId} moduleId={module.id} nextSortOrder={(module.lessons?.at(-1)?.sort_order ?? module.lessons?.length ?? 0) + 1} /> : null}
                </div>
            </CardContent>
        </Card>
    );
}

function LessonCreateForm({ courseId, moduleId, nextSortOrder }: { courseId: number; moduleId: number; nextSortOrder: number }) {
    const form = useForm<LessonFormData>({
        title: '',
        content_type: 'text',
        content_body: '',
        video_url: '',
        file: null,
        remove_file: false,
        estimated_minutes: 10,
        sort_order: nextSortOrder,
        status: 'draft',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <Card className="border-dashed border-border/70 bg-muted/20 shadow-none">
            <CardHeader>
                <CardTitle className="text-base font-medium">Add lesson</CardTitle>
                <CardDescription>Create a text, video, or file-based lesson inside this module.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <LessonFields form={form} fileInputRef={fileInputRef} />

                <Button
                    type="button"
                    disabled={form.processing}
                    onClick={() =>
                        form.post(route('courses.modules.lessons.store', { course: courseId, module: moduleId }), {
                            forceFormData: true,
                            preserveScroll: true,
                            onSuccess: () => {
                                form.reset('title', 'content_body', 'video_url', 'file', 'remove_file');
                                form.setData('content_type', 'text');
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            },
                        })
                    }
                >
                    {form.processing ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    Add lesson
                </Button>
            </CardContent>
        </Card>
    );
}

function LessonEditorCard({
    courseId,
    moduleId,
    lesson,
    canManage,
}: {
    courseId: number;
    moduleId: number;
    lesson: Lesson;
    canManage: boolean;
}) {
    const form = useForm<LessonFormData>({
        _method: 'patch',
        title: lesson.title,
        content_type: normalizeLessonType(lesson.content_type),
        content_body: lesson.content_body ?? '',
        video_url: lesson.video_url ?? '',
        file: null,
        remove_file: false,
        estimated_minutes: lesson.estimated_minutes ?? 10,
        sort_order: lesson.sort_order ?? 1,
        status: lesson.status as 'draft' | 'published',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <IconChip icon={renderLessonTypeIcon(form.data.content_type)} />
                    <div>
                        <p className="text-sm font-medium text-[#002753] dark:text-white">{lesson.title}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Lesson #{lesson.sort_order ?? 1}</p>
                    </div>
                </div>

                {canManage ? (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={form.processing}
                            onClick={() =>
                                form.post(route('courses.modules.lessons.update', { course: courseId, module: moduleId, lesson: lesson.id }), {
                                    forceFormData: true,
                                    preserveScroll: true,
                                })
                            }
                        >
                            {form.processing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => {
                                if (confirm('Delete this lesson?')) {
                                    form.delete(route('courses.modules.lessons.destroy', { course: courseId, module: moduleId, lesson: lesson.id }), {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </div>
                ) : null}
            </div>

            <div className="space-y-4">
                <LessonFields form={form} fileInputRef={fileInputRef} existingFileUrl={lesson.file_url} />
                <LessonPreview lesson={lesson} form={form} />
            </div>
        </div>
    );
}

function LessonFields({
    form,
    fileInputRef,
    existingFileUrl,
}: {
    form: ReturnType<typeof useForm<LessonFormData>>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    existingFileUrl?: string | null;
}) {
    const currentType = form.data.content_type;

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <Field label="Lesson title" error={form.errors.title}>
                    <Input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} placeholder="e.g. Handling personal information requests" />
                </Field>
                <Field label="Lesson type" error={form.errors.content_type}>
                    <Select value={form.data.content_type} onValueChange={(value) => form.setData('content_type', value as LessonFormData['content_type'])}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {lessonTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Field label="Minutes" error={form.errors.estimated_minutes}>
                    <Input type="number" min={1} value={form.data.estimated_minutes} onChange={(event) => form.setData('estimated_minutes', Number(event.target.value))} />
                </Field>
                <Field label="Sort order" error={form.errors.sort_order}>
                    <Input type="number" min={1} value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} />
                </Field>
                <Field label="Status" error={form.errors.status}>
                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value as LessonFormData['status'])}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
            </div>

            {currentType === 'text' ? (
                <Field label="Lesson content" error={form.errors.content_body}>
                    <Textarea rows={6} value={form.data.content_body} onChange={(event) => form.setData('content_body', event.target.value)} placeholder="Write the lesson narrative, guidance, and instructions here." />
                </Field>
            ) : null}

            {currentType === 'video' ? (
                <Field label="Trusted video link" error={form.errors.video_url}>
                    <Input value={form.data.video_url} onChange={(event) => form.setData('video_url', event.target.value)} placeholder="Paste a YouTube or Vimeo link" />
                </Field>
            ) : null}

            {currentType === 'file' ? (
                <Field label="Attachment" error={form.errors.file}>
                    <div className="space-y-3">
                        <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)} />

                        {form.data.file ? (
                            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-[#002753] dark:text-white">{form.data.file.name}</p>
                                    <p className="text-xs text-muted-foreground">Selected for upload</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        form.setData('file', null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                >
                                    <X className="size-4" />
                                    Clear
                                </Button>
                            </div>
                        ) : existingFileUrl && !form.data.remove_file ? (
                            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                                <Button asChild variant="outline" size="sm">
                                    <a href={existingFileUrl} target="_blank" rel="noreferrer">
                                        <FileText className="size-4" />
                                        Open attached file
                                    </a>
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    <FolderUp className="size-4" />
                                    Replace file
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => form.setData('remove_file', true)}>
                                    <Trash2 className="size-4" />
                                    Remove file
                                </Button>
                            </div>
                        ) : form.data.remove_file ? (
                            <div className="flex items-center justify-between rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3">
                                <p className="text-sm text-muted-foreground">Attachment will be replaced on save.</p>
                                <Button type="button" variant="outline" size="sm" onClick={() => form.setData('remove_file', false)}>
                                    <X className="size-4" />
                                    Undo
                                </Button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground transition-colors hover:border-[#14417A]/40 hover:bg-[#14417A]/5"
                            >
                                <FolderUp className="h-5 w-5" />
                                Click to upload a file lesson attachment
                            </button>
                        )}
                    </div>
                </Field>
            ) : null}
        </div>
    );
}

function LessonPreview({ lesson, form }: { lesson: Lesson; form: ReturnType<typeof useForm<LessonFormData>> }) {
    const type = form.data.content_type;

    if (type === 'text' && form.data.content_body) {
        return (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Text preview</p>
                <div className="whitespace-pre-wrap text-sm leading-6 text-foreground">{form.data.content_body}</div>
            </div>
        );
    }

    if (type === 'video') {
        const src = normalizeEmbedUrl(form.data.video_url);

        return (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Video preview</p>
                {src ? (
                    <div className="overflow-hidden rounded-xl border border-border/70 bg-black">
                        <iframe
                            src={src}
                            title={form.data.title || lesson.title}
                            className="aspect-video w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Paste a valid YouTube or Vimeo link to preview the lesson video.</p>
                )}
            </div>
        );
    }

    if (type === 'file' && (lesson.file_url || form.data.file)) {
        return (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">File lesson</p>
                <div className="flex flex-wrap items-center gap-3">
                    {lesson.file_url ? (
                        <Button asChild variant="outline" size="sm">
                            <a href={lesson.file_url} target="_blank" rel="noreferrer">
                                <FileText className="size-4" />
                                Open current attachment
                            </a>
                        </Button>
                    ) : null}
                    {form.data.file ? <span className="text-sm text-muted-foreground">{form.data.file.name}</span> : null}
                </div>
            </div>
        );
    }

    return null;
}

function CourseSettingsForm({ course }: { course: Course }) {
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

    const currentImage = preview ?? (form.data.remove_image ? null : course.image_url ?? null);

    function handleImageChange(file: File | null) {
        form.setData('image', file);
        form.setData('remove_image', false);
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
                <Field label="Course title" error={form.errors.title}>
                    <Input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />
                </Field>
                <Field label="Estimated minutes" error={form.errors.estimated_minutes}>
                    <Input
                        type="number"
                        min={1}
                        value={form.data.estimated_minutes}
                        onChange={(event) => form.setData('estimated_minutes', event.target.value === '' ? '' : Number(event.target.value))}
                    />
                </Field>
            </div>

            <Field label="Description" error={form.errors.description}>
                <Textarea rows={5} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
            </Field>

            <Field label="Status" error={form.errors.status}>
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
            </Field>

            <Field label="Course image" error={form.errors.image}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
                />
                {currentImage ? (
                    <div className="relative inline-block">
                        <img src={currentImage} alt="Course preview" className="h-36 w-64 rounded-xl border border-border/70 object-cover" />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <ImagePlus className="size-4" />
                                Change
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    form.setData('image', null);
                                    form.setData('remove_image', true);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                            >
                                <Trash2 className="size-4" />
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-36 w-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground transition-colors hover:border-[#14417A]/40 hover:bg-[#14417A]/5"
                    >
                        <ImagePlus className="h-6 w-6" />
                        Upload course image
                    </button>
                )}
            </Field>

            <Button
                type="button"
                disabled={form.processing}
                onClick={() =>
                    form.post(route('courses.update', { course: course.id }), {
                        forceFormData: true,
                        preserveScroll: true,
                    })
                }
            >
                {form.processing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save course settings
            </Button>
        </div>
    );
}

function TopMetricCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Layers3 }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-[#002753] dark:text-white">{value}</p>
                </div>
                <IconChip icon={<Icon className="size-4" />} />
            </div>
        </div>
    );
}

function SummaryCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="text-lg font-medium tracking-tight text-[#002753] dark:text-white">{value}</p>
                    <p className="text-sm text-muted-foreground">{detail}</p>
                </div>
                <IconChip icon={icon} />
            </div>
        </div>
    );
}

function InsightRow({ icon: Icon, title, description }: { icon: typeof BookOpen; title: string; description: string }) {
    return (
        <div className="flex items-start gap-3">
            <IconChip icon={<Icon className="size-4" />} />
            <div className="space-y-1">
                <p className="text-sm font-medium text-[#002753] dark:text-white">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
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

function CoverageRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium tabular-nums text-[#002753] dark:text-white">{value}</span>
        </div>
    );
}

function OverviewTile({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-lg font-medium tracking-tight text-[#002753] dark:text-white">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

type LessonFormData = {
    _method?: string;
    title: string;
    content_type: 'text' | 'video' | 'file';
    content_body: string;
    video_url: string;
    file: File | null;
    remove_file: boolean;
    estimated_minutes: number;
    sort_order: number;
    status: 'draft' | 'published';
};

function renderLessonTypeIcon(type: LessonFormData['content_type']) {
    if (type === 'video') {
        return <PlayCircle className="size-4" />;
    }

    if (type === 'file') {
        return <FolderUp className="size-4" />;
    }

    return <FileText className="size-4" />;
}

function normalizeLessonType(type?: string | null): LessonFormData['content_type'] {
    return type === 'video' || type === 'file' ? type : 'text';
}

function normalizeEmbedUrl(url: string | null | undefined): string | null {
    if (!url) {
        return null;
    }

    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();

        if (host.includes('youtu.be')) {
            const id = parsed.pathname.replace(/\//g, '');
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }

        if (host.includes('youtube.com')) {
            const videoId = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).at(-1);
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }

        if (host.includes('vimeo.com')) {
            const id = parsed.pathname.split('/').filter(Boolean).at(-1);
            return id ? `https://player.vimeo.com/video/${id}` : null;
        }
    } catch {
        return null;
    }

    return null;
}

function toTitleCase(value: string) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}
