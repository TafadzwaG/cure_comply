import { BrandCard } from '@/components/brand-card';
import InputError from '@/components/input-error';
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
import { BookCopy, Boxes, FolderKanban, Plus, ShieldCheck, Sparkles, TextSearch, Workflow } from 'lucide-react';
import { toast } from 'sonner';
import type { ReactNode } from 'react';

export default function FrameworksCreate() {
    const form = useForm({
        name: '',
        version: '1.0',
        description: '',
        status: 'draft',
    });

    const submit = () => {
        form.post(route('frameworks.store'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Framework created. Continue building sections and questions.'),
            onError: () => toast.error('Please fix the errors and try again.'),
        });
    };

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Create a new framework"
                    description="Define the compliance shell, publishing state, and summary, then continue directly into the framework builder."
                >
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Framework builder
                    </Badge>
                </PageHeader>

                <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
                    <BrandCard
                        title="Framework setup"
                        description="Create the top-level compliance structure before adding sections and scored questions."
                        className="bg-card"
                        headerRight={<IconChip icon={<ShieldCheck className="size-4" />} />}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                    Compliance framework setup
                                </Badge>
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    Create the framework shell, then move into sections and questions
                                </h2>
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Start with the framework identity and publication state. Once created, you will land in the builder where sections, answer types, guidance text, and scoring logic are configured.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <MetricTile label="Version" value={form.data.version || '1.0'} detail="Current framework version" icon={<BookCopy className="size-4" />} />
                                <MetricTile label="State" value="Draft" detail="Safe for controlled setup" icon={<ShieldCheck className="size-4" />} />
                                <MetricTile label="Sections" value="Next" detail="Builder step after save" icon={<Boxes className="size-4" />} />
                                <MetricTile label="Questions" value="Next" detail="Added inside sections" icon={<TextSearch className="size-4" />} />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Framework name" htmlFor="name" error={form.errors.name}>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g. GDPR 2026"
                                    />
                                </Field>

                                <Field label="Version" htmlFor="version" error={form.errors.version}>
                                    <Input
                                        id="version"
                                        value={form.data.version}
                                        onChange={(e) => form.setData('version', e.target.value)}
                                        placeholder="1.0"
                                    />
                                </Field>
                            </div>

                            <Field label="Description" htmlFor="description" error={form.errors.description}>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Explain the scope, regulatory intent, and control focus of this framework."
                                    className="min-h-[160px]"
                                />
                            </Field>

                            <Field label="Status" error={form.errors.status}>
                                <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <IconChip icon={<Sparkles className="size-4" />} className="mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-[#002753] dark:text-white">Builder flow</p>
                                        <p className="text-sm text-muted-foreground">
                                            After saving, you will be redirected into the framework detail builder where sections, weighted questions, answer types, evidence rules, and guidance text are managed.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button onClick={submit} disabled={form.processing}>
                                    <Plus className="size-4" />
                                    {form.processing ? 'Creating framework...' : 'Create framework'}
                                </Button>

                                <Button asChild variant="outline">
                                    <Link href={route('frameworks.index')}>Back to frameworks</Link>
                                </Button>
                            </div>
                        </div>
                    </BrandCard>

                    <div className="space-y-4">
                        <BrandCard
                            title="What happens next"
                            description="The framework becomes the parent structure for sections, question banks, and scoring."
                            headerRight={<IconChip icon={<Workflow className="size-4" />} />}
                        >
                            <div className="space-y-3">
                                <GuidanceRow
                                    icon={<BookCopy className="size-4" />}
                                    title="Framework shell is stored"
                                    description="The framework is added to the builder library and becomes available for continued setup."
                                />
                                <GuidanceRow
                                    icon={<Boxes className="size-4" />}
                                    title="Sections come next"
                                    description="Use the detail builder to organize the framework into weighted sections and control groups."
                                />
                                <GuidanceRow
                                    icon={<TextSearch className="size-4" />}
                                    title="Questions are attached later"
                                    description="Compliance questions, answer types, evidence rules, and guidance are added after the shell exists."
                                />
                                <GuidanceRow
                                    icon={<FolderKanban className="size-4" />}
                                    title="Publishing stays deliberate"
                                    description="Keeping the framework in draft avoids accidental use in tenant submissions before the builder is complete."
                                />
                            </div>
                        </BrandCard>

                        <BrandCard
                            title="Recommended workflow"
                            description="Use this sequence to keep framework design clean and reusable."
                            headerRight={<IconChip icon={<ShieldCheck className="size-4" />} />}
                        >
                            <div className="space-y-4">
                                <WorkflowStep title="1. Set the shell" description="Define the name, version, and publication state first." />
                                <WorkflowStep title="2. Add sections" description="Structure the framework into logical control groups with sort order and weight." />
                                <WorkflowStep title="3. Build the question bank" description="Attach weighted questions, answer types, evidence rules, and guidance inside each section." />
                            </div>
                        </BrandCard>
                    </div>
                </section>
            </div>
        </PlatformLayout>
    );
}

function MetricTile({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
                <IconChip icon={icon} />
                <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold text-[#002753] dark:text-white">{value}</p>
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
            <InputError message={error} />
        </div>
    );
}

function GuidanceRow({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
            <IconChip icon={icon} className="mt-0.5" />
            <div className="space-y-1">
                <p className="text-sm font-medium text-[#002753] dark:text-white">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function WorkflowStep({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-sm font-medium text-[#002753] dark:text-white">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
    );
}
