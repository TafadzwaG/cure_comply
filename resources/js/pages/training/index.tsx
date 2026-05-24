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
            <section className="bg-white py-16 dark:bg-[#061427]">
                <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-16">
                    <div className="space-y-5">
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

                    <div className="grid gap-4 sm:grid-cols-3">
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

            <section className="py-12">
                <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-16">
                    {courses.length ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {courses.map((course) => (
                                <Card key={course.id} className="overflow-hidden border-[#c3c6d1]/50 shadow-none">
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
                                        <CardTitle className="text-xl text-[#002753] dark:text-white">{course.title}</CardTitle>
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
                        <Card className="border-dashed border-[#c3c6d1]/70 shadow-none">
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
        <Card className="border-[#c3c6d1]/40 bg-[#f7f9fb] shadow-none dark:border-white/10 dark:bg-white/5">
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
