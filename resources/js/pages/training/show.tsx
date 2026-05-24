import MarketingShell from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SharedData } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, FileText, Loader2, PlayCircle, Video } from 'lucide-react';
import type { ReactNode } from 'react';

interface Lesson {
    id: number;
    title: string;
    content_type: string;
    content_body?: string | null;
    video_url?: string | null;
    embed_url?: string | null;
    file_url?: string | null;
    estimated_minutes?: number | null;
}

interface Module {
    id: number;
    title: string;
    description?: string | null;
    lessons: Lesson[];
}

interface PublicCourse {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    estimated_minutes?: number | null;
    modules: Module[];
}

interface TenantOption {
    id: number;
    name: string;
}

export default function TrainingShow({ course, tenants }: { course: PublicCourse; tenants: TenantOption[] }) {
    const { flash } = usePage<SharedData>().props;
    const lessons = course.modules.flatMap((module) => module.lessons);

    return (
        <MarketingShell title={course.title} description={course.description ?? 'Public training material.'} current="training">
            <section className="border-b border-[#c3c6d1]/20 px-6 py-16 lg:px-16 lg:py-24 dark:border-white/10">
                <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-12">
                    <aside className="hidden lg:col-span-2 lg:block">
                        <div className="sticky top-28 space-y-4 text-[10px] font-medium tracking-[0.18em] text-[#002753]/55 uppercase dark:text-white/55">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" />
                                <span>Shareable course</span>
                            </div>
                            <div className="h-px w-12 bg-[#00daf3]" />
                            <p className="max-w-[150px] text-[11px] leading-6 tracking-normal normal-case">
                                Review the material and acknowledge completion at the end.
                            </p>
                        </div>
                    </aside>

                    <div className="space-y-5 lg:col-span-7">
                        <Button asChild variant="outline" className="w-fit rounded-full">
                            <Link href={route('training.index')}>
                                <ArrowLeft className="size-4" />
                                Training
                            </Link>
                        </Button>
                        <div className="space-y-4">
                            <Badge className="w-fit bg-[#002753] text-white hover:bg-[#002753]">Shareable training link</Badge>
                            <h1 className="text-4xl font-semibold tracking-tight text-[#002753] md:text-5xl dark:text-white">{course.title}</h1>
                            <p className="max-w-3xl text-base leading-7 text-[#434750] dark:text-white/70">
                                {course.description ??
                                    'Review each module and submit the acknowledgement form after you have gone through the material.'}
                            </p>
                        </div>
                    </div>

                    <Card className="h-fit rounded-lg border-[#c3c6d1]/50 bg-white/95 shadow-none lg:col-span-3 dark:border-white/15 dark:bg-[#0b2241]/90">
                        <CardContent className="grid gap-4 p-5">
                            <SummaryRow label="Modules" value={course.modules.length} icon={<BookOpen className="size-4" />} />
                            <SummaryRow label="Lessons" value={lessons.length} icon={<FileText className="size-4" />} />
                            <SummaryRow
                                label="Duration"
                                value={course.estimated_minutes ? `${course.estimated_minutes} min` : 'Self-paced'}
                                icon={<Clock3 className="size-4" />}
                            />
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="px-6 py-16 lg:px-16 lg:py-24">
                <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-5">
                        {course.modules.map((module, moduleIndex) => (
                            <Card
                                key={module.id}
                                className="overflow-hidden rounded-lg border-[#c3c6d1]/50 bg-white/95 shadow-none dark:border-white/15 dark:bg-[#0b2241]/90"
                            >
                                <CardHeader>
                                    <Badge variant="outline" className="w-fit">
                                        Module {moduleIndex + 1}
                                    </Badge>
                                    <CardTitle className="text-2xl text-[#002753] dark:text-white">{module.title}</CardTitle>
                                    {module.description ? <CardDescription>{module.description}</CardDescription> : null}
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {module.lessons.length ? (
                                        module.lessons.map((lesson, lessonIndex) => (
                                            <div
                                                key={lesson.id}
                                                className="rounded-lg border border-[#c3c6d1]/45 bg-[#f7f9fb]/85 p-5 dark:border-white/10 dark:bg-[#081a33]/80"
                                            >
                                                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <LessonTypeIcon type={lesson.content_type} />
                                                            <Badge variant="outline">Lesson {lessonIndex + 1}</Badge>
                                                            {lesson.estimated_minutes ? (
                                                                <Badge variant="outline">{lesson.estimated_minutes} min</Badge>
                                                            ) : null}
                                                        </div>
                                                        <h2 className="text-xl font-semibold text-[#002753] dark:text-white">{lesson.title}</h2>
                                                    </div>
                                                </div>
                                                <LessonContent lesson={lesson} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-[#c3c6d1]/60 p-8 text-sm text-[#434750] dark:text-white/70">
                                            No published lessons are available in this module yet.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="lg:sticky lg:top-24 lg:h-fit">
                        <Card className="overflow-hidden rounded-lg border-[#c3c6d1]/50 bg-white/95 shadow-none dark:border-white/15 dark:bg-[#0b2241]/90">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#002753] dark:text-white">
                                    <CheckCircle2 className="size-5" />
                                    Acknowledgement
                                </CardTitle>
                                <CardDescription>Select your tenant and confirm that you have gone through this material.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {flash.success ? (
                                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
                                        {flash.success}
                                    </div>
                                ) : null}
                                <AcknowledgementForm course={course} tenants={tenants} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </MarketingShell>
    );
}

function AcknowledgementForm({ course, tenants }: { course: PublicCourse; tenants: TenantOption[] }) {
    const form = useForm({
        tenant_id: '',
        full_name: '',
        acknowledgement: false as boolean,
    });

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                form.post(route('training.acknowledgements.store', course.slug), {
                    preserveScroll: true,
                    onSuccess: () => form.reset('full_name', 'acknowledgement'),
                });
            }}
        >
            <Field label="Tenant" error={form.errors.tenant_id}>
                <Select value={form.data.tenant_id} onValueChange={(value) => form.setData('tenant_id', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                        {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={String(tenant.id)}>
                                {tenant.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Full name" error={form.errors.full_name}>
                <Input
                    value={form.data.full_name}
                    onChange={(event) => form.setData('full_name', event.target.value)}
                    placeholder="Enter your full name"
                />
            </Field>

            <div className="space-y-2">
                <label className="flex items-start gap-3 rounded-xl border border-[#c3c6d1]/60 bg-white/70 p-4 text-sm leading-6 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
                    <Checkbox
                        checked={form.data.acknowledgement}
                        onCheckedChange={(checked) => form.setData('acknowledgement', checked === true)}
                        className="mt-1"
                    />
                    <span>I acknowledge that I have gone through this training material.</span>
                </label>
                {form.errors.acknowledgement ? <p className="text-destructive text-sm">{form.errors.acknowledgement}</p> : null}
            </div>

            <Button type="submit" disabled={form.processing || tenants.length === 0} className="w-full">
                {form.processing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Submit acknowledgement
            </Button>
        </form>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
    );
}

function SummaryRow({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-[#434750] dark:text-white/70">
                {icon}
                {label}
            </span>
            <span className="font-semibold text-[#002753] dark:text-white">{value}</span>
        </div>
    );
}

function LessonTypeIcon({ type }: { type: string }) {
    const Icon = type === 'video' ? Video : type === 'file' ? BookOpen : FileText;

    return (
        <div className="rounded-lg border border-[#c3c6d1]/50 bg-[#f7f9fb] p-2 text-[#002753] dark:border-white/10 dark:bg-white/10 dark:text-white">
            <Icon className="size-4" />
        </div>
    );
}

function LessonContent({ lesson }: { lesson: Lesson }) {
    if (lesson.content_type === 'video' && (lesson.embed_url || lesson.video_url)) {
        return (
            <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-[#c3c6d1]/50 bg-black">
                    <iframe
                        src={lesson.embed_url ?? lesson.video_url ?? ''}
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={lesson.title}
                    />
                </div>
                {lesson.content_body ? <HtmlContent html={lesson.content_body} /> : null}
            </div>
        );
    }

    if (lesson.content_type === 'file' && lesson.file_url) {
        return (
            <div className="space-y-4">
                <Button asChild variant="outline">
                    <a href={lesson.file_url} target="_blank" rel="noopener noreferrer">
                        <PlayCircle className="size-4" />
                        Open attached file
                    </a>
                </Button>
                {lesson.content_body ? <HtmlContent html={lesson.content_body} /> : null}
            </div>
        );
    }

    if (lesson.content_body) {
        return <HtmlContent html={lesson.content_body} />;
    }

    return <p className="text-sm text-[#434750] dark:text-white/70">No content available for this lesson yet.</p>;
}

function HtmlContent({ html }: { html: string }) {
    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}
