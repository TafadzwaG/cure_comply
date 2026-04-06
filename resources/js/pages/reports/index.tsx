import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformLayout from '@/layouts/platform-layout';
import { router } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ClipboardCheck,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    GraduationCap,
    LayoutPanelTop,
    SearchCheck,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface Filters {
    tenant_id?: number | string;
    department_id?: number | string;
    employee_id?: number | string;
    framework_id?: number | string;
    status?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    reports: {
        employeeTraining: Array<Record<string, unknown>>;
        testPerformance: Array<Record<string, unknown>>;
        complianceSummary: Array<Record<string, unknown>>;
        evidenceStatus: Array<Record<string, unknown>>;
    };
    filters: Filters;
}

type ReportKey = keyof Props['reports'];

const reportMeta: Record<
    ReportKey,
    {
        value: string;
        title: string;
        description: string;
        icon: typeof GraduationCap;
        excelRoute: string;
        pdfRoute: string;
        emptyMessage: string;
        eyebrow: string;
    }
> = {
    employeeTraining: {
        value: 'training',
        title: 'Employee Training Report',
        description: 'Assignment coverage, completion visibility, and due-date readiness for workforce training.',
        icon: GraduationCap,
        excelRoute: 'reports.employee-training',
        pdfRoute: 'reports.employee-training',
        emptyMessage: 'No employee training rows match the current filters.',
        eyebrow: 'Learning operations',
    },
    testPerformance: {
        value: 'tests',
        title: 'Test Performance Report',
        description: 'Attempts, best score, latest score, and pass or fail outcomes across assessments.',
        icon: ClipboardCheck,
        excelRoute: 'reports.test-performance',
        pdfRoute: 'reports.test-performance',
        emptyMessage: 'No test performance rows match the current filters.',
        eyebrow: 'Assessment intelligence',
    },
    complianceSummary: {
        value: 'compliance',
        title: 'Compliance Summary Report',
        description: 'Framework-level submission performance with score and rating visibility.',
        icon: ShieldCheck,
        excelRoute: 'reports.compliance-summary',
        pdfRoute: 'reports.compliance-summary',
        emptyMessage: 'No compliance summary rows match the current filters.',
        eyebrow: 'Framework scoring',
    },
    evidenceStatus: {
        value: 'evidence',
        title: 'Evidence Status Report',
        description: 'Evidence counts, review states, and reviewer commentary across compliance responses.',
        icon: BarChart3,
        excelRoute: 'reports.evidence-status',
        pdfRoute: 'reports.evidence-status',
        emptyMessage: 'No evidence status rows match the current filters.',
        eyebrow: 'Review pipeline',
    },
};

