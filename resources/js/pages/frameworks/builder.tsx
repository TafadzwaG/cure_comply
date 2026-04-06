import InputError from '@/components/input-error';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, router, useForm, useRemember } from '@inertiajs/react';
import { ReactNode, useEffect } from 'react';
import {
    BookMarked,
    FileStack,
    HelpCircle,
    Layers3,
    ListChecks,
    LucideIcon,
    PencilRuler,
    Plus,
    Scale,
    ShieldCheck,
    Sparkles,
    TextSearch,
    Trash2,
    Workflow,
} from 'lucide-react';

interface AnswerTypeOption {
    value: string;
    label: string;
}

interface FrameworkData {
    id: number;
    name: string;
    version?: string | null;
    description?: string | null;
    status: string;
    submissions_count?: number;
    sections?: Array<{
        id: number;
        name: string;
        description?: string | null;
        sort_order: number;
        weight: number;
        questions?: Array<{
            id: number;
            code?: string | null;
            question_text: string;
            answer_type: string;
            weight: number;
            requires_evidence: boolean;
            guidance_text?: string | null;
            sort_order: number;
            is_active: boolean;
        }>;
    }>;
}

function StatusPill({ value }: { value: string }) {
    const styles: Record<string, string> = {
        published:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
        draft:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
        archived:
            'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
    };

    return (
        <Badge
            variant="outline"
            className={`capitalize font-medium ${styles[value?.toLowerCase()] ?? 'border-border bg-background text-foreground'}`}
        >
            {value}
        </Badge>
    );
}

function SectionBadge() {
    return (
        <Badge
            variant="outline"
            className="rounded-full border-[#14417A]/20 bg-[#14417A]/5 px-3 py-1 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
        >
            <FileStack className="mr-1.5 size-3.5" />
            Section
        </Badge>
    );
}

