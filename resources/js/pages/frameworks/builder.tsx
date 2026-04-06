import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { ReactNode } from 'react';
import { BookMarked, FileStack, HelpCircle, Layers3, ListChecks, PencilRuler, Plus, Scale, ShieldCheck, Sparkles, TextSearch, Trash2, Workflow } from 'lucide-react';

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

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title={framework.name}
                    description="Expandable builder workspace for framework settings, section ordering, and question design."
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                            <PencilRuler className="size-3.5" />
                            Framework builder
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                            <HelpCircle className="size-3.5" />
                            Help
                        </Badge>
                    </div>
                </PageHeader>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Sections" value={framework.sections?.length ?? 0} icon={Layers3} />
                    <MetricCard
                        label="Questions"
                        value={framework.sections?.reduce((carry, section) => carry + (section.questions?.length ?? 0), 0) ?? 0}
                        icon={ListChecks}
                    />
                    <MetricCard label="Submissions" value={framework.submissions_count ?? 0} icon={ShieldCheck} />
                    <MetricCard label="Status" value={framework.status} icon={BookMarked} />
                </section>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="h-auto w-full justify-start rounded-xl border border-border bg-muted/35 p-1">
                        <TabsTrigger value="overview" className="rounded-lg px-4 py-2.5">
                            <BookMarked className="size-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="sections" className="rounded-lg px-4 py-2.5">
                            <Layers3 className="size-4" />
                            Sections & questions
                        </TabsTrigger>
                        <TabsTrigger value="help" className="rounded-lg px-4 py-2.5">
                            <HelpCircle className="size-4" />
                            Help
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookMarked className="size-4" />
                                        Framework details
                                    </CardTitle>
                                    <CardDescription>Update top-level metadata that identifies and publishes the framework.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Framework name" error={frameworkForm.errors.name}>
                                            <Input value={frameworkForm.data.name} onChange={(event) => frameworkForm.setData('name', event.target.value)} />
                                        </Field>
                                        <Field label="Version" error={frameworkForm.errors.version}>
                                            <Input value={frameworkForm.data.version} onChange={(event) => frameworkForm.setData('version', event.target.value)} />
                                        </Field>
                                    </div>

                                    <Field label="Description" error={frameworkForm.errors.description}>
                                        <Textarea
                                            value={frameworkForm.data.description}
                                            onChange={(event) => frameworkForm.setData('description', event.target.value)}
                                            placeholder="Explain the intent and usage of this framework"
                                        />
                                    </Field>

                                    <Field label="Status" error={frameworkForm.errors.status}>
                                        <Select value={frameworkForm.data.status} onValueChange={(value) => frameworkForm.setData('status', value)}>
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

                                    {mode === 'edit' ? (
                                        <Button onClick={() => frameworkForm.patch(route('frameworks.update', framework.id, false))}>Save framework</Button>
                                    ) : (
                                        <Button variant="outline" asChild>
                                            <Link href={route('frameworks.edit', framework.id, false)}>Open edit mode</Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="size-4" />
                                        Builder guidance
                                    </CardTitle>
                                    <CardDescription>Keep section ordering and question intent explicit before publishing.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <GuidanceRow icon={Layers3} title="Organize by section" description="Group related controls together and set section weights deliberately." />
                                    <GuidanceRow icon={TextSearch} title="Choose the right answer type" description="Use yes / no / partial for scored controls and text, score, or date where needed." />
                                    <GuidanceRow icon={HelpCircle} title="Add guidance text" description="Help text improves completion quality for company admins answering the assessment." />
                                    <GuidanceRow icon={ShieldCheck} title="Publish only when ready" description="Published frameworks should be stable because submissions depend on their structure." />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="sections">
                        <div className="space-y-6">
                            {mode === 'edit' ? (
                                <Card className="border-border/70 shadow-none">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Layers3 className="size-4" />
                                            Add section
                                        </CardTitle>
                                        <CardDescription>Create weighted sections and control their order in the framework.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <Field label="Name" error={sectionForm.errors.name}>
                                            <Input value={sectionForm.data.name} onChange={(event) => sectionForm.setData('name', event.target.value)} />
                                        </Field>
                                        <Field label="Description" error={sectionForm.errors.description}>
                                            <Input value={sectionForm.data.description} onChange={(event) => sectionForm.setData('description', event.target.value)} />
                                        </Field>
                                        <Field label="Sort order" error={sectionForm.errors.sort_order}>
                                            <Input value={sectionForm.data.sort_order} onChange={(event) => sectionForm.setData('sort_order', event.target.value)} />
                                        </Field>
                                        <Field label="Weight" error={sectionForm.errors.weight}>
                                            <Input value={sectionForm.data.weight} onChange={(event) => sectionForm.setData('weight', event.target.value)} />
                                        </Field>
                                        <div className="md:col-span-2 xl:col-span-4">
                                            <Button
                                                onClick={() =>
                                                    sectionForm.transform((data) => ({
                                                        ...data,
                                                        sort_order: Number(data.sort_order),
                                                        weight: Number(data.weight),
                                                    })).post(route('frameworks.sections.store', framework.id, false), {
                                                        onSuccess: () => {
                                                            sectionForm.reset();
                                                            sectionForm.setData('sort_order', String((framework.sections?.length ?? 0) + 2));
                                                            sectionForm.setData('weight', '1');
                                                        },
                                                    })
                                                }
                                            >
                                                <Plus className="size-4" />
                                                Add section
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}

                            <Accordion type="multiple" className="space-y-4">
                                {framework.sections?.map((section) => (
                                    <AccordionItem key={section.id} value={`section-${section.id}`} className="rounded-xl border border-border/70 bg-card px-5">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex flex-1 items-center justify-between gap-4 text-left">
                                                <div>
                                                    <div className="text-sm font-semibold">{section.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Weight {section.weight} · Sort {section.sort_order} · {section.questions?.length ?? 0} questions
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="rounded-full px-3 py-1">
                                                    <FileStack className="size-3.5" />
                                                    Section
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <SectionEditor frameworkId={framework.id} section={section} answerTypes={answerTypes} editable={mode === 'edit'} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </TabsContent>

                    <TabsContent value="help">
                        <Card className="border-border/70 bg-muted/20 shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Workflow className="size-4" />
                                    How the flow works
                                </CardTitle>
                                <CardDescription>Use this sequence when building and rolling out a compliance framework.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <GuidanceRow icon={BookMarked} title="1. Create the framework" description="Start with the framework name, version, status, and description so the library has a clear assessment record." />
                                <GuidanceRow icon={Layers3} title="2. Add sections" description="Break the framework into sections such as Governance, Data Lifecycle, or Security and set sort order and section weight." />
                                <GuidanceRow icon={ListChecks} title="3. Add questions" description="Inside each section, create the actual controls that companies will answer during a submission cycle." />
                                <GuidanceRow icon={TextSearch} title="4. Choose answer types" description="Use yes / no / partial for scored controls, text for narrative answers, score for numeric values, and date for dated evidence points." />
                                <GuidanceRow icon={ShieldCheck} title="5. Companies answer submissions" description="Company admins open a submission from the framework, answer the questions section by section, and attach evidence where required." />
                                <GuidanceRow icon={Sparkles} title="6. Review and scoring follow" description="Once submitted, responses and evidence move into review and the scoring engine calculates section and overall compliance results." />
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
            <Card className="border-border/70 shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Scale className="size-4" />
                        Section configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Name" error={sectionForm.errors.name}>
                        <Input value={sectionForm.data.name} onChange={(event) => sectionForm.setData('name', event.target.value)} disabled={!editable} />
                    </Field>
                    <Field label="Description" error={sectionForm.errors.description}>
                        <Input value={sectionForm.data.description} onChange={(event) => sectionForm.setData('description', event.target.value)} disabled={!editable} />
                    </Field>
                    <Field label="Sort order" error={sectionForm.errors.sort_order}>
                        <Input value={sectionForm.data.sort_order} onChange={(event) => sectionForm.setData('sort_order', event.target.value)} disabled={!editable} />
                    </Field>
                    <Field label="Weight" error={sectionForm.errors.weight}>
                        <Input value={sectionForm.data.weight} onChange={(event) => sectionForm.setData('weight', event.target.value)} disabled={!editable} />
                    </Field>
                    {editable ? (
                        <div className="md:col-span-2 xl:col-span-4 flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    sectionForm.transform((data) => ({
                                        ...data,
                                        sort_order: Number(data.sort_order),
                                        weight: Number(data.weight),
                                    })).patch(route('frameworks.sections.update', [frameworkId, section.id], false))
                                }
                            >
                                Save section
                            </Button>
                            <Button variant="outline" onClick={() => router.delete(route('frameworks.sections.destroy', [frameworkId, section.id], false))}>
                                <Trash2 className="size-4" />
                                Delete section
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ListChecks className="size-4" />
                        Questions
                    </CardTitle>
                    <CardDescription>Each question supports ordering, weight, guidance, and evidence rules.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {section.questions?.map((question) => (
                        <QuestionEditor key={question.id} sectionId={section.id} question={question} answerTypes={answerTypes} editable={editable} />
                    ))}

                    {editable ? (
                        <Card className="border-dashed border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Plus className="size-4" />
                                    Add question
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <Field label="Code" error={questionForm.errors.code}>
                                    <Input value={questionForm.data.code} onChange={(event) => questionForm.setData('code', event.target.value)} />
                                </Field>
                                <Field label="Answer type" error={questionForm.errors.answer_type}>
                                    <Select value={questionForm.data.answer_type} onValueChange={(value) => questionForm.setData('answer_type', value)}>
                                        <SelectTrigger>
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
                                    <Textarea value={questionForm.data.question_text} onChange={(event) => questionForm.setData('question_text', event.target.value)} />
                                </Field>
                                <Field label="Guidance text" error={questionForm.errors.guidance_text}>
                                    <Textarea value={questionForm.data.guidance_text} onChange={(event) => questionForm.setData('guidance_text', event.target.value)} />
                                </Field>
                                <Field label="Sort order" error={questionForm.errors.sort_order}>
                                    <Input value={questionForm.data.sort_order} onChange={(event) => questionForm.setData('sort_order', event.target.value)} />
                                </Field>
                                <Field label="Weight" error={questionForm.errors.weight}>
                                    <Input value={questionForm.data.weight} onChange={(event) => questionForm.setData('weight', event.target.value)} />
                                </Field>
                                <label className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                                    <Checkbox
                                        checked={questionForm.data.requires_evidence}
                                        onCheckedChange={(checked) => questionForm.setData('requires_evidence', Boolean(checked))}
                                    />
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">Require evidence</div>
                                        <div className="text-xs text-muted-foreground">Enable this if companies must upload supporting evidence.</div>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                                    <Checkbox checked={questionForm.data.is_active} onCheckedChange={(checked) => questionForm.setData('is_active', Boolean(checked))} />
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">Active question</div>
                                        <div className="text-xs text-muted-foreground">Inactive questions stay in the builder but should not be answered.</div>
                                    </div>
                                </label>
                                <div className="md:col-span-2">
                                    <Button
                                        onClick={() =>
                                            questionForm.transform((data) => ({
                                                ...data,
                                                sort_order: Number(data.sort_order),
                                                weight: Number(data.weight),
                                            })).post(route('sections.questions.store', section.id, false), {
                                                onSuccess: () => {
                                                    questionForm.reset();
                                                    questionForm.setData('answer_type', answerTypes[0]?.value ?? 'yes_no_partial');
                                                    questionForm.setData('sort_order', String((section.questions?.length ?? 0) + 2));
                                                    questionForm.setData('weight', '1');
                                                    questionForm.setData('requires_evidence', false);
                                                    questionForm.setData('is_active', true);
                                                },
                                            })
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add question
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
        <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Code" error={form.errors.code}>
                    <Input value={form.data.code} onChange={(event) => form.setData('code', event.target.value)} disabled={!editable} />
                </Field>
                <Field label="Answer type" error={form.errors.answer_type}>
                    <Select value={form.data.answer_type} onValueChange={(value) => form.setData('answer_type', value)} disabled={!editable}>
                        <SelectTrigger>
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
                    <Textarea value={form.data.question_text} onChange={(event) => form.setData('question_text', event.target.value)} disabled={!editable} />
                </Field>
                <Field label="Guidance text" error={form.errors.guidance_text}>
                    <Textarea value={form.data.guidance_text} onChange={(event) => form.setData('guidance_text', event.target.value)} disabled={!editable} />
                </Field>
                <Field label="Sort order" error={form.errors.sort_order}>
                    <Input value={form.data.sort_order} onChange={(event) => form.setData('sort_order', event.target.value)} disabled={!editable} />
                </Field>
                <Field label="Weight" error={form.errors.weight}>
                    <Input value={form.data.weight} onChange={(event) => form.setData('weight', event.target.value)} disabled={!editable} />
                </Field>
            </div>

            {editable ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.data.requires_evidence} onCheckedChange={(checked) => form.setData('requires_evidence', Boolean(checked))} />
                        Requires evidence
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.data.is_active} onCheckedChange={(checked) => form.setData('is_active', Boolean(checked))} />
                        Active
                    </label>
                    <Button
                        variant="outline"
                        onClick={() =>
                            form.transform((data) => ({
                                ...data,
                                sort_order: Number(data.sort_order),
                                weight: Number(data.weight),
                            })).patch(route('sections.questions.update', [sectionId, question.id], false))
                        }
                    >
                        Save question
                    </Button>
                    <Button variant="outline" onClick={() => router.delete(route('sections.questions.destroy', [sectionId, question.id], false))}>
                        <Trash2 className="size-4" />
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
}: {
    label: string;
    value: string | number;
    icon: typeof Layers3;
}) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                    <div className="text-2xl font-semibold tracking-tight">{value}</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/35 p-2.5">
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
}: {
    icon: typeof Layers3;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border/70 bg-background p-2">
                <Icon className="size-4" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium">{title}</p>
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
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
