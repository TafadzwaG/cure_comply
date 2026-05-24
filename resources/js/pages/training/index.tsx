import MarketingShell from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            <section className="border-b border-[#c3c6d1]/20 px-6 py-20 lg:px-16 lg:py-28 dark:border-white/10">
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

                    <div className="grid gap-px overflow-hidden rounded-lg border border-[#c3c6d1]/35 bg-[#c3c6d1]/35 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1 dark:border-white/10 dark:bg-white/10">
                        <Metric label="Published courses" value={courses.length} icon={GraduationCap} />
                        <Metric
                            label="Lessons"
                            value={courses.reduce((total, course) => total + (course.published_lessons_count ?? 0), 0)}
                            icon={FileText}
                        />
                        <Metric
                            label="Self paced"
                            value={courses.filter((course) => !course.estimated_minutes).length || courses.length}
                            icon={Clock3}
                        />
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 lg:px-16 lg:py-24">
                <div className="mx-auto w-full max-w-[1440px]">
                    {courses.length ? (
                        <div className="grid gap-px overflow-hidden rounded-lg border border-[#c3c6d1]/35 bg-[#c3c6d1]/35 md:grid-cols-2 xl:grid-cols-3 dark:border-white/10 dark:bg-white/10">
                            {courses.map((course) => (
                                <Card
                                    key={course.id}
                                    className="group overflow-hidden rounded-none border-0 bg-white shadow-none transition-colors hover:bg-[#f7f9fb] dark:bg-[#0b2241]/90 dark:hover:bg-[#123057]"
                                >
                                    {course.image_url ? (
                                        <img src={course.image_url} alt="" className="h-44 w-full object-cover" />
                                    ) : (
                                        <div className="flex h-44 items-center justify-center bg-[#eaf0f6] text-[#002753] dark:bg-white/10 dark:text-white">
                                            <BookOpen className="size-10" />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{course.modules_count ?? 0} modules</Badge>
                                            <Badge variant="outline">{course.published_lessons_count ?? 0} lessons</Badge>
                                        </div>
                                        <CardTitle className="text-2xl text-[#002753] dark:text-white">{course.title}</CardTitle>
                                        <CardDescription className="line-clamp-3">{course.description ?? 'No summary provided.'}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-1.5 text-sm text-[#434750] dark:text-white/70">
                                            <Clock3 className="size-4" />
                                            {course.estimated_minutes ? `${course.estimated_minutes} min` : 'Self-paced'}
                                        </span>
                                        <Button asChild>
                                            <Link href={route('training.show', course.slug)}>
                                                Open
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed border-[#c3c6d1]/70 bg-white shadow-none dark:border-white/15 dark:bg-[#0b2241]/90">
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <GraduationCap className="size-12 text-[#002753]/35 dark:text-white/35" />
                                <div>
                                    <p className="text-lg font-medium text-[#002753] dark:text-white">No training materials published</p>
                                    <p className="mt-1 text-sm text-[#434750] dark:text-white/70">
                                        Published courses will appear here automatically.
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

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof GraduationCap }) {
    return (
        <Card className="rounded-none border-0 bg-white shadow-none dark:bg-[#0b2241]/90">
            <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[#434750] dark:text-white/70">{label}</p>
                    <Icon className="size-5 text-[#002753] dark:text-white" />
                </div>
                <p className="text-3xl font-semibold tracking-tight text-[#002753] dark:text-white">{value}</p>
            </CardContent>
        </Card>
    );
}
