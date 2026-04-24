import { BrandCard } from '@/components/brand-card';
import InputError from '@/components/input-error';
import { IconChip } from '@/components/icon-chip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, router, useForm, useRemember } from '@inertiajs/react';
import { ReactNode, useEffect } from 'react';
import {
    ArrowLeft,
    BookMarked,
    FileStack,
    HelpCircle,
    Layers3,
    ListChecks,
    LucideIcon,
    PencilRuler,
    Pencil,
    Plus,
    Save,
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
    const activeQuestions =
        framework.sections?.reduce(
            (carry, section) => carry + (section.questions?.filter((question) => question.is_active).length ?? 0),
            0,
        ) ?? 0;
    const readiness = questionsCount ? Math.round((activeQuestions / questionsCount) * 100) : 0;

    useEffect(() => {
        const sectionIds = framework.sections?.map((section) => String(section.id)) ?? [];

        setOpenSections((current) => Array.from(new Set([...current, ...sectionIds])));
    }, [framework.sections, setOpenSections]);

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
                    <BrandCard
                        title="Framework builder"
                        description="Shape the framework shell, then organize sections and weighted questions from one workspace."
                        className="bg-card"
                        headerRight={<IconChip icon={<BookMarked className="size-4" />} />}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                        PrivacyCure framework builder
                                    </Badge>
                                    <StatusPill value={framework.status} />
                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                        {mode === 'edit' ? 'Edit mode' : 'View mode'}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl font-semibold tracking-tight">{framework.name}</h1>
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Configure framework metadata, organize sections, and build the compliance question bank with answer types, weights, and evidence rules.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <BuilderMetric label="Sections" value={`${framework.sections?.length ?? 0}`} detail="Current section groups" icon={Layers3} />
                                <BuilderMetric label="Questions" value={`${questionsCount}`} detail="Controls in the bank" icon={ListChecks} />
                                <BuilderMetric label="Coverage" value={`${readiness}%`} detail={`${activeQuestions} active questions`} icon={ShieldCheck} />
                                <BuilderMetric label="Submissions" value={`${framework.submissions_count ?? 0}`} detail="Submission records linked" icon={Workflow} />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {mode === 'edit' ? (
                                    <Button
                                        onClick={() => frameworkForm.patch(route('frameworks.update', framework.id, false))}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Save framework
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <Link href={route('frameworks.edit', framework.id, false)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Open edit mode
                                        </Link>
                                    </Button>
                                )}

                                <Button asChild variant="outline">
                                    <Link href={route('frameworks.index', undefined, false)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to frameworks
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </BrandCard>

                    <BrandCard
                        title="Builder rail"
                        description="Keep the framework structured and stable before publishing."
                        className="bg-muted/20"
                        headerRight={<IconChip icon={<Sparkles className="size-4" />} className="border border-border/70 bg-background p-2.5 text-foreground" />}
                    >
                        <div className="space-y-4">
                            <GuidanceRow
                                icon={Layers3}
                                title="Organize by section"
                                description="Group related controls together and set section order and weight deliberately."
                                iconClassName="bg-muted text-muted-foreground"
                            />
                            <GuidanceRow
                                icon={TextSearch}
                                title="Choose answer types carefully"
                                description="Use scored and narrative answer types intentionally so scoring and review remain meaningful."
                                iconClassName="bg-muted text-muted-foreground"
                            />
                            <GuidanceRow
                                icon={HelpCircle}
                                title="Add guidance text"
                                description="Guidance text improves answer quality and reduces confusion during tenant submissions."
                                iconClassName="bg-muted text-muted-foreground"
                            />
                            <GuidanceRow
                                icon={ShieldCheck}
                                title="Publish only when stable"
                                description="Published frameworks should be structurally stable because tenant submissions rely on their layout."
                                iconClassName="bg-muted text-muted-foreground"
                            />
                        </div>
                    </BrandCard>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Sections"
                        value={framework.sections?.length ?? 0}
                        icon={Layers3}
                        iconClassName="bg-muted text-muted-foreground"
                    />
                    <MetricCard
                        label="Questions"
                        value={questionsCount}
                        icon={ListChecks}
                        iconClassName="bg-muted text-muted-foreground"
                    />
                    <MetricCard
                        label="Submissions"
                        value={framework.submissions_count ?? 0}
                        icon={ShieldCheck}
                        iconClassName="bg-muted text-muted-foreground"
                    />
                    <MetricCard
                        label="Status"
                        value={framework.status}
                        icon={BookMarked}
                        iconClassName="bg-muted text-muted-foreground"
                    />
                </section>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="overview" className="gap-2">
                            <BookMarked className="size-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="sections" className="gap-2">
                            <Layers3 className="size-4" />
                            Sections & questions
                        </TabsTrigger>
                        <TabsTrigger value="help" className="gap-2">
                            <HelpCircle className="size-4" />
                            Help
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                            <BrandCard
                                title="Framework details"
                                description="Update top-level metadata that identifies and publishes the framework."
                                headerRight={<IconChip icon={<BookMarked className="size-4" />} />}
                            >
                                <div className="space-y-5">
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

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#002753] dark:text-white">Question readiness</span>
                                            <span className="tabular-nums text-muted-foreground">{readiness}%</span>
                                        </div>
                                        <Progress className="h-2 bg-[#e6e8ea]" value={readiness} />
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
                                                <Save className="mr-2 h-4 w-4" />
                                                Save framework
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                asChild
                                                className="border-[#14417A]/20 text-[#14417A] hover:bg-[#14417A]/5"
                                            >
                                                <Link href={route('frameworks.edit', framework.id, false)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Open edit mode
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </BrandCard>

                            <BrandCard
                                title="Builder guidance"
                                description="Keep section ordering and question intent explicit before publishing."
                                headerRight={<IconChip icon={<Sparkles className="size-4" />} />}
                            >
                                <div className="space-y-4 text-sm">
                                    <GuidanceRow
                                        icon={Layers3}
                                        title="Organize by section"
                                        description="Group related controls together and set section weights deliberately."
                                        iconClassName="bg-muted text-muted-foreground"
                                    />
                                    <GuidanceRow
                                        icon={TextSearch}
                                        title="Choose the right answer type"
                                        description="Use yes / no / partial for scored controls and text, score, or date where needed."
                                        iconClassName="bg-muted text-muted-foreground"
                                    />
                                    <GuidanceRow
                                        icon={HelpCircle}
                                        title="Add guidance text"
                                        description="Help text improves completion quality for company admins answering the assessment."
                                        iconClassName="bg-muted text-muted-foreground"
                                    />
                                    <GuidanceRow
                                        icon={ShieldCheck}
                                        title="Publish only when ready"
                                        description="Published frameworks should be stable because submissions depend on their structure."
                                        iconClassName="bg-muted text-muted-foreground"
                                    />
                                </div>
                            </BrandCard>
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
                                {framework.sections?.map((section, idx) => (
                                    <AccordionItem
                                        key={section.id}
                                        value={`section-${section.id}`}
                                        className="overflow-hidden rounded-xl border border-border/70 bg-card px-0 shadow-none"
                                    >
                                        <AccordionTrigger className="px-5 py-4 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/60 [&[data-state=open]]:bg-muted/20">
                                            <div className="flex flex-1 items-center justify-between gap-4 text-left">
                                                <div className="flex items-center gap-3">
                                                    <IconChip icon={<FileStack className="h-4 w-4" />} className="h-10 w-10 rounded-lg" />
                                                    <div className="space-y-0.5">
                                                        <div className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                            {idx + 1}. {section.name}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Scale className="h-3 w-3" />
                                                            <span>Weight {section.weight}</span>
                                                            <span>·</span>
                                                            <ListChecks className="h-3 w-3" />
                                                            <span>{section.questions?.length ?? 0} questions</span>
                                                        </div>
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
                                    iconClassName="bg-muted text-muted-foreground"
                                />
                                <GuidanceRow
                                    icon={Layers3}
                                    title="2. Add sections"
                                    description="Break the framework into sections such as Governance, Data Lifecycle, or Security and set sort order and section weight."
                                    iconClassName="bg-muted text-muted-foreground"
                                />
                                <GuidanceRow
                                    icon={ListChecks}
                                    title="3. Add questions"
                                    description="Inside each section, create the actual controls that companies will answer during a submission cycle."
                                    iconClassName="bg-muted text-muted-foreground"
                                />
                                <GuidanceRow
                                    icon={TextSearch}
                                    title="4. Choose answer types"
                                    description="Use yes / no / partial for scored controls, text for narrative answers, score for numeric values, and date for dated evidence points."
                                    iconClassName="bg-muted text-muted-foreground"
                                />
                                <GuidanceRow
                                    icon={ShieldCheck}
                                    title="5. Companies answer submissions"
                                    description="Company admins open a submission from the framework, answer the questions section by section, and attach evidence where required."
                                    iconClassName="bg-muted text-muted-foreground"
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

    const generateQuestionCode = () => {
        questionForm.setData(
            'code',
            buildQuestionCode({
                sectionName: section.name,
                sectionSortOrder: section.sort_order,
                questionSortOrder: questionForm.data.sort_order,
            }),
        );
    };

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
                                <Save className="mr-2 h-4 w-4" />
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
                            sectionName={section.name}
                            sectionSortOrder={section.sort_order}
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
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={questionForm.data.code}
                                            onChange={(event) =>
                                                questionForm.setData('code', event.target.value)
                                            }
                                            className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-[#14417A]/20 text-[#14417A] hover:bg-[#14417A]/5 hover:text-[#14417A]"
                                            onClick={generateQuestionCode}
                                        >
                                            <Sparkles className="mr-2 size-4" />
                                            Auto generate
                                        </Button>
                                    </div>
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
    sectionName,
    sectionSortOrder,
    question,
    answerTypes,
    editable,
}: {
    sectionId: number;
    sectionName: string;
    sectionSortOrder: number;
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

    const generateQuestionCode = () => {
        form.setData(
            'code',
            buildQuestionCode({
                sectionName,
                sectionSortOrder,
                questionSortOrder: form.data.sort_order,
            }),
        );
    };

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
                    <div className="flex items-center gap-2">
                        <Input
                            value={form.data.code}
                            onChange={(event) => form.setData('code', event.target.value)}
                            disabled={!editable}
                            className="border-[#14417A]/15 focus-visible:ring-[#14417A]"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!editable}
                            className="border-[#14417A]/20 text-[#14417A] hover:bg-[#14417A]/5 hover:text-[#14417A]"
                            onClick={generateQuestionCode}
                        >
                            <Sparkles className="mr-2 size-4" />
                            Auto generate
                        </Button>
                    </div>
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

function BuilderMetric({
    label,
    value,
    detail,
    icon: Icon,
}: {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
}) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
                <IconChip icon={<Icon className="size-4" />} />
                <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold text-[#002753] dark:text-white">{value}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
            </div>
        </div>
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

function buildQuestionCode({
    sectionName,
    sectionSortOrder,
    questionSortOrder,
}: {
    sectionName: string;
    sectionSortOrder: number | string;
    questionSortOrder: number | string;
}) {
    const sectionToken = buildShortSectionCode(sectionName) || 'SEC';

    return [
        sectionToken,
        formatQuestionCodeNumber(sectionSortOrder),
        formatQuestionCodeNumber(questionSortOrder),
    ].join('-');
}

function buildShortSectionCode(value: string) {
    const words = value
        .toUpperCase()
        .split(/[^A-Z0-9]+/)
        .filter(Boolean)
        .filter((word) => !['AND', 'OF', 'THE', 'TO', 'FOR', 'IN', 'ON', 'WITH'].includes(word));

    if (words.length === 0) {
        return '';
    }

    if (words.length === 1) {
        return words[0].slice(0, 4);
    }

    return words
        .slice(0, 4)
        .map((word) => word[0])
        .join('');
}

function formatQuestionCodeNumber(value: number | string) {
    const parsed = Number.parseInt(String(value), 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return '01';
    }

    return String(parsed).padStart(2, '0');
}
