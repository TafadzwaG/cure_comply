import MarketingShell from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Clock3, FileText, GraduationCap } from 'lucide-react';

interface PublicCourse {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    estimated_minutes?: number | null;
    modules_count?: number;
    published_lessons_count?: number;
}

export default function TrainingIndex({ courses }: { courses: PublicCourse[] }) {
    return (
        <MarketingShell
            title="Training"
            description="Public training materials and acknowledgement links for Privacy Cure Compliance learners."
            current="training"
        >
            <section className="marketing-hero-section border-b border-[#c3c6d1]/20 px-6 py-20 lg:px-16 lg:py-28 dark:border-white/10">
                <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-12">
                    <aside className="hidden lg:col-span-2 lg:block">
                        <div className="sticky top-28 space-y-4 text-[10px] font-medium tracking-[0.18em] text-[#002753]/55 uppercase dark:text-white/55">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" />
                                <span>Public library</span>
                            </div>
                            <div className="h-px w-12 bg-[#00daf3]" />
                            <p className="max-w-[150px] text-[11px] leading-6 tracking-normal normal-case">
                                Share published materials without opening the authenticated workspace.
                            </p>
                        </div>
                    </aside>

                    <div className="space-y-5 lg:col-span-6">
                        <Badge className="w-fit bg-[#002753] text-white hover:bg-[#002753]">Public training</Badge>
                        <div className="space-y-4">
                            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[#002753] md:text-5xl dark:text-white">
                                Training materials ready to share
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-[#434750] dark:text-white/70">
                                Open a published course, review the material, and submit an acknowledgement for the relevant tenant when finished.
                            </p>
                        </div>
                    </div>

                    <aside className="flex flex-col overflow-hidden rounded-2xl border border-[#c3c6d1]/30 bg-white shadow-[0_18px_44px_-28px_rgba(0,39,83,0.2)] lg:col-span-4 dark:border-white/10 dark:bg-[#0b2241]/85 dark:shadow-[0_18px_44px_-28px_rgba(0,0,0,0.5)]">
                        <div className="border-b border-[#c3c6d1]/25 px-5 py-4 dark:border-white/10">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#00b9ce] uppercase">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" aria-hidden="true" />
                                    Library snapshot
                                </div>
                                <span className="font-[Fraunces] text-sm italic text-[#002753]/25 dark:text-white/20">2026</span>
                            </div>
                        </div>

                        <div className="divide-y divide-[#c3c6d1]/20 dark:divide-white/10">
                            <TrainingStat
                                label="Published courses"
                                detail="Live in the public catalog"
                                value={courses.length}
                                icon={GraduationCap}
                            />
                            <TrainingStat
                                label="Lessons"
                                detail="Available to review now"
                                value={courses.reduce((total, course) => total + (course.published_lessons_count ?? 0), 0)}
                                icon={FileText}
                            />
                            <TrainingStat
                                label="Self paced"
                                detail="Learn on your own schedule"
                                value={courses.filter((course) => !course.estimated_minutes).length || courses.length}
                                icon={Clock3}
                            />
                        </div>
                    </aside>
                </div>
            </section>

            <section className="px-6 py-16 lg:px-16 lg:py-24">
                <div className="mx-auto w-full max-w-[1440px]">
                    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="h-0.5 w-8 bg-[#00daf3]" />
                                <span className="text-[10px] font-bold tracking-[0.2em] text-[#00b9ce] uppercase">Catalog</span>
                            </div>
                            <h2 className="text-3xl tracking-tight text-[#002753] md:text-4xl lg:text-5xl dark:text-white">Published courses</h2>
                        </div>
                        <p className="max-w-md text-sm leading-7 text-[#434750] dark:text-white/65">
                            Browse open materials, review lessons at your own pace, and submit acknowledgements when your organization requires them.
                        </p>
                    </div>

                    {courses.length ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {courses.map((course, index) => (
                                <article
                                    key={course.id}
                                    className="group flex flex-col overflow-hidden rounded-lg border border-[#c3c6d1]/35 bg-white transition-all duration-250 hover:-translate-y-1 hover:border-[#00daf3]/35 hover:shadow-[0_20px_40px_-18px_rgba(0,39,83,0.15)] dark:border-white/10 dark:bg-[#0b2241]/90 dark:hover:border-[#00daf3]/25 dark:hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.45)]"
                                >
                                    <div className="relative h-48 overflow-hidden bg-[#eaf0f6] dark:bg-white/5">
                                        {course.image_url ? (
                                            <img
                                                src={course.image_url}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[#002753]/30 dark:text-white/25">
                                                <BookOpen className="size-12" />
                                            </div>
                                        )}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#002753]/55 via-transparent to-transparent opacity-80" />
                                        <span className="absolute top-4 right-4 font-[Fraunces] text-5xl leading-none font-black text-white/10 select-none">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-medium tracking-[0.14em] text-white uppercase backdrop-blur-sm">
                                                {course.modules_count ?? 0} modules
                                            </span>
                                            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-medium tracking-[0.14em] text-white uppercase backdrop-blur-sm">
                                                {course.published_lessons_count ?? 0} lessons
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col p-6">
                                        <h3 className="mb-2 text-xl leading-snug font-semibold text-[#002753] dark:text-white">{course.title}</h3>
                                        <p className="line-clamp-3 flex-1 text-sm leading-6 text-[#434750] dark:text-white/65">
                                            {course.description ?? 'No summary provided.'}
                                        </p>

                                        <div className="mt-6 flex flex-col gap-4 border-t border-[#c3c6d1]/25 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#434750] uppercase dark:text-white/60">
                                                <Clock3 className="size-3.5 text-[#00b9ce]" />
                                                {course.estimated_minutes ? `${course.estimated_minutes} min` : 'Self-paced'}
                                            </span>
                                            <Link
                                                href={route('training.show', course.slug)}
                                                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-sm bg-[#00daf3] px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-[#002753] uppercase transition-colors hover:bg-[#9cf0ff] sm:w-auto"
                                            >
                                                Open course
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <Card className="border border-dashed border-[#c3c6d1]/70 bg-[#f7f9fb] shadow-none dark:border-white/15 dark:bg-[#0b2241]/60">
                            <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                                <div className="flex size-16 items-center justify-center rounded-lg border border-[#c3c6d1]/40 bg-white dark:border-white/10 dark:bg-white/5">
                                    <GraduationCap className="size-8 text-[#002753]/35 dark:text-white/35" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-[#002753] dark:text-white">No training materials published</p>
                                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#434750] dark:text-white/70">
                                        Published courses will appear here automatically once your administrators release them.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </MarketingShell>
    );
}

function TrainingStat({
    label,
    detail,
    value,
    icon: Icon,
}: {
    label: string;
    detail: string;
    value: number;
    icon: typeof GraduationCap;
}) {
    return (
        <div className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[#f7f9fb]/80 dark:hover:bg-white/[0.03]">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#00daf3]/22 bg-[#00daf3]/8 text-[#00b9ce] transition-colors group-hover:border-[#00daf3]/35 group-hover:bg-[#00daf3]/12 dark:border-[#00daf3]/18 dark:bg-[#00daf3]/10 dark:text-[#9cf0ff]">
                <Icon className="size-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-[Fraunces] text-[2rem] leading-none tracking-tight text-[#002753] dark:text-white">{value}</p>
                <p className="mt-1.5 text-sm font-medium text-[#002753] dark:text-white/90">{label}</p>
                <p className="mt-0.5 text-xs leading-5 text-[#434750] dark:text-white/55">{detail}</p>
            </div>
        </div>
    );
}
