import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, router } from '@inertiajs/react';
import moment from 'moment';
import { BookOpen, CalendarDays, CheckCircle2, Clock, GraduationCap, PlayCircle, ShieldCheck, TimerReset } from 'lucide-react';
import { useState } from 'react';

export interface EmployeeCourseRow {
    id: number;
    assignment_id?: number | null;
    title: string;
    description?: string | null;
    status: string;
    estimated_minutes?: number | null;
    modules_count: number;
    lessons_count: number;
    completed_lessons: number;
    progress: number;
    assignment_status?: string | null;
    due_date?: string | null;
    is_mandatory: boolean;
    is_started: boolean;
}

export interface EmployeeCourseWorkspaceData {
    stats: {
        mandatory: number;
        public: number;
        inProgress: number;
        completed: number;
    };
    mandatoryCourses: EmployeeCourseRow[];
    publicCourses: EmployeeCourseRow[];
}

export function EmployeeCourseWorkspace({ workspace }: { workspace: EmployeeCourseWorkspaceData }) {
    const stats = [
        { label: 'Mandatory courses', value: workspace.stats.mandatory, detail: 'Assigned by your company admin.', icon: ShieldCheck },
        { label: 'Public courses', value: workspace.stats.public, detail: 'Published courses you can take voluntarily.', icon: BookOpen },
        { label: 'In progress', value: workspace.stats.inProgress, detail: 'Courses you have already started.', icon: TimerReset },
        { label: 'Completed', value: workspace.stats.completed, detail: 'Courses with all published lessons complete.', icon: CheckCircle2 },
    ];

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-none">
                <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl space-y-2">
                            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">PrivacyCure Learning Workspace</Badge>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your mandatory and public courses</h1>
                            <p className="text-sm leading-6 text-white/80">
                                Company-assigned courses are mandatory. Public courses are optional and create your own learning assignment when you start them.
                            </p>
                        </div>
                        <Badge className="w-fit border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/10">
                            {workspace.stats.completed} completed
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, detail, icon: Icon }) => (
                    <Card key={label} className="border-border/70 shadow-none">
                        <CardContent className="flex items-start justify-between gap-4 p-5">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                                <p className="text-2xl font-semibold tracking-tight">{value}</p>
                                <p className="text-sm text-muted-foreground">{detail}</p>
                            </div>
                            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                <Icon className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <Tabs defaultValue="mandatory" className="space-y-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="mandatory">Mandatory courses</TabsTrigger>
                    <TabsTrigger value="public">Public courses</TabsTrigger>
                </TabsList>

                <TabsContent value="mandatory">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Mandatory courses</CardTitle>
                            <CardDescription>Courses assigned by your company admin. Due dates and completion progress are tracked here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CourseTable
                                courses={workspace.mandatoryCourses}
                                emptyTitle="No mandatory courses"
                                emptyDescription="Mandatory courses assigned by your company admin will appear here."
                                showDueDate
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="public">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Public courses</CardTitle>
                            <CardDescription>Published courses you can take voluntarily. Starting one creates your personal learning assignment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CourseTable
                                courses={workspace.publicCourses}
                                emptyTitle="No public courses available"
                                emptyDescription="Published public courses will appear here when available."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function CourseTable({
    courses,
    emptyTitle,
    emptyDescription,
    showDueDate = false,
}: {
    courses: EmployeeCourseRow[];
    emptyTitle: string;
    emptyDescription: string;
    showDueDate?: boolean;
}) {
    if (!courses.length) {
        return <EmptyState icon={GraduationCap} title={emptyTitle} description={emptyDescription} />;
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Lessons</TableHead>
                        <TableHead>{showDueDate ? 'Due date' : 'Type'}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <CourseRow key={`${course.assignment_id ?? 'course'}-${course.id}`} course={course} showDueDate={showDueDate} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function CourseRow({ course, showDueDate }: { course: EmployeeCourseRow; showDueDate: boolean }) {
    const [processing, setProcessing] = useState(false);
    const actionLabel = getActionLabel(course);

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5">
                        <BookOpen className="size-4" />
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium">{course.title}</div>
                        <div className="max-w-xl text-xs text-muted-foreground line-clamp-2">{course.description ?? 'No summary provided.'}</div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="size-3" />
                                {course.estimated_minutes ? `${course.estimated_minutes} min` : 'Self-paced'}
                            </span>
                            <span>{course.modules_count} modules</span>
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell className="min-w-[190px]">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{course.completed_lessons}/{course.lessons_count} lessons</span>
                        <span className="font-medium tabular-nums text-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                    {course.lessons_count} published
                </Badge>
            </TableCell>
            <TableCell>
                {showDueDate ? (
                    <div className="space-y-1 text-sm">
                        <div>{course.due_date ? moment(course.due_date).format('DD MMM YYYY') : 'No due date'}</div>
                        {course.due_date ? <div className="text-xs text-muted-foreground">{moment(course.due_date).fromNow()}</div> : null}
                    </div>
                ) : (
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                        {course.assignment_id ? 'Started public' : 'Public'}
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <StatusBadge value={course.assignment_status ?? course.status} />
            </TableCell>
            <TableCell className="text-right">
                {course.assignment_id ? (
                    <Button asChild size="sm">
                        <Link href={route('assignments.show', course.assignment_id)}>
                            <PlayCircle className="mr-2 size-4" />
                            {actionLabel}
                        </Link>
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        disabled={processing}
                        onClick={() => {
                            setProcessing(true);
                            router.post(route('courses.self-assign', course.id), {}, { onFinish: () => setProcessing(false) });
                        }}
                    >
                        <PlayCircle className="mr-2 size-4" />
                        {processing ? 'Starting...' : 'Start course'}
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
}

function getActionLabel(course: EmployeeCourseRow): string {
    if (course.progress >= 100 || course.assignment_status === 'completed') {
        return 'Review';
    }

    if (course.progress > 0 || course.assignment_status === 'in_progress') {
        return 'Continue';
    }

    return 'Start';
}
