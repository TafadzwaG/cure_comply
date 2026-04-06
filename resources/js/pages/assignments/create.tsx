import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { User } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { AlarmClock, BookMarked, Plus, ShieldCheck, UserCheck } from 'lucide-react';

export default function AssignmentsCreate({
    courses,
    users,
}: {
    courses: Array<{ id: number; title: string }>;
    users: User[];
}) {
    const form = useForm({
        course_id: '',
        assigned_to_user_id: '',
        due_date: '',
    });

    const guidanceItems = [
        {
            title: 'Course is linked to the employee',
            description:
                'The assignee sees the training workload inside their dashboard and player flow.',
            icon: UserCheck,
            iconClassName: 'bg-[#14417A]/5 text-[#14417A] border border-[#14417A]/10',
        },
        {
            title: 'Due date drives monitoring',
            description:
                'The deadline is used for upcoming and overdue tracking in reports and dashboards.',
            icon: AlarmClock,
            iconClassName: 'bg-muted/30 text-[#14417A] border border-border/60',
        },
        {
            title: 'Completion flows are enabled',
            description:
                'Lesson progress and assignment status can update as the course is completed.',
            icon: BookMarked,
            iconClassName: 'bg-muted/30 text-[#14417A] border border-border/60',
        },
        {
            title: 'Tenant rules remain enforced',
            description:
                'Only users in the current tenant can be assigned through this form.',
            icon: ShieldCheck,
            iconClassName: 'bg-muted/30 text-[#14417A] border border-border/60',
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <Card className="rounded-md border-border/60 shadow-none">
                    <CardContent className="rounded-md bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl space-y-2">
                                <div className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white">
                                    PrivacyCure Assignment Builder
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight">Assign training</h1>
                                <p className="text-sm text-white/80">
                                    Allocate a course to an employee and define the expected completion date.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/15"
                                >
                                    <Link href={route('assignments.index')}>Back to Assignments</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="rounded-md border-border/60 shadow-none">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="text-base font-medium">Assignment Details</CardTitle>
                            <CardDescription>
                                Select the course, employee, and due date for this training assignment.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="course_id">Course</Label>
                                <Select
                                    value={form.data.course_id}
                                    onValueChange={(value) => form.setData('course_id', value)}
                                >
                                    <SelectTrigger id="course_id" className="rounded-md border-border/60">
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={String(course.id)}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.course_id ? (
                                    <p className="text-sm text-destructive">{form.errors.course_id}</p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assigned_to_user_id">Employee</Label>
                                <Select
                                    value={form.data.assigned_to_user_id}
                                    onValueChange={(value) => form.setData('assigned_to_user_id', value)}
                                >
                                    <SelectTrigger
                                        id="assigned_to_user_id"
                                        className="rounded-md border-border/60"
                                    >
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.assigned_to_user_id ? (
                                    <p className="text-sm text-destructive">
                                        {form.errors.assigned_to_user_id}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={form.data.due_date}
                                    onChange={(e) => form.setData('due_date', e.target.value)}
                                    className="rounded-md border-border/60"
                                />
                                {form.errors.due_date ? (
                                    <p className="text-sm text-destructive">{form.errors.due_date}</p>
                                ) : null}
                            </div>

                            <div className="rounded-md border border-border/60 bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                        <UserCheck className="h-4 w-4 text-[#14417A]" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Assignment note</p>
                                        <p className="text-sm text-muted-foreground">
                                            New assignments will appear in the employee training workflow and
                                            contribute to progress tracking.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    type="button"
                                    disabled={form.processing}
                                    onClick={() => form.post(route('assignments.store'))}
                                    className="rounded-md bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {form.processing ? 'Creating...' : 'Create Assignment'}
                                </Button>

                                <Button asChild variant="outline" className="rounded-md border-border/60">
                                    <Link href={route('assignments.index')}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-md border-border/60 shadow-none">
                            <CardHeader className="border-b border-border/60">
                                <CardTitle className="text-base font-medium">What happens next</CardTitle>
                                <CardDescription>
                                    Assignments connect people to courses and feed dashboard progress metrics.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3 p-6">
                                {guidanceItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.title}
                                            className="flex items-start gap-3 rounded-md border border-border/60 p-4"
                                        >
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-md ${item.iconClassName}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card className="rounded-md border-border/60 shadow-none">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                        <ShieldCheck className="h-4 w-4 text-[#14417A]" />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Recommended workflow</p>
                                        <p className="text-sm text-muted-foreground">
                                            Choose the course first, assign the correct employee, then set a realistic
                                            deadline for monitoring and follow-up.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
}