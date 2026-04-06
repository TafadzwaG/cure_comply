import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { useForm } from '@inertiajs/react';
import { BookOpen, Clock3, Layers3, ShieldCheck } from 'lucide-react';

export default function CoursesCreate() {
    const form = useForm({ title: '', description: '', estimated_minutes: 45, status: 'draft' });

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="Add New Course" description="Create a new training course for privacy, compliance, and cyber awareness delivery." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="Course title" />
                            <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Course overview" />
                            <Input type="number" value={form.data.estimated_minutes} onChange={(e) => form.setData('estimated_minutes', Number(e.target.value))} placeholder="Estimated minutes" />
                            <Button onClick={() => form.post(route('courses.store'))}>Create Course</Button>
                        </CardContent>
                    </Card>
                    <CreateGuidancePanel
                        title="What happens next"
                        description="The course becomes the parent structure for modules, lessons, and linked tests."
                        items={[
                            { title: 'Course shell is created', description: 'A reusable training asset is stored and becomes available in the course library.', icon: BookOpen },
                            { title: 'Duration informs planning', description: 'Estimated minutes help admins schedule assignments and progress expectations.', icon: Clock3 },
                            { title: 'Modules can be added later', description: 'The course detail page remains the place for module and lesson builder work.', icon: Layers3 },
                            { title: 'Publishing stays controlled', description: 'The initial draft state keeps unfinished content out of active assignment flows.', icon: ShieldCheck },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}
