import { BrandCard } from '@/components/brand-card';
import { IconChip } from '@/components/icon-chip';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, useForm } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FolderKanban,
    Gauge,
    Layers3,
    ListChecks,
    Plus,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

export default function TestsCreate({
    courses,
    frameworks,
}: {
    courses: Array<{ id: number; title: string }>;
    frameworks: Array<{ id: number; name: string }>;
}) {
    const form = useForm({
        course_id: '',
        compliance_framework_id: '',
        title: '',
        description: '',
        pass_mark: 70,
        time_limit_minutes: '',
        max_attempts: 1,
        status: 'draft',
    });

    const guidanceItems = [
        {
            title: 'Assessment shell is created',
            description: 'The test opens in its builder workspace where questions, options, and scoring logic can be refined immediately.',
            icon: ClipboardCheck,
        },
        {
            title: 'Pass mark drives outcomes',
            description: 'Results use the configured threshold to determine pass or fail across every attempt.',
            icon: Gauge,
        },
        {
            title: 'Question builder follows',
            description: 'You can add question blocks, images, and answer options from the detailed test workspace after saving.',
            icon: ListChecks,
        },
        {
            title: 'Draft state keeps control',
            description: 'New tests stay out of learner flows until the question bank is complete and reviewed.',
            icon: ShieldCheck,
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Create a new test"
                    description="Create the assessment shell, link it to a course or framework, and continue directly into the builder workspace."
                >
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Test builder
                    </Badge>
                </PageHeader>

                <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
                    <BrandCard
                        title="Assessment setup"
                        description="Define the test shell, thresholds, and optional links before building questions."
                        className="bg-card"
                        headerRight={<IconChip icon={<ClipboardCheck className="size-4" />} />}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                    PrivacyCure assessment builder
                                </Badge>
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    Create the test shell, then move straight into question building
                                </h2>
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Attach the assessment to a course or framework, define the pass mark and attempt rules, and continue into the builder to add questions.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <MetricTile label="Course links" value={`${courses.length}`} detail="Available courses" icon={BookOpen} />
                                <MetricTile label="Framework links" value={`${frameworks.length}`} detail="Available frameworks" icon={FolderKanban} />
                                <MetricTile label="Default threshold" value={`${form.data.pass_mark}%`} detail="Current pass mark" icon={Gauge} />
                                <MetricTile label="Initial state" value="Draft" detail="Private until reviewed" icon={ShieldCheck} />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Course" error={form.errors.course_id}>
                                    <Select
                                        value={form.data.course_id || 'none'}
                                        onValueChange={(value) => form.setData('course_id', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger id="course_id">
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Standalone assessment</SelectItem>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={String(course.id)}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field label="Compliance framework" error={form.errors.compliance_framework_id}>
                                    <Select
                                        value={form.data.compliance_framework_id || 'none'}
                                        onValueChange={(value) =>
                                            form.setData('compliance_framework_id', value === 'none' ? '' : value)
                                        }
                                    >
                                        <SelectTrigger id="compliance_framework_id">
                                            <SelectValue placeholder="Select framework" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No framework link</SelectItem>
                                            {frameworks.map((framework) => (
                                                <SelectItem key={framework.id} value={String(framework.id)}>
                                                    {framework.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>

                            <Field label="Test title" htmlFor="title" error={form.errors.title}>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="e.g. POPIA Knowledge Check"
                                />
                            </Field>

                            <Field label="Assessment overview" htmlFor="description" error={form.errors.description}>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Summarize what this assessment validates and who should complete it."
                                    className="min-h-[140px]"
                                />
                            </Field>

                            <div className="grid gap-5 md:grid-cols-3">
                                <Field label="Pass mark" htmlFor="pass_mark" error={form.errors.pass_mark}>
                                    <div className="relative">
                                        <Input
                                            id="pass_mark"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={form.data.pass_mark}
                                            onChange={(e) => form.setData('pass_mark', Number(e.target.value))}
                                            className="pr-10"
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                </Field>

                                <Field label="Time limit" htmlFor="time_limit_minutes" error={form.errors.time_limit_minutes}>
                                    <div className="relative">
                                        <Input
                                            id="time_limit_minutes"
                                            type="number"
                                            min={1}
                                            value={form.data.time_limit_minutes}
                                            onChange={(e) => form.setData('time_limit_minutes', e.target.value)}
                                            placeholder="Optional"
                                            className="pr-14"
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                                            mins
                                        </span>
                                    </div>
                                </Field>

                                <Field label="Max attempts" htmlFor="max_attempts" error={form.errors.max_attempts}>
                                    <Input
                                        id="max_attempts"
                                        type="number"
                                        min={1}
                                        value={form.data.max_attempts}
                                        onChange={(e) => form.setData('max_attempts', Number(e.target.value))}
                                    />
                                </Field>
                            </div>

                            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <IconChip icon={<Sparkles className="size-4" />} className="mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-[#002753] dark:text-white">Builder flow</p>
                                        <p className="text-sm text-muted-foreground">
                                            Once the shell is created, you land on the detailed test page where questions, answer options, and settings are managed from tabs.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button type="button" disabled={form.processing} onClick={() => form.post(route('tests.store'))}>
                                    <Plus className="size-4" />
                                    {form.processing ? 'Creating test...' : 'Create test'}
                                </Button>

                                <Button asChild variant="outline">
                                    <Link href={route('tests.index')}>Back to tests</Link>
                                </Button>
                            </div>
                        </div>
                    </BrandCard>

                    <div className="space-y-4">
                        <BrandCard
                            title="What happens next"
                            description="The test becomes a controlled builder workspace for the question bank."
                            headerRight={<IconChip icon={<Layers3 className="size-4" />} />}
                        >
                            <div className="space-y-3">
                                {guidanceItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                                            <IconChip icon={<Icon className="size-4" />} className="mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-[#002753] dark:text-white">{item.title}</p>
                                                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </BrandCard>

                        <BrandCard
                            title="Recommended workflow"
                            description="Keep the build sequence structured from the start."
                            headerRight={<IconChip icon={<CheckCircle2 className="size-4" />} />}
                        >
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <WorkflowRow title="1. Set the shell" description="Define the title, thresholds, and optional course/framework links." />
                                <WorkflowRow title="2. Add the question bank" description="Write questions, add options, and attach images where needed." />
                                <WorkflowRow title="3. Review the settings" description="Validate time limits, max attempts, and publish state before rollout." />
                            </div>
                        </BrandCard>
                    </div>
                </section>
            </div>
        </PlatformLayout>
    );
}

function MetricTile({
    label,
    value,
    detail,
    icon: Icon,
}: {
    label: string;
    value: string;
    detail: string;
    icon: typeof ClipboardCheck;
}) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
                <IconChip icon={<Icon className="size-4" />} />
                <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
                    <p className="text-xl font-semibold text-[#002753] dark:text-white">{value}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    children,
    error,
    htmlFor,
}: {
    label: string;
    children: ReactNode;
    error?: string;
    htmlFor?: string;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

function WorkflowRow({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-sm font-medium text-[#002753] dark:text-white">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
    );
}
