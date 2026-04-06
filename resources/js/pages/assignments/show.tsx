import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    FileText,
    Film,
    Loader2,
    PlayCircle,
    RotateCcw,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Lesson {
    id: number;
    title: string;
    content_type: string;
    content_body?: string | null;
    video_url?: string | null;
    file_path?: string | null;
    estimated_minutes?: number | null;
    sort_order: number;
    status: string;
}

interface Module {
    id: number;
    title: string;
    description?: string | null;
    sort_order: number;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    status: string;
    estimated_minutes?: number | null;
    modules: Module[];
}

interface Assignment {
    id: number;
    status: string;
    due_date?: string | null;
    assigned_at?: string | null;
    course: Course;
    assigned_to?: { id: number; name: string; email: string } | null;
    assigned_by?: { id: number; name: string } | null;
}

interface ProgressInfo {
    total: number;
    completed: number;
    percentage: number;
}

interface Props {
    assignment: Assignment;
    completedLessonIds: number[];
    progress: ProgressInfo;
}

const contentTypeIcon: Record<string, typeof FileText> = {
    text: FileText,
    video: Film,
    file: BookOpen,
};

export default function AssignmentShow({ assignment, completedLessonIds, progress }: Props) {
    const [activeLessonId, setActiveLessonId] = useState<number | null>(() => {
        // Default to first incomplete lesson
        for (const mod of assignment.course.modules) {
            for (const lesson of mod.lessons) {
                if (!completedLessonIds.includes(lesson.id)) {
                    return lesson.id;
                }
            }
        }
        // All done — show last lesson
        const lastModule = assignment.course.modules[assignment.course.modules.length - 1];
        const lastLesson = lastModule?.lessons[lastModule.lessons.length - 1];
        return lastLesson?.id ?? null;
    });

    const [processingLessonId, setProcessingLessonId] = useState<number | null>(null);

    const activeLesson = assignment.course.modules
        .flatMap((m) => m.lessons)
        .find((l) => l.id === activeLessonId);

    const isCompleted = (lessonId: number) => completedLessonIds.includes(lessonId);

    function markComplete(lessonId: number) {
        setProcessingLessonId(lessonId);
        router.post(
            route('assignments.progress.store', assignment.id),
            { lesson_id: lessonId },
            {
                preserveScroll: true,
                onFinish: () => setProcessingLessonId(null),
                onSuccess: () => {
                    // Auto-advance to next incomplete lesson
                    const allLessons = assignment.course.modules.flatMap((m) => m.lessons);
                    const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
                    for (let i = currentIdx + 1; i < allLessons.length; i++) {
                        if (!completedLessonIds.includes(allLessons[i].id) && allLessons[i].id !== lessonId) {
                            setActiveLessonId(allLessons[i].id);
                            return;
                        }
                    }
                },
            },
        );
    }

    function undoComplete(lessonId: number) {
        setProcessingLessonId(lessonId);
        router.delete(route('assignments.progress.destroy', assignment.id), {
            data: { lesson_id: lessonId },
            preserveScroll: true,
            onFinish: () => setProcessingLessonId(null),
        });
    }

    return (
        <PlatformLayout>
            <Head title={`${assignment.course.title} — Assignment`} />

            <div className="flex flex-col gap-5">
                {/* Header */}
                <PageHeader
                    title={assignment.course.title}
                    description={assignment.course.description || 'Work through the course modules and mark lessons as complete.'}
                >
                    <Link
                        href={route('assignments.index')}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to assignments
                    </Link>
                </PageHeader>

                {/* Progress + info strip */}
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <Card className="border-border/60 shadow-none">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base font-medium">Course Progress</CardTitle>
                                    <CardDescription>
                                        {progress.completed} of {progress.total} lessons completed
                                    </CardDescription>
                                </div>
                                <span className="text-2xl font-semibold tabular-nums text-[#002753] dark:text-slate-100">
                                    {progress.percentage}%
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Progress value={progress.percentage} className="h-3" />
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-none">
                        <CardContent className="flex flex-wrap items-center gap-5 p-5">
                            <InfoChip icon={<StatusBadge value={assignment.status} />} label="Status" />
                            {assignment.due_date && (
                                <InfoChip
                                    icon={<Calendar className="size-4 text-muted-foreground" />}
                                    label={`Due ${assignment.due_date}`}
                                />
                            )}
                            {assignment.assigned_to && (
                                <InfoChip
                                    icon={<User className="size-4 text-muted-foreground" />}
                                    label={assignment.assigned_to.name}
                                />
                            )}
                            {assignment.course.estimated_minutes && (
                                <InfoChip
                                    icon={<Clock className="size-4 text-muted-foreground" />}
                                    label={`~${assignment.course.estimated_minutes} min`}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main content: sidebar + lesson viewer */}
                <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
                    {/* Sidebar — module & lesson nav */}
                    <Card className="h-fit border-border/60 shadow-none xl:sticky xl:top-20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">Modules</CardTitle>
                            <CardDescription>{assignment.course.modules.length} modules in this course</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {assignment.course.modules.map((mod) => {
                                const modLessons = mod.lessons;
                                const modCompleted = modLessons.filter((l) => isCompleted(l.id)).length;
                                const modTotal = modLessons.length;
                                const allDone = modCompleted === modTotal && modTotal > 0;

                                return (
                                    <div key={mod.id} className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-[#002753] dark:text-slate-100">
                                                {mod.title}
                                            </h3>
                                            <Badge
                                                variant={allDone ? 'default' : 'secondary'}
                                                className="rounded-full text-[10px] tabular-nums"
                                            >
                                                {modCompleted}/{modTotal}
                                            </Badge>
                                        </div>

                                        {mod.description && (
                                            <p className="text-xs text-muted-foreground">{mod.description}</p>
                                        )}

                                        <div className="space-y-0.5">
                                            {modLessons.map((lesson) => {
                                                const done = isCompleted(lesson.id);
                                                const active = lesson.id === activeLessonId;
                                                const Icon = done ? CheckCircle2 : Circle;

                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => setActiveLessonId(lesson.id)}
                                                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                                            active
                                                                ? 'bg-[#d6e3ff]/50 font-medium text-[#002753] dark:bg-slate-800 dark:text-white'
                                                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Icon
                                                            className={`size-4 shrink-0 ${
                                                                done
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : active
                                                                      ? 'text-[#14417A] dark:text-blue-400'
                                                                      : 'text-muted-foreground/50'
                                                            }`}
                                                        />
                                                        <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                                                        {lesson.estimated_minutes && (
                                                            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                                                                {lesson.estimated_minutes}m
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {mod.id !== assignment.course.modules[assignment.course.modules.length - 1]?.id && (
                                            <Separator className="mt-2" />
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Lesson viewer */}
                    <Card className="border-border/60 shadow-none">
                        {activeLesson ? (
                            <>
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <LessonTypeIcon type={activeLesson.content_type} />
                                                <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                                                    {activeLesson.content_type}
                                                </Badge>
                                                {isCompleted(activeLesson.id) && (
                                                    <Badge className="rounded-full bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                        Completed
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl font-semibold tracking-tight text-[#002753] dark:text-slate-100">
                                                {activeLesson.title}
                                            </CardTitle>
                                            {activeLesson.estimated_minutes && (
                                                <CardDescription className="flex items-center gap-1.5">
                                                    <Clock className="size-3.5" />
                                                    Estimated {activeLesson.estimated_minutes} minutes
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <Separator />

                                <CardContent className="py-6">
                                    <LessonContent lesson={activeLesson} />
                                </CardContent>

                                <Separator />

                                <CardContent className="flex items-center justify-between gap-4 py-4">
                                    <NavigationButtons
                                        modules={assignment.course.modules}
                                        activeLessonId={activeLesson.id}
                                        onNavigate={setActiveLessonId}
                                    />

                                    <div className="flex items-center gap-2">
                                        {isCompleted(activeLesson.id) ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => undoComplete(activeLesson.id)}
                                                disabled={processingLessonId === activeLesson.id}
                                            >
                                                {processingLessonId === activeLesson.id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <RotateCcw className="size-4" />
                                                )}
                                                Undo completion
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => markComplete(activeLesson.id)}
                                                disabled={processingLessonId === activeLesson.id}
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                {processingLessonId === activeLesson.id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="size-4" />
                                                )}
                                                Mark as complete
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </>
                        ) : (
                            <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                                <BookOpen className="size-12 text-muted-foreground/30" />
                                <div>
                                    <p className="text-lg font-medium text-muted-foreground">No lessons available</p>
                                    <p className="mt-1 text-sm text-muted-foreground/70">
                                        This course does not have any published lessons yet.
                                    </p>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>
        </PlatformLayout>
    );
}

/* ───── sub-components ───── */

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            {icon}
            <span className="text-[#434750] dark:text-slate-400">{label}</span>
        </div>
    );
}

function LessonTypeIcon({ type }: { type: string }) {
    const Icon = contentTypeIcon[type] ?? FileText;
    return (
        <div className="rounded-lg bg-[#d6e3ff]/60 p-1.5 text-[#083d77] dark:bg-slate-800 dark:text-blue-400">
            <Icon className="size-4" />
        </div>
    );
}

function LessonContent({ lesson }: { lesson: Lesson }) {
    if (lesson.content_type === 'video' && lesson.video_url) {
        return (
            <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-border/60 bg-black">
                    {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? (
                        <iframe
                            src={toYouTubeEmbed(lesson.video_url)}
                            className="aspect-video w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={lesson.title}
                        />
                    ) : lesson.video_url.includes('vimeo.com') ? (
                        <iframe
                            src={toVimeoEmbed(lesson.video_url)}
                            className="aspect-video w-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={lesson.title}
                        />
                    ) : (
                        <video controls className="aspect-video w-full" src={lesson.video_url}>
                            <track kind="captions" />
                        </video>
                    )}
                </div>
                {lesson.content_body && (
                    <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: lesson.content_body }}
                    />
                )}
            </div>
        );
    }

    if (lesson.content_type === 'file' && lesson.file_path) {
        return (
            <div className="space-y-4">
                <a
                    href={lesson.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/60"
                >
                    <PlayCircle className="size-5 text-[#14417A]" />
                    Open attached file
                </a>
                {lesson.content_body && (
                    <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: lesson.content_body }}
                    />
                )}
            </div>
        );
    }

    // Default: text content
    if (lesson.content_body) {
        return (
            <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.content_body }}
            />
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <FileText className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No content available for this lesson yet.</p>
        </div>
    );
}

function NavigationButtons({
    modules,
    activeLessonId,
    onNavigate,
}: {
    modules: Module[];
    activeLessonId: number;
    onNavigate: (id: number) => void;
}) {
    const allLessons = modules.flatMap((m) => m.lessons);
    const currentIdx = allLessons.findIndex((l) => l.id === activeLessonId);
    const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
    const next = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={!prev} onClick={() => prev && onNavigate(prev.id)}>
                Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!next} onClick={() => next && onNavigate(next.id)}>
                Next
            </Button>
        </div>
    );
}

/* ───── helpers ───── */

function toYouTubeEmbed(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function toVimeoEmbed(url: string): string {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}
