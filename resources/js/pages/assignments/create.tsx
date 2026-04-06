import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { AlarmClock, BookMarked, ShieldCheck, UserCheck } from 'lucide-react';

export default function AssignmentsCreate({ courses, users }: { courses: Array<{ id: number; title: string }>; users: User[] }) {
    const form = useForm({ course_id: '', assigned_to_user_id: '', due_date: '' });

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="Assign Training" description="Allocate a course to an employee and define the expected completion date." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader><CardTitle>Assignment Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Select value={form.data.course_id} onValueChange={(value) => form.setData('course_id', value)}>
                                <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
                                <SelectContent>{courses.map((course) => <SelectItem key={course.id} value={String(course.id)}>{course.title}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={form.data.assigned_to_user_id} onValueChange={(value) => form.setData('assigned_to_user_id', value)}>
                                <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
                                <SelectContent>{users.map((user) => <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input type="date" value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} />
                            <Button onClick={() => form.post(route('assignments.store'))}>Create Assignment</Button>
                        </CardContent>
                    </Card>
                    <CreateGuidancePanel
                        title="What happens next"
                        description="Assignments connect people to courses and feed dashboard progress metrics."
                        items={[
                            { title: 'Course is linked to the employee', description: 'The assignee sees the training workload inside their dashboard and player flow.', icon: UserCheck },
                            { title: 'Due date drives monitoring', description: 'The deadline is used for upcoming and overdue tracking in reports and dashboards.', icon: AlarmClock },
                            { title: 'Completion flows are enabled', description: 'Lesson progress and assignment status can update as the course is completed.', icon: BookMarked },
                            { title: 'Tenant rules remain enforced', description: 'Only users in the current tenant can be assigned through this form.', icon: ShieldCheck },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}
