import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, useForm } from '@inertiajs/react';
import { ClipboardCheck, Gauge, ListChecks, Plus, ShieldCheck } from 'lucide-react';

export default function TestsCreate({
    courses,
}: {
    courses: Array<{ id: number; title: string }>;
}) {
    const form = useForm({
        course_id: '',
        title: '',
        pass_mark: 70,
        max_attempts: 1,
        status: 'draft',
    });

    const guidanceItems = [
        {
            title: 'Test shell is created',
            description: 'The assessment appears in the test bank and can be enriched with questions.',
            icon: ClipboardCheck,
        },
        {
            title: 'Pass mark drives outcomes',
            description: 'Submitted attempts use the configured threshold to determine pass or fail.',
            icon: Gauge,
        },
        {
            title: 'Question builder follows',
            description: 'You can add and refine questions from the test detail page after creation.',
            icon: ListChecks,
        },
        {
            title: 'Draft state prevents early exposure',
            description: 'The test stays controlled until you are ready to publish it to users.',
            icon: ShieldCheck,
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
                                    PrivacyCure Test Builder
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight">Add a new test</h1>
                                <p className="text-sm text-white/80">
                                    Create an assessment and attach it to course-based or standalone learning journeys.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/15"
                                >
                                    <Link href={route('tests.index')}>Back to Tests</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="rounded-md border-border/60 shadow-none">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="text-base font-medium">Test Details</CardTitle>
                            <CardDescription>
                                Set the linked course, title, and passing threshold for this assessment.
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
                                <Label htmlFor="title">Test title</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="e.g. POPIA Knowledge Check"
                                    className="rounded-md border-border/60"
                                />
                                {form.errors.title ? (
                                    <p className="text-sm text-destructive">{form.errors.title}</p>
                                ) : null}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="pass_mark">Pass mark</Label>
                                    <div className="relative">
                                        <Input
                                            id="pass_mark"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={form.data.pass_mark}
                                            onChange={(e) => form.setData('pass_mark', Number(e.target.value))}
                                            placeholder="70"
                                            className="rounded-md border-border/60 pr-10"
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                    {form.errors.pass_mark ? (
                                        <p className="text-sm text-destructive">{form.errors.pass_mark}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Initial status</span>
                                    <div className="flex h-10 items-center rounded-md border border-border/60 bg-muted/20 px-3 text-sm font-medium">
                                        Draft
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        New tests start as draft until questions and rules are ready.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-md border border-border/60 bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                        <ClipboardCheck className="h-4 w-4 text-[#14417A]" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Assessment note</p>
                                        <p className="text-sm text-muted-foreground">
                                            After creating the test, you can add questions, answer options, and attempt
                                            rules from the test detail page.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    type="button"
                                    disabled={form.processing}
                                    onClick={() => form.post(route('tests.store'))}
                                    className="rounded-md bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {form.processing ? 'Creating...' : 'Create Test'}
                                </Button>

                                <Button asChild variant="outline" className="rounded-md border-border/60">
                                    <Link href={route('tests.index')}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-md border-border/60 shadow-none">
                            <CardHeader className="border-b border-border/60">
                                <CardTitle className="text-base font-medium">What happens next</CardTitle>
                                <CardDescription>
                                    The assessment becomes a shell for questions, options, and attempt rules.
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
                                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                                <Icon className="h-4 w-4 text-[#14417A]" />
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
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
                                            Create the test first, then add questions and answer choices, and only
                                            publish once the scoring and pass mark are fully reviewed.
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