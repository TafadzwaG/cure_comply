import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { useForm } from '@inertiajs/react';
import { ClipboardCheck, Gauge, ListChecks, ShieldCheck } from 'lucide-react';

export default function TestsCreate({ courses }: { courses: Array<{ id: number; title: string }> }) {
    const form = useForm({ course_id: '', title: '', pass_mark: 70, max_attempts: 1, status: 'draft' });

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="Add New Test" description="Create an assessment and attach it to course-based or standalone learning journeys." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Select value={form.data.course_id} onValueChange={(value) => form.setData('course_id', value)}>
                                <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
                                <SelectContent>{courses.map((course) => <SelectItem key={course.id} value={String(course.id)}>{course.title}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="Test title" />
                            <Input type="number" value={form.data.pass_mark} onChange={(e) => form.setData('pass_mark', Number(e.target.value))} placeholder="Pass mark" />
                            <Button onClick={() => form.post(route('tests.store'))}>Create Test</Button>
                        </CardContent>
                    </Card>
                    <CreateGuidancePanel
                        title="What happens next"
                        description="The assessment becomes a shell for questions, options, and attempt rules."
                        items={[
                            { title: 'Test shell is created', description: 'The assessment appears in the test bank and can be enriched with questions.', icon: ClipboardCheck },
                            { title: 'Pass mark drives outcomes', description: 'Submitted attempts use the configured threshold to determine pass or fail.', icon: Gauge },
                            { title: 'Question builder follows', description: 'You can add and refine questions from the test detail page after creation.', icon: ListChecks },
                            { title: 'Draft state prevents early exposure', description: 'The test stays controlled until you are ready to publish it to users.', icon: ShieldCheck },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}
