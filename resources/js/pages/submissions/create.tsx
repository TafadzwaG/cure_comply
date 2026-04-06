import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { useForm } from '@inertiajs/react';
import { CalendarClock, ClipboardCheck, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function SubmissionsCreate({ frameworks }: { frameworks: Array<{ id: number; name: string }> }) {
    const form = useForm({ compliance_framework_id: '', title: '', reporting_period: '2026-Q1' });

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="New Submission" description="Start a tenant compliance submission against a selected framework version." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader><CardTitle>Submission Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Select value={form.data.compliance_framework_id} onValueChange={(value) => form.setData('compliance_framework_id', value)}>
                                <SelectTrigger><SelectValue placeholder="Framework" /></SelectTrigger>
                                <SelectContent>{frameworks.map((framework) => <SelectItem key={framework.id} value={String(framework.id)}>{framework.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="Submission title" />
                            <Input value={form.data.reporting_period} onChange={(e) => form.setData('reporting_period', e.target.value)} placeholder="Reporting period" />
                            <Button onClick={() => form.post(route('submissions.store'))}>Create Submission</Button>
                        </CardContent>
                    </Card>
                    <CreateGuidancePanel
                        title="What happens next"
                        description="The submission becomes the working record for answering questions and attaching evidence."
                        items={[
                            { title: 'Submission is opened in draft', description: 'The record is created and can be refined before final submission.', icon: ClipboardCheck },
                            { title: 'Framework questions become available', description: 'The linked framework determines the section and question structure for responses.', icon: FileSpreadsheet },
                            { title: 'Reporting period anchors the cycle', description: 'The selected period supports tracking, exports, and historical analysis.', icon: CalendarClock },
                            { title: 'Scoring remains controlled', description: 'Scores are only calculated after response progress and review actions move forward.', icon: ShieldCheck },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}
