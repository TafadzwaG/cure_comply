import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { useForm } from '@inertiajs/react';
import { BookCopy, Boxes, ShieldCheck, TextSearch } from 'lucide-react';

export default function FrameworksCreate() {
    const form = useForm({ name: '', version: '1.0', description: '', status: 'draft' });

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="Add New Framework" description="Create a compliance framework that will later hold sections, scored questions, and guidance." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader><CardTitle>Framework Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Framework name" />
                            <Input value={form.data.version} onChange={(e) => form.setData('version', e.target.value)} placeholder="Version" />
                            <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Framework summary" />
                            <Button onClick={() => form.post(route('frameworks.store'))}>Create Framework</Button>
                        </CardContent>
                    </Card>
                    <CreateGuidancePanel
                        title="What happens next"
                        description="The framework becomes the parent structure for sections and response scoring."
                        items={[
                            { title: 'Framework shell is stored', description: 'The framework is added to the builder library and becomes selectable later.', icon: BookCopy },
                            { title: 'Sections come next', description: 'You can use the framework detail view to organize controls into weighted sections.', icon: Boxes },
                            { title: 'Question bank is attached later', description: 'Compliance questions and answer types are added after the framework exists.', icon: TextSearch },
                            { title: 'Publishing stays deliberate', description: 'Keeping the framework as draft avoids accidental use in submissions.', icon: ShieldCheck },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}