export function FrameworkBuilder({
    framework,
    answerTypes,
    mode = 'show',
}: {
    framework: FrameworkData;
    answerTypes: AnswerTypeOption[];
    mode?: 'show' | 'edit';
}) {
    const frameworkForm = useForm({
        name: framework.name ?? '',
        version: framework.version ?? '',
        description: framework.description ?? '',
        status: framework.status ?? 'draft',
    });

    const sectionForm = useForm({
        name: '',
        description: '',
        sort_order: String((framework.sections?.length ?? 0) + 1),
        weight: '1',
    });
    const [activeTab, setActiveTab] = useRemember('overview', `framework-builder:${framework.id}:tab`);
    const [openSections, setOpenSections] = useRemember<string[]>(
        framework.sections?.map((section) => String(section.id)) ?? [],
        `framework-builder:${framework.id}:sections`,
    );

    const questionsCount =
        framework.sections?.reduce((carry, section) => carry + (section.questions?.length ?? 0), 0) ?? 0;

    useEffect(() => {
        const sectionIds = framework.sections?.map((section) => String(section.id)) ?? [];

        setOpenSections((current) => Array.from(new Set([...current, ...sectionIds])));
    }, [framework.sections, setOpenSections]);

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <Card className="overflow-hidden border-0 shadow-none">
                    <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                        PrivacyCure Framework Builder
                                    </Badge>
                                    <StatusPill value={framework.status} />
                                    <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                        {mode === 'edit' ? 'Edit mode' : 'View mode'}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-2xl font-semibold tracking-tight">{framework.name}</h1>
                                    <p className="text-sm text-white/80">
                                        Expandable builder workspace for framework settings, section ordering,
                                        and question design.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                                        {framework.sections?.length ?? 0} sections
                                    </Badge>
                                    <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                                        {questionsCount} questions
                                    </Badge>
                                    <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                                        {framework.submissions_count ?? 0} submissions
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {mode === 'edit' ? (
                                    <Button
                                        onClick={() =>
                                            frameworkForm.patch(route('frameworks.update', framework.id, false))
                                        }
                                        className="bg-white text-[#0F2E52] hover:bg-white/90"
                                    >
                                        Save Framework
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className="bg-white text-[#0F2E52] hover:bg-white/90"
                                    >
                                        <Link href={route('frameworks.edit', framework.id, false)}>
                                            Open Edit Mode
                                        </Link>
                                    </Button>
                                )}

                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                                >
                                    <Link href={route('frameworks.index', undefined, false)}>
                                        Back to Frameworks
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Sections"
                        value={framework.sections?.length ?? 0}
                        icon={Layers3}
                        iconClassName="bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300"
                    />
                    <MetricCard
                        label="Questions"
                        value={questionsCount}
                        icon={ListChecks}
                        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    />
                    <MetricCard
                        label="Submissions"
                        value={framework.submissions_count ?? 0}
                        icon={ShieldCheck}
                        iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                    />
                    <MetricCard
                        label="Status"
                        value={framework.status}
                        icon={BookMarked}
                        iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    />
                </section>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="h-auto w-full justify-start rounded-xl border border-[#14417A]/15 bg-[#14417A]/[0.04] p-1">
                        <TabsTrigger
                            value="overview"
                            className="rounded-lg px-4 py-2.5 data-[state=active]:bg-[#14417A] data-[state=active]:text-white"
                        >
                            <BookMarked className="mr-2 size-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="sections"
                            className="rounded-lg px-4 py-2.5 data-[state=active]:bg-[#14417A] data-[state=active]:text-white"
                        >
                            <Layers3 className="mr-2 size-4" />
                            Sections & questions
                        </TabsTrigger>
                        <TabsTrigger
                            value="help"
                            className="rounded-lg px-4 py-2.5 data-[state=active]:bg-[#14417A] data-[state=active]:text-white"
                        >
                            <HelpCircle className="mr-2 size-4" />
                            Help
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                            <Card className="border-[#14417A]/15 shadow-none">
                                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                    <CardTitle className="flex items-center gap-2 text-[#0F2E52] dark:text-blue-200">
                                        <BookMarked className="size-4" />
                                        Framework details
                                    </CardTitle>
                                    <CardDescription>
                                        Update top-level metadata that identifies and publishes the framework.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-5 p-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Framework name" error={frameworkForm.errors.name}>
                                            <Input
                                                value={frameworkForm.data.name}
                                                onChange={(event) =>
                                                    frameworkForm.setData('name', event.target.value)
                                                }
                                                className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                            />
                                        </Field>

                                        <Field label="Version" error={frameworkForm.errors.version}>
                                            <Input
                                                value={frameworkForm.data.version}
                                                onChange={(event) =>
                                                    frameworkForm.setData('version', event.target.value)
                                                }
                                                className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                            />
                                        </Field>
                                    </div>

                                    <Field label="Description" error={frameworkForm.errors.description}>
                                        <Textarea
                                            value={frameworkForm.data.description}
                                            onChange={(event) =>
                                                frameworkForm.setData('description', event.target.value)
                                            }
                                            placeholder="Explain the intent and usage of this framework"
                                            className="min-h-[140px] border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                        />
                                    </Field>

                                    <Field label="Status" error={frameworkForm.errors.status}>
                                        <Select
                                            value={frameworkForm.data.status}
                                            onValueChange={(value) => frameworkForm.setData('status', value)}
                                        >
                                            <SelectTrigger className="border-[#14417A]/15 focus:ring-[#14417A]">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <div className="flex flex-wrap gap-3">
                                        {mode === 'edit' ? (
                                            <Button
                                                onClick={() =>
                                                    frameworkForm.patch(
                                                        route('frameworks.update', framework.id, false),
                                                    )
                                                }
                                                className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                            >
                                                Save framework
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                asChild
                                                className="border-[#14417A]/20 text-[#14417A] hover:bg-[#14417A]/5"
                                            >
                                                <Link href={route('frameworks.edit', framework.id, false)}>
                                                    Open edit mode
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-[#14417A]/15 shadow-none">
                                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                    <CardTitle className="flex items-center gap-2 text-[#0F2E52] dark:text-blue-200">
                                        <Sparkles className="size-4" />
                                        Builder guidance
                                    </CardTitle>
                                    <CardDescription>
                                        Keep section ordering and question intent explicit before publishing.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4 p-6 text-sm">
                                    <GuidanceRow
                                        icon={Layers3}
                                        title="Organize by section"
                                        description="Group related controls together and set section weights deliberately."
                                        iconClassName="bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300"
                                    />
                                    <GuidanceRow
                                        icon={TextSearch}
                                        title="Choose the right answer type"
                                        description="Use yes / no / partial for scored controls and text, score, or date where needed."
                                        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    />
                                    <GuidanceRow
                                        icon={HelpCircle}
                                        title="Add guidance text"
                                        description="Help text improves completion quality for company admins answering the assessment."
                                        iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                    />
                                    <GuidanceRow
                                        icon={ShieldCheck}
                                        title="Publish only when ready"
                                        description="Published frameworks should be stable because submissions depend on their structure."
                                        iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="sections">
                        <div className="space-y-6">
                            {mode === 'edit' ? (
                                <Card className="border-[#14417A]/15 shadow-none">
                                    <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                        <CardTitle className="flex items-center gap-2 text-[#0F2E52] dark:text-blue-200">
                                            <Layers3 className="size-4" />
                                            Add section
                                        </CardTitle>
                                        <CardDescription>
                                            Create weighted sections and control their order in the framework.
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                                        <Field label="Name" error={sectionForm.errors.name}>
                                            <Input
                                                value={sectionForm.data.name}
                                                onChange={(event) =>
                                                    sectionForm.setData('name', event.target.value)
                                                }
                                                className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                            />
                                        </Field>

                                        <Field label="Description" error={sectionForm.errors.description}>
                                            <Input
                                                value={sectionForm.data.description}
                                                onChange={(event) =>
                                                    sectionForm.setData('description', event.target.value)
                                                }
                                                className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                            />
                                        </Field>

                                        <Field label="Sort order" error={sectionForm.errors.sort_order}>
                                            <Input
                                                value={sectionForm.data.sort_order}
                                                onChange={(event) =>
                                                    sectionForm.setData('sort_order', event.target.value)
                                                }
                                                className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                            />
                                        </Field>

                                        <Field label="Weight" error={sectionForm.errors.weight}>
                                            <Input
                                                value={sectionForm.data.weight}
                                                onChange={(event) =>
                                                    sectionForm.setData('weight', event.target.value)
                                                }
                                                className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                            />
                                        </Field>

                                        <div className="md:col-span-2 xl:col-span-4">
                                            <Button
                                                type="button"
                                                disabled={sectionForm.processing}
                                                onClick={() => {
                                                    sectionForm.transform((data) => ({
                                                            ...data,
                                                            sort_order: Number(data.sort_order),
                                                            weight: Number(data.weight),
                                                        }));
                                                    sectionForm.post(
                                                        route(
                                                            'frameworks.sections.store',
                                                            { framework: framework.id },
                                                            false,
                                                        ),
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () => {
                                                                sectionForm.reset();
                                                                sectionForm.setData(
                                                                    'sort_order',
                                                                    String(
                                                                        (framework.sections?.length ?? 0) + 2,
                                                                    ),
                                                                );
                                                                sectionForm.setData('weight', '1');
                                                            },
                                                        },
                                                    );
                                                }}
                                                className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                            >
                                                        <Plus className="mr-2 size-4" />
                                                {sectionForm.processing ? 'Adding section...' : 'Add section'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}

                            <Accordion
                                type="multiple"
                                value={openSections}
                                onValueChange={setOpenSections}
                                className="space-y-4"
                            >
                                {framework.sections?.map((section) => (
                                    <AccordionItem
                                        key={section.id}
                                        value={`section-${section.id}`}
                                        className="overflow-hidden rounded-xl border border-[#14417A]/15 bg-card px-0"
                                    >
                                        <AccordionTrigger className="px-5 py-4 hover:no-underline">
                                            <div className="flex flex-1 items-center justify-between gap-4 text-left">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                        {section.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Weight {section.weight} · Sort {section.sort_order} ·{' '}
                                                        {section.questions?.length ?? 0} questions
                                                    </div>
                                                </div>
                                                <SectionBadge />
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="border-t border-border/60 px-5 pb-5 pt-4">
                                            <SectionEditor
                                                frameworkId={framework.id}
                                                section={section}
                                                answerTypes={answerTypes}
                                                editable={mode === 'edit'}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </TabsContent>

                    <TabsContent value="help">
                        <Card className="border-[#14417A]/15 shadow-none">
                            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                <CardTitle className="flex items-center gap-2 text-[#0F2E52] dark:text-blue-200">
                                    <Workflow className="size-4" />
                                    How the flow works
                                </CardTitle>
                                <CardDescription>
                                    Use this sequence when building and rolling out a compliance framework.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 p-6 text-sm">
                                <GuidanceRow
                                    icon={BookMarked}
                                    title="1. Create the framework"
                                    description="Start with the framework name, version, status, and description so the library has a clear assessment record."
                                    iconClassName="bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300"
                                />
                                <GuidanceRow
                                    icon={Layers3}
                                    title="2. Add sections"
                                    description="Break the framework into sections such as Governance, Data Lifecycle, or Security and set sort order and section weight."
                                    iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                />
                                <GuidanceRow
                                    icon={ListChecks}
                                    title="3. Add questions"
                                    description="Inside each section, create the actual controls that companies will answer during a submission cycle."
                                    iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                />
                                <GuidanceRow
                                    icon={TextSearch}
                                    title="4. Choose answer types"
                                    description="Use yes / no / partial for scored controls, text for narrative answers, score for numeric values, and date for dated evidence points."
                                    iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                                />
                                <GuidanceRow
                                    icon={ShieldCheck}
                                    title="5. Companies answer submissions"
                                    description="Company admins open a submission from the framework, answer the questions section by section, and attach evidence where required."
                                    iconClassName="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                                />
                                <GuidanceRow
                                    icon={Sparkles}
                                    title="6. Review and scoring follow"
                                    description="Once submitted, responses and evidence move into review and the scoring engine calculates section and overall compliance results."
                                    iconClassName="bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformLayout>
    );
}

function SectionEditor({
    frameworkId,
    section,
    answerTypes,
    editable,
}: {
    frameworkId: number;
    section: NonNullable<FrameworkData['sections']>[number];
    answerTypes: AnswerTypeOption[];
    editable: boolean;
}) {
    const sectionForm = useForm({
        name: section.name,
        description: section.description ?? '',
        sort_order: String(section.sort_order),
        weight: String(section.weight),
    });

    const questionForm = useForm({
        code: '',
        question_text: '',
        answer_type: answerTypes[0]?.value ?? 'yes_no_partial',
        weight: '1',
        requires_evidence: false,
        guidance_text: '',
        sort_order: String((section.questions?.length ?? 0) + 1),
        is_active: true,
    });

    return (
        <div className="space-y-4">
            <Card className="border-[#14417A]/10 shadow-none">
                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.04] to-transparent">
                    <CardTitle className="flex items-center gap-2 text-base text-[#0F2E52] dark:text-blue-200">
                        <Scale className="size-4" />
                        Section configuration
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Name" error={sectionForm.errors.name}>
                        <Input
                            value={sectionForm.data.name}
                            onChange={(event) => sectionForm.setData('name', event.target.value)}
                            disabled={!editable}
                            className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                        />
                    </Field>

                    <Field label="Description" error={sectionForm.errors.description}>
                        <Input
                            value={sectionForm.data.description}
                            onChange={(event) => sectionForm.setData('description', event.target.value)}
                            disabled={!editable}
                            className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                        />
                    </Field>

                    <Field label="Sort order" error={sectionForm.errors.sort_order}>
                        <Input
                            value={sectionForm.data.sort_order}
                            onChange={(event) => sectionForm.setData('sort_order', event.target.value)}
                            disabled={!editable}
                            className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                        />
                    </Field>

                    <Field label="Weight" error={sectionForm.errors.weight}>
                        <Input
                            value={sectionForm.data.weight}
                            onChange={(event) => sectionForm.setData('weight', event.target.value)}
                            disabled={!editable}
                            className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                        />
                    </Field>

                    {editable ? (
                        <div className="flex items-center gap-2 md:col-span-2 xl:col-span-4">
                            <Button
                                type="button"
                                disabled={sectionForm.processing}
                                variant="outline"
                                className="border-[#14417A]/20 text-[#14417A] hover:bg-[#14417A]/5"
                                onClick={() => {
                                    sectionForm.transform((data) => ({
                                            ...data,
                                            sort_order: Number(data.sort_order),
                                            weight: Number(data.weight),
                                        }));
                                    sectionForm.patch(
                                        route(
                                            'frameworks.sections.update',
                                            { framework: frameworkId, section: section.id },
                                            false,
                                        ),
                                        { preserveScroll: true },
                                    );
                                }}
                            >
                                {sectionForm.processing ? 'Saving section...' : 'Save section'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                                onClick={() =>
                                    router.delete(
                                        route(
                                            'frameworks.sections.destroy',
                                            { framework: frameworkId, section: section.id },
                                            false,
                                        ),
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete section
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="border-[#14417A]/10 shadow-none">
                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.04] to-transparent">
                    <CardTitle className="flex items-center gap-2 text-base text-[#0F2E52] dark:text-blue-200">
                        <ListChecks className="size-4" />
                        Questions
                    </CardTitle>
                    <CardDescription>
                        Each question supports ordering, weight, guidance, and evidence rules.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 p-6">
                    {section.questions?.map((question) => (
                        <QuestionEditor
                            key={question.id}
                            sectionId={section.id}
                            question={question}
                            answerTypes={answerTypes}
                            editable={editable}
                        />
                    ))}

                    {editable ? (
                        <Card className="border-dashed border-[#14417A]/20 shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base text-[#0F2E52] dark:text-blue-200">
                                    <Plus className="size-4" />
                                    Add question
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <Field label="Code" error={questionForm.errors.code}>
                                    <Input
                                        value={questionForm.data.code}
                                        onChange={(event) =>
                                            questionForm.setData('code', event.target.value)
                                        }
                                        className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                    />
                                </Field>

                                <Field label="Answer type" error={questionForm.errors.answer_type}>
                                    <Select
                                        value={questionForm.data.answer_type}
                                        onValueChange={(value) =>
                                            questionForm.setData('answer_type', value)
                                        }
                                    >
                                        <SelectTrigger className="border-[#14417A]/15 focus:ring-[#14417A]">
                                            <SelectValue placeholder="Select answer type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {answerTypes.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field label="Question text" error={questionForm.errors.question_text}>
                                    <Textarea
                                        value={questionForm.data.question_text}
                                        onChange={(event) =>
                                            questionForm.setData('question_text', event.target.value)
                                        }
                                        className="min-h-[120px] border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                    />
                                </Field>

                                <Field label="Guidance text" error={questionForm.errors.guidance_text}>
                                    <Textarea
                                        value={questionForm.data.guidance_text}
                                        onChange={(event) =>
                                            questionForm.setData('guidance_text', event.target.value)
                                        }
                                        className="min-h-[120px] border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                    />
                                </Field>

                                <Field label="Sort order" error={questionForm.errors.sort_order}>
                                    <Input
                                        value={questionForm.data.sort_order}
                                        onChange={(event) =>
                                            questionForm.setData('sort_order', event.target.value)
                                        }
                                        className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                    />
                                </Field>

                                <Field label="Weight" error={questionForm.errors.weight}>
                                    <Input
                                        value={questionForm.data.weight}
                                        onChange={(event) =>
                                            questionForm.setData('weight', event.target.value)
                                        }
                                        className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                    />
                                </Field>

                                <label className="flex items-start gap-3 rounded-lg border border-[#14417A]/10 bg-[#14417A]/[0.03] p-3">
                                    <Checkbox
                                        checked={questionForm.data.requires_evidence}
                                        onCheckedChange={(checked) =>
                                            questionForm.setData('requires_evidence', Boolean(checked))
                                        }
                                    />
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-[#0F2E52] dark:text-blue-200">
                                            Require evidence
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Enable this if companies must upload supporting evidence.
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 rounded-lg border border-[#14417A]/10 bg-[#14417A]/[0.03] p-3">
                                    <Checkbox
                                        checked={questionForm.data.is_active}
                                        onCheckedChange={(checked) =>
                                            questionForm.setData('is_active', Boolean(checked))
                                        }
                                    />
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-[#0F2E52] dark:text-blue-200">
                                            Active question
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Inactive questions stay in the builder but should not be answered.
                                        </div>
                                    </div>
                                </label>

                                <div className="md:col-span-2">
                                    <Button
                                        type="button"
                                        disabled={questionForm.processing}
                                        onClick={() => {
                                            questionForm.transform((data) => ({
                                                    ...data,
                                                    sort_order: Number(data.sort_order),
                                                    weight: Number(data.weight),
                                                }));
                                            questionForm.post(
                                                route(
                                                    'sections.questions.store',
                                                    { section: section.id },
                                                    false,
                                                ),
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        questionForm.reset();
                                                        questionForm.setData(
                                                            'answer_type',
                                                            answerTypes[0]?.value ?? 'yes_no_partial',
                                                        );
                                                        questionForm.setData(
                                                            'sort_order',
                                                            String((section.questions?.length ?? 0) + 2),
                                                        );
                                                        questionForm.setData('weight', '1');
                                                        questionForm.setData('requires_evidence', false);
                                                        questionForm.setData('is_active', true);
                                                    },
                                                },
                                            );
                                        }}
                                        className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                    >
                                        <Plus className="mr-2 size-4" />
                                        {questionForm.processing ? 'Adding question...' : 'Add question'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}

function QuestionEditor({
    sectionId,
    question,
    answerTypes,
    editable,
}: {
    sectionId: number;
    question: NonNullable<NonNullable<FrameworkData['sections']>[number]['questions']>[number];
    answerTypes: AnswerTypeOption[];
    editable: boolean;
}) {
    const form = useForm({
        code: question.code ?? '',
        question_text: question.question_text,
        answer_type: question.answer_type,
        weight: String(question.weight),
        requires_evidence: question.requires_evidence,
        guidance_text: question.guidance_text ?? '',
        sort_order: String(question.sort_order),
        is_active: question.is_active,
    });

    return (
        <div className="rounded-xl border border-[#14417A]/10 bg-background p-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge
                    variant="outline"
                    className="border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                >
                    {form.data.answer_type}
                </Badge>
                {form.data.requires_evidence && (
                    <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                    >
                        Evidence required
                    </Badge>
                )}
                <Badge
                    variant="outline"
                    className={
                        form.data.is_active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }
                >
                    {form.data.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Code" error={form.errors.code}>
                    <Input
                        value={form.data.code}
                        onChange={(event) => form.setData('code', event.target.value)}
                        disabled={!editable}
                        className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                    />
                </Field>

                <Field label="Answer type" error={form.errors.answer_type}>
                    <Select
                        value={form.data.answer_type}
                        onValueChange={(value) => form.setData('answer_type', value)}
                        disabled={!editable}
                    >
                        <SelectTrigger className="border-[#14417A]/15 focus:ring-[#14417A]">
                            <SelectValue placeholder="Select answer type" />
                        </SelectTrigger>
                        <SelectContent>
                            {answerTypes.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Question text" error={form.errors.question_text}>
                    <Textarea
                        value={form.data.question_text}
                        onChange={(event) => form.setData('question_text', event.target.value)}
                        disabled={!editable}
                        className="min-h-[120px] border-[#14417A]/15 focus-visible:ring-[#14417A]"
                    />
                </Field>

                <Field label="Guidance text" error={form.errors.guidance_text}>
                    <Textarea
                        value={form.data.guidance_text}
                        onChange={(event) => form.setData('guidance_text', event.target.value)}
                        disabled={!editable}
                        className="min-h-[120px] border-[#14417A]/15 focus-visible:ring-[#14417A]"
                    />
                </Field>

                <Field label="Sort order" error={form.errors.sort_order}>
                    <Input
                        value={form.data.sort_order}
                        onChange={(event) => form.setData('sort_order', event.target.value)}
                        disabled={!editable}
                        className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                    />
                </Field>

                <Field label="Weight" error={form.errors.weight}>
                    <Input
                        value={form.data.weight}
                        onChange={(event) => form.setData('weight', event.target.value)}
                        disabled={!editable}
                        className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                    />
                </Field>
            </div>

            {editable ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={form.data.requires_evidence}
                            onCheckedChange={(checked) =>
                                form.setData('requires_evidence', Boolean(checked))
                            }
                        />
                        Requires evidence
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={form.data.is_active}
                            onCheckedChange={(checked) => form.setData('is_active', Boolean(checked))}
                        />
                        Active
                    </label>

                    <Button
                        type="button"
                        disabled={form.processing}
                        variant="outline"
                        className="border-[#14417A]/20 text-[#14417A] hover:bg-[#14417A]/5"
                        onClick={() => {
                            form.transform((data) => ({
                                    ...data,
                                    sort_order: Number(data.sort_order),
                                    weight: Number(data.weight),
                                }));
                            form.patch(
                                route(
                                    'sections.questions.update',
                                    { section: sectionId, question: question.id },
                                    false,
                                ),
                                { preserveScroll: true },
                            );
                        }}
                    >
                        {form.processing ? 'Saving question...' : 'Save question'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                        onClick={() =>
                            router.delete(
                                route(
                                    'sections.questions.destroy',
                                    { section: sectionId, question: question.id },
                                    false,
                                ),
                                { preserveScroll: true },
                            )
                        }
                    >
                        <Trash2 className="mr-2 size-4" />
                        Delete question
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    iconClassName,
}: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconClassName: string;
}) {
    return (
        <Card className="border-[#14417A]/15 shadow-none">
            <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                    <div className="text-2xl font-semibold tracking-tight text-[#0F2E52] dark:text-blue-200">
                        {value}
                    </div>
                </div>
                <div className={`rounded-xl p-2.5 ${iconClassName}`}>
                    <Icon className="size-4" />
                </div>
            </CardContent>
        </Card>
    );
}

function GuidanceRow({
    icon: Icon,
    title,
    description,
    iconClassName,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    iconClassName: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
            <div className={`rounded-xl p-2 ${iconClassName}`}>
                <Icon className="size-4" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-[#0F2E52] dark:text-blue-200">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-[#0F2E52] dark:text-blue-200">{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
