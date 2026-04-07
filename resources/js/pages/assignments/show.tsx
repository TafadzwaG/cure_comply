import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import PlatformLayout from '@/layouts/platform-layout';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import moment from 'moment';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Circle,
    Clock,
    Eye,
    FileText,
    Film,
    Loader2,
    Mail,
    PlayCircle,
    RotateCcw,
    UserRound,
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

function ProgressDonut({ value, size = 96 }: { value: number; size?: number }) {
    const radius = (size - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
    const stroke = value >= 80 ? '#059669' : value >= 40 ? '#14417A' : '#94a3b8';
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className="absolute text-lg font-semibold text-[#0F2E52] dark:text-blue-200">
                {Math.round(value)}%
            </span>
        </div>
    );
}

export default function AssignmentShow({ assignment, completedLessonIds, progress }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isLearner = auth?.user?.id === assignment.assigned_to?.id;

    const [activeLessonId, setActiveLessonId] = useState<number | null>(() => {
        for (const mod of assignment.course.modules) {
            for (const lesson of mod.lessons) {
                if (!completedLessonIds.includes(lesson.id)) {
                    return lesson.id;
                }
            }
        }
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
        if (!isLearner) return;
        setProcessingLessonId(lessonId);
        router.post(
            route('assignments.progress.store', assignment.id),
            { lesson_id: lessonId },
            {
                preserveScroll: true,
                onFinish: () => setProcessingLessonId(null),
                onSuccess: () => {
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
        if (!isLearner) return;
        setProcessingLessonId(lessonId);
        router.delete(route('assignments.progress.destroy', assignment.id), {
            data: { lesson_id: lessonId },
            preserveScroll: true,
            onFinish: () => setProcessingLessonId(null),
        });
    }

    const initials = (assignment.assigned_to?.name ?? '?')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <PlatformLayout>
            <Head title={`${assignment.course.title} — Assignment`} />

            <div className="space-y-6">
                <PageHeader
                    title={assignment.course.title}
                    description={
                        isLearner
                            ? assignment.course.description || 'Work through the modules and mark lessons complete as you go.'
                            : `Tracking progress for ${assignment.assigned_to?.name ?? 'the learner'}.`
                    }
                >
                    <Button asChild size="sm" className="bg-white text-[#0F2E52] hover:bg-white/90 hover:text-black">
                        <Link href={route('assignments.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to assignments
                        </Link>
                    </Button>
                </PageHeader>

                {/* Hero strip */}
                <Card className="overflow-hidden border-0 shadow-none">
                    <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-5">
                                <ProgressDonut value={progress.percentage} />
                                <div className="space-y-1">
                                    <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                        {isLearner ? 'Your training' : 'Learner tracking'}
                                    </Badge>
                                    <div className="text-xl font-semibold tracking-tight">
                                        {progress.completed} / {progress.total} lessons completed
                                    </div>
                                    <p className="text-sm text-white/80">
                                        {assignment.course.modules.length} modules · {assignment.course.estimated_minutes
                                            ? `~${assignment.course.estimated_minutes} min total`
                                            : 'Self-paced'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge value={assignment.status} />
                                {assignment.due_date && (
                                    <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                        Due {moment(assignment.due_date).format('DD MMM YYYY')} ({moment(assignment.due_date).fromNow()})
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Learner card (admin view emphasizes it) */}
                {assignment.assigned_to && (
                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                                    {initials}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                        {assignment.assigned_to.name}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {assignment.assigned_to.email}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-1 items-center gap-3 sm:max-w-md">
                                <Progress value={progress.percentage} className="h-2" />
                                <span className="text-sm font-semibold tabular-nums text-[#0F2E52] dark:text-blue-200">
                                    {progress.percentage}%
                                </span>
                            </div>

                            {!isLearner && (
                                <Badge
                                    variant="outline"
                                    className="border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                >
                                    <Eye className="mr-1.5 h-3 w-3" />
                                    Read-only tracking
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Main content: sidebar + lesson viewer */}
                <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
                    <Card className="h-fit border-border/60 shadow-none xl:sticky xl:top-20">
                        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#0F2E52] dark:text-blue-200">
                                <BookOpen className="h-4 w-4" />
                                Modules
                            </CardTitle>
                            <CardDescription>
                                {assignment.course.modules.length} modules · {progress.total} lessons
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4">
                            {assignment.course.modules.map((mod) => {
                                const modLessons = mod.lessons;
                                const modCompleted = modLessons.filter((l) => isCompleted(l.id)).length;
                                const modTotal = modLessons.length;
                                const allDone = modCompleted === modTotal && modTotal > 0;

                                return (
                                    <div key={mod.id} className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                {mod.title}
                                            </h3>
                                            <Badge
                                                variant={allDone ? 'default' : 'secondary'}
                                                className="rounded-full text-[10px] tabular-nums"
                                            >
                                                {modCompleted}/{modTotal}
                                            </Badge>
                                        </div>

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
                                                                ? 'bg-[#14417A]/10 font-medium text-[#0F2E52] dark:bg-slate-800 dark:text-white'
                                                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Icon
                                                            className={`h-4 w-4 shrink-0 ${
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

                    <Card className="border-border/60 shadow-none">
                        {activeLesson ? (
                            <>
                                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <LessonTypeIcon type={activeLesson.content_type} />
                                                <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                                                    {activeLesson.content_type}
                                                </Badge>
                                                {isCompleted(activeLesson.id) && (
                                                    <Badge className="rounded-full bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        Completed by learner
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl font-semibold tracking-tight text-[#0F2E52] dark:text-blue-200">
                                                {activeLesson.title}
                                            </CardTitle>
                                            {activeLesson.estimated_minutes && (
                                                <CardDescription className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Estimated {activeLesson.estimated_minutes} minutes
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="py-6">
                                    <LessonContent lesson={activeLesson} />
                                </CardContent>

                                <Separator />

                                <CardContent className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
                                    <NavigationButtons
                                        modules={assignment.course.modules}
                                        activeLessonId={activeLesson.id}
                                        onNavigate={setActiveLessonId}
                                    />

                                    {isLearner ? (
                                        <div className="flex items-center gap-2">
                                            {isCompleted(activeLesson.id) ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => undoComplete(activeLesson.id)}
                                                    disabled={processingLessonId === activeLesson.id}
                                                >
                                                    {processingLessonId === activeLesson.id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RotateCcw className="mr-2 h-4 w-4" />
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
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    )}
                                                    Mark as complete
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">
                                            Only the assigned learner can mark lessons complete.
                                        </div>
                                    )}
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

function LessonTypeIcon({ type }: { type: string }) {
    const Icon = contentTypeIcon[type] ?? FileText;
    return (
        <div className="rounded-lg bg-muted p-1.5 text-muted-foreground">
            <Icon className="h-4 w-4" />
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
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!next} onClick={() => next && onNavigate(next.id)}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
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