export default function ReportsIndex({ reports, filters }: Props) {
    const [form, setForm] = useState<Filters>({
        tenant_id: filters.tenant_id ?? '',
        department_id: filters.department_id ?? '',
        employee_id: filters.employee_id ?? '',
        framework_id: filters.framework_id ?? '',
        status: filters.status ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const summaryCards = useMemo(
        () => [
            {
                label: 'Training records',
                value: reports.employeeTraining.length,
                detail: 'Employee course assignment and completion output.',
                icon: GraduationCap,
            },
            {
                label: 'Assessment records',
                value: reports.testPerformance.length,
                detail: 'Attempt and scoring visibility for test activity.',
                icon: ClipboardCheck,
            },
            {
                label: 'Compliance records',
                value: reports.complianceSummary.length,
                detail: 'Submission scores and framework-level outcomes.',
                icon: ShieldCheck,
            },
            {
                label: 'Evidence records',
                value: reports.evidenceStatus.length,
                detail: 'Review-state and comment tracking for evidence.',
                icon: BarChart3,
            },
        ],
        [reports],
    );

    const totalRows = Object.values(reports).reduce((carry, dataset) => carry + dataset.length, 0);
    const densestReport = useMemo(() => {
        return Object.entries(reports).reduce(
            (largest, [key, rows]) => {
                if (rows.length > largest.count) {
                    return { key: key as ReportKey, count: rows.length };
                }

                return largest;
            },
            { key: 'employeeTraining' as ReportKey, count: reports.employeeTraining.length },
        );
    }, [reports]);

    const activeFilters = Object.keys(clean(form)).length;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.get(route('reports.index'), clean(form), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="Reports" description="A monochrome reporting workspace for filtered previews, operational exports, and compliance-ready snapshots.">
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Raw shadcn workspace
                    </Badge>
                </PageHeader>

                <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                    <Card className="border-border/70 bg-card shadow-none">
                        <CardContent className="space-y-6 p-6">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                                <div className="space-y-3">
                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                        Reporting command center
                                    </Badge>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-semibold tracking-tight">Preview, compare, and export from the same monochrome workspace</h2>
                                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                            Every report uses the same filter state, gives you a structured preview, and exposes one-click Excel or PDF exports
                                            without leaving the page.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <TopMetricCard label="Total rows" value={totalRows} icon={LayoutPanelTop} />
                                    <TopMetricCard label="Active filters" value={activeFilters} icon={SlidersHorizontal} />
                                    <TopMetricCard
                                        label="Largest dataset"
                                        value={reportMeta[densestReport.key].title.replace(' Report', '')}
                                        icon={Sparkles}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {summaryCards.map((item) => (
                                    <SummaryCard key={item.label} {...item} total={totalRows} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 bg-muted/20 shadow-none">
                        <CardHeader className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg border border-border/70 bg-background p-2.5">
                                    <Filter className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-medium">Filter control rail</CardTitle>
                                    <CardDescription>Adjust the reporting scope before preview or export.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ReportInsight
                                icon={CheckCircle2}
                                title="Shared filter state"
                                description="The same filters feed every tab so your previews and downloads stay aligned."
                            />
                            <Separator />
                            <ReportInsight
                                icon={FileSpreadsheet}
                                title="Operational exports"
                                description="Excel downloads support internal analysis, external delivery, and regulator-ready extracts."
                            />
                            <Separator />
                            <ReportInsight
                                icon={FileText}
                                title="Management snapshots"
                                description="PDF outputs are designed for lightweight oversight and distribution to non-technical stakeholders."
                            />
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <Card className="border-border/70 shadow-none xl:sticky xl:top-6">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Filter className="size-4 text-muted-foreground" />
                                <CardTitle className="text-base font-medium">Filters</CardTitle>
                            </div>
                            <CardDescription>Use direct IDs and status constraints to narrow report datasets precisely.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
                                <FilterField
                                    label="Tenant ID"
                                    value={String(form.tenant_id ?? '')}
                                    onChange={(value) => setForm((current) => ({ ...current, tenant_id: value }))}
                                    placeholder="Optional tenant scope"
                                />
                                <FilterField
                                    label="Department ID"
                                    value={String(form.department_id ?? '')}
                                    onChange={(value) => setForm((current) => ({ ...current, department_id: value }))}
                                    placeholder="Optional department scope"
                                />
                                <FilterField
                                    label="Employee ID"
                                    value={String(form.employee_id ?? '')}
                                    onChange={(value) => setForm((current) => ({ ...current, employee_id: value }))}
                                    placeholder="Optional employee scope"
                                />
                                <FilterField
                                    label="Framework ID"
                                    value={String(form.framework_id ?? '')}
                                    onChange={(value) => setForm((current) => ({ ...current, framework_id: value }))}
                                    placeholder="Optional framework scope"
                                />

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={String(form.status ?? '__all__')}
                                        onValueChange={(value) => setForm((current) => ({ ...current, status: value === '__all__' ? '' : value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">Any status</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="submitted">Submitted</SelectItem>
                                            <SelectItem value="in_review">In review</SelectItem>
                                            <SelectItem value="scored">Scored</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                    <FilterField
                                        label="Date From"
                                        type="date"
                                        value={String(form.date_from ?? '')}
                                        onChange={(value) => setForm((current) => ({ ...current, date_from: value }))}
                                    />
                                    <FilterField
                                        label="Date To"
                                        type="date"
                                        value={String(form.date_to ?? '')}
                                        onChange={(value) => setForm((current) => ({ ...current, date_to: value }))}
                                    />
                                </div>

                                <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Filter intensity</p>
                                            <p className="mt-1 text-sm font-medium">{activeFilters} active constraints</p>
                                        </div>
                                        <Badge variant="outline" className="rounded-full px-3 py-1">
                                            {activeFilters === 0 ? 'Open view' : 'Scoped'}
                                        </Badge>
                                    </div>
                                    <Progress className="mt-4 h-2 bg-muted" value={Math.min((activeFilters / 7) * 100, 100)} />
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button type="submit" className="min-w-36">
                                        <SearchCheck className="size-4" />
                                        Apply Filters
                                    </Button>
                                    <Button asChild variant="outline">
                                        <a href={route('reports.index')}>
                                            <ArrowRight className="size-4" />
                                            Reset View
                                        </a>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Tabs defaultValue="training" className="space-y-4">
                            <TabsList className="h-auto w-full justify-start rounded-xl border border-border bg-muted/35 p-1">
                                {Object.entries(reportMeta).map(([key, meta]) => {
                                    const Icon = meta.icon;

                                    return (
                                        <TabsTrigger key={key} value={meta.value} className="gap-2 rounded-lg px-4 py-2.5">
                                            <Icon className="size-4" />
                                            {meta.title.replace(' Report', '')}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            <TabsContent value="training" className="space-y-4">
                                <ReportWorkspacePanel rows={reports.employeeTraining} filters={form} meta={reportMeta.employeeTraining} />
                            </TabsContent>

                            <TabsContent value="tests" className="space-y-4">
                                <ReportWorkspacePanel rows={reports.testPerformance} filters={form} meta={reportMeta.testPerformance} />
                            </TabsContent>

                            <TabsContent value="compliance" className="space-y-4">
                                <ReportWorkspacePanel rows={reports.complianceSummary} filters={form} meta={reportMeta.complianceSummary} />
                            </TabsContent>

                            <TabsContent value="evidence" className="space-y-4">
                                <ReportWorkspacePanel rows={reports.evidenceStatus} filters={form} meta={reportMeta.evidenceStatus} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>
            </div>
        </PlatformLayout>
    );
}

function TopMetricCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    icon: typeof Sparkles;
}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold tracking-tight">{value}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background p-2">
                    <Icon className="size-4" />
                </div>
            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    detail,
    icon: Icon,
    total,
}: {
    label: string;
    value: number;
    detail: string;
    icon: typeof GraduationCap;
    total: number;
}) {
    const percent = total === 0 ? 0 : Math.round((value / total) * 100);

    return (
        <Card className="border-border/70 bg-background shadow-none">
            <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-muted/35 p-2.5">
                        <Icon className="size-4" />
                    </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Share of current workspace</span>
                        <span>{percent}%</span>
                    </div>
                    <Progress className="h-2 bg-muted" value={percent} />
                </div>
            </CardContent>
        </Card>
    );
}

function ReportInsight({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof CheckCircle2;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border/70 bg-background p-2 text-foreground">
                <Icon className="size-4" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function FilterField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        </div>
    );
}

function ReportWorkspacePanel({
    rows,
    filters,
    meta,
}: {
    rows: Array<Record<string, unknown>>;
    filters: Filters;
    meta: (typeof reportMeta)[ReportKey];
}) {
    const Icon = meta.icon;
    const previewRows = rows.slice(0, 8);
    const headings = deriveHeadings(previewRows);
    const populatedColumns = headings.length;
    const exportBase = route(meta.excelRoute);

    return (
        <div className="space-y-4">
            <Card className="border-border/70 bg-card shadow-none">
                <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                            {meta.eyebrow}
                        </Badge>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg border border-border/70 bg-muted/30 p-2.5">
                                    <Icon className="size-4" />
                                </div>
                                <CardTitle className="text-2xl tracking-tight">{meta.title}</CardTitle>
                            </div>
                            <CardDescription className="max-w-3xl leading-6">{meta.description}</CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline">
                            <a href={buildExportUrl(exportBase, filters, 'xlsx')}>
                                <FileSpreadsheet className="size-4" />
                                Export Excel
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href={buildExportUrl(route(meta.pdfRoute), filters, 'pdf')}>
                                <FileText className="size-4" />
                                Export PDF
                            </a>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <ReportMiniMetric label="Filtered rows" value={rows.length} />
                    <ReportMiniMetric label="Preview rows" value={previewRows.length} />
                    <ReportMiniMetric label="Columns surfaced" value={populatedColumns} />
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
                <Card className="border-border/70 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Preview table</CardTitle>
                        <CardDescription>First eight rows from the current filtered dataset.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {previewRows.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border/70 bg-muted/25 p-10 text-sm text-muted-foreground">
                                {meta.emptyMessage}
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-border/70">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {headings.map((heading) => (
                                                <TableHead key={heading}>{humanize(heading)}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewRows.map((row, index) => (
                                            <TableRow key={`${meta.title}-${index}`}>
                                                {headings.map((heading) => (
                                                    <TableCell key={heading} className="align-top text-sm leading-6">
                                                        {renderCell(row[heading])}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-muted/20 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Export notes</CardTitle>
                        <CardDescription>Operational guidance for using this report effectively.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ReportInsight
                            icon={Download}
                            title="Use Excel for downstream handling"
                            description="Excel exports are better for sorting, pivoting, and combining this output with external operational data."
                        />
                        <Separator />
                        <ReportInsight
                            icon={FileText}
                            title="Use PDF for lightweight circulation"
                            description="PDF exports are better for board packs, reviewer summaries, and management updates where editability is not needed."
                        />
                        <Separator />
                        <ReportInsight
                            icon={ShieldCheck}
                            title="Current permissions still apply"
                            description="The preview and export endpoints continue to respect tenant visibility and role-based access rules."
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ReportMiniMetric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        </div>
    );
}

function deriveHeadings(rows: Array<Record<string, unknown>>) {
    const first = rows[0];

    return first ? Object.keys(first) : [];
}

function humanize(value: string) {
    return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderCell(value: unknown): string {
    if (Array.isArray(value)) {
        return value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(' | ');
    }

    if (value && typeof value === 'object') {
        return JSON.stringify(value);
    }

    return value === null || value === undefined || value === '' ? 'N/A' : String(value);
}

function buildExportUrl(baseUrl: string, filters: Filters, format: 'xlsx' | 'pdf') {
    const params = new URLSearchParams();

    Object.entries(clean(filters)).forEach(([key, value]) => {
        params.set(key, String(value));
    });

    params.set('format', format);

    return `${baseUrl}?${params.toString()}`;
}

function clean(filters: Filters) {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
}
