import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlarmClock,
    ArrowLeft,
    Building2,
    FileSearch,
    GraduationCap,
    ListChecks,
    ShieldAlert,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';

interface Scorecard {
    id: number;
    name: string;
    tenant?: string | null;
    employees: number;
    training_completion: number;
    overdue_assignments: number;
    avg_test_score: number;
    pending_evidence: number;
    risk_score: number;
    total_assignments: number;
    completed_assignments: number;
}

interface Props {
    scorecards: Scorecard[];
    tenants: Array<{ id: number; name: string }>;
    isSuperAdmin: boolean;
    selectedTenantId: number | null;
}

function Donut({
    value,
    size = 100,
    stroke = 10,
    label,
    sublabel,
    accent = 'brand',
}: {
    value: number;
    size?: number;
    stroke?: number;
    label: string;
    sublabel?: string;
    accent?: 'emerald' | 'amber' | 'rose' | 'brand';
}) {
    const pct = Math.max(0, Math.min(100, value));
    const radius = (size - stroke) / 2;
    const c = 2 * Math.PI * radius;
    const offset = c - (pct / 100) * c;

    const strokeColor =
        accent === 'emerald'
            ? '#059669'
            : accent === 'amber'
            ? '#d97706'
            : accent === 'rose'
            ? '#e11d48'
            : '#14417A';

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="none"
                        className="text-muted"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={c}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-xl font-semibold text-[#0F2E52] dark:text-blue-200">
                        {Math.round(pct)}%
                    </span>
                    <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                        {label}
                    </span>
                </div>
            </div>
            {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
        </div>
    );
}

function riskAccent(risk: number): 'emerald' | 'amber' | 'rose' {
    if (risk <= 25) return 'emerald';
    if (risk <= 60) return 'amber';
    return 'rose';
}

function completionAccent(pct: number): 'emerald' | 'amber' | 'rose' {
    if (pct >= 80) return 'emerald';
    if (pct >= 50) return 'amber';
    return 'rose';
}

export default function DepartmentScorecards({ scorecards, tenants, isSuperAdmin, selectedTenantId }: Props) {
    const totalEmployees = scorecards.reduce((s, d) => s + d.employees, 0);
    const avgCompletion =
        scorecards.length > 0
            ? Math.round(scorecards.reduce((s, d) => s + d.training_completion, 0) / scorecards.length)
            : 0;
    const totalOverdue = scorecards.reduce((s, d) => s + d.overdue_assignments, 0);
    const avgRisk =
        scorecards.length > 0 ? Math.round(scorecards.reduce((s, d) => s + d.risk_score, 0) / scorecards.length) : 0;

    return (
        <PlatformLayout>
            <Head title="Department Scorecards" />

            <div className="space-y-6">
                <PageHeader
                    title="Department scorecards"
                    description="Per-department training, testing, evidence, and composite risk — at a glance."
                    icon={Target}
                    eyebrow="PrivacyCure Workforce"
                >
                    <Button asChild size="sm" className="bg-white text-[#0F2E52] hover:bg-white/90 hover:text-black">
                        <Link href={route('departments.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to directory
                        </Link>
                    </Button>
                </PageHeader>

                {isSuperAdmin && (
                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="flex flex-wrap items-center gap-3 p-4">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Tenant filter:</span>
                            <Select
                                value={selectedTenantId ? String(selectedTenantId) : 'all'}
                                onValueChange={(value) =>
                                    router.get(
                                        route('departments.scorecards'),
                                        value === 'all' ? {} : { tenant_id: value },
                                        { preserveState: false },
                                    )
                                }
                            >
                                <SelectTrigger className="w-[260px]">
                                    <SelectValue placeholder="All tenants" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All tenants</SelectItem>
                                    {tenants.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                )}

                {/* Overall KPIs */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="flex items-start gap-3 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Users className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Workforce
                                </p>
                                <p className="text-2xl font-semibold text-[#0F2E52] dark:text-blue-200">
                                    {totalEmployees}
                                </p>
                                <p className="text-xs text-muted-foreground">Across {scorecards.length} departments</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="flex items-start gap-3 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-emerald-600">
                                <GraduationCap className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Avg training completion
                                </p>
                                <p className="text-2xl font-semibold text-[#0F2E52] dark:text-blue-200">
                                    {avgCompletion}%
                                </p>
                                <p className="text-xs text-muted-foreground">Across all departments</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="flex items-start gap-3 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-rose-600">
                                <AlarmClock className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Overdue assignments
                                </p>
                                <p className="text-2xl font-semibold text-[#0F2E52] dark:text-blue-200">
                                    {totalOverdue}
                                </p>
                                <p className="text-xs text-muted-foreground">Across all departments</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="flex items-start gap-3 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-amber-600">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Avg risk score
                                </p>
                                <p className="text-2xl font-semibold text-[#0F2E52] dark:text-blue-200">{avgRisk}</p>
                                <p className="text-xs text-muted-foreground">
                                    Lower is better (0 = healthy, 100 = critical)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Scorecard grid */}
                {scorecards.length === 0 ? (
                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            No departments to score yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {scorecards.map((d) => (
                            <Card
                                key={d.id}
                                className="border-[#14417A]/15 shadow-none transition-colors hover:border-[#14417A]/40"
                            >
                                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <CardTitle className="text-base font-semibold text-[#0F2E52] dark:text-blue-200">
                                                    {d.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 text-xs">
                                                    <Users className="h-3 w-3" />
                                                    {d.employees} {d.employees === 1 ? 'employee' : 'employees'}
                                                    {d.tenant && <span className="text-muted-foreground/60"> · {d.tenant}</span>}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                riskAccent(d.risk_score) === 'emerald'
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : riskAccent(d.risk_score) === 'amber'
                                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                                            }
                                        >
                                            Risk {d.risk_score}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5 p-5">
                                    <div className="grid grid-cols-3 gap-2">
                                        <Donut
                                            value={d.training_completion}
                                            label="training"
                                            sublabel={`${d.completed_assignments}/${d.total_assignments}`}
                                            accent={completionAccent(d.training_completion)}
                                            size={90}
                                            stroke={9}
                                        />
                                        <Donut
                                            value={d.avg_test_score}
                                            label="test avg"
                                            sublabel="Across attempts"
                                            accent={completionAccent(d.avg_test_score)}
                                            size={90}
                                            stroke={9}
                                        />
                                        <Donut
                                            value={100 - d.risk_score}
                                            label="health"
                                            sublabel="Composite"
                                            accent={riskAccent(d.risk_score) === 'rose' ? 'rose' : riskAccent(d.risk_score) === 'amber' ? 'amber' : 'emerald'}
                                            size={90}
                                            stroke={9}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
                                        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                                            <AlarmClock className="h-4 w-4 text-rose-600" />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                    Overdue
                                                </p>
                                                <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                    {d.overdue_assignments}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                                            <FileSearch className="h-4 w-4 text-amber-600" />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                    Evidence pending
                                                </p>
                                                <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                    {d.pending_evidence}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                                            <ListChecks className="h-4 w-4 text-[#14417A]" />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                    Assignments
                                                </p>
                                                <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                    {d.total_assignments}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                    Completed
                                                </p>
                                                <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                    {d.completed_assignments}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PlatformLayout>
    );
}
