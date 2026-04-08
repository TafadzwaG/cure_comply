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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BarChart3,
    CheckCircle2,
    Clock,
    GraduationCap,
    ListChecks,
    ShieldCheck,
    TrendingUp,
    XCircle,
} from 'lucide-react';

interface FrameworkRow {
    framework_id: number;
    framework_name: string;
    total_attempts: number;
    passed: number;
    failed: number;
    pending: number;
    pass_rate: number;
    avg_score: number;
    avg_time_seconds: number;
}

interface Overall {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    avg_score: number;
    avg_time_seconds: number;
}

function formatDuration(seconds: number) {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    }
    return `${mins}m ${secs}s`;
}

function PassRateDonut({ value }: { value: number }) {
    const pct = Math.max(0, Math.min(100, value));
    const radius = 26;
    const stroke = 6;
    const c = 2 * Math.PI * radius;
    const offset = c - (pct / 100) * c;
    const color = pct >= 80 ? '#059669' : pct >= 50 ? '#d97706' : '#e11d48';
    return (
        <div className="relative flex h-16 w-16 items-center justify-center">
            <svg width="64" height="64" className="-rotate-90">
                <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-muted" />
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-xs font-semibold text-[#0F2E52] dark:text-blue-200">{Math.round(pct)}%</span>
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground">pass</span>
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    detail,
    accent = 'text-[#14417A]',
}: {
    icon: typeof BarChart3;
    label: string;
    value: string | number;
    detail?: string;
    accent?: string;
}) {
    return (
        <Card className="border-[#14417A]/15 shadow-none">
            <CardContent className="flex items-start gap-3 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground ${accent}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold text-[#0F2E52] dark:text-blue-200">{value}</p>
                    {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

export default function TestAttemptsAnalytics({
    frameworks,
    overall,
}: {
    frameworks: FrameworkRow[];
    overall: Overall;
}) {
    const overallPassRate = overall.total > 0 ? Math.round((overall.passed / overall.total) * 100) : 0;

    return (
        <PlatformLayout>
            <Head title="Test Analytics" />

            <div className="space-y-6">
                <PageHeader
                    title="Test analytics"
                    description="Pass/fail performance and time-on-task broken down per compliance framework."
                    icon={BarChart3}
                    eyebrow="PrivacyCure Insights"
                >
                    <Button asChild size="sm" className="bg-white text-[#0F2E52] hover:bg-white/90 hover:text-black">
                        <Link href={route('test-attempts.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to attempts
                        </Link>
                    </Button>
                </PageHeader>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={ListChecks} label="Total attempts" value={overall.total} detail={`${overallPassRate}% overall pass rate`} />
                    <StatCard icon={CheckCircle2} label="Passed" value={overall.passed} detail={`${overall.failed} failed`} />
                    <StatCard icon={TrendingUp} label="Avg score" value={`${overall.avg_score}%`} detail="Across all frameworks" />
                    <StatCard icon={Clock} label="Avg time on task" value={formatDuration(overall.avg_time_seconds)} detail="Per attempt" />
                </div>

                <Card className="border-[#14417A]/15 shadow-none">
                    <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold text-[#0F2E52] dark:text-blue-200">
                                    Per-framework performance
                                </CardTitle>
                                <CardDescription>Pass rate, score, and average time-on-task for each linked framework.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        {frameworks.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                No test attempts recorded yet.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/60">
                                        <TableHead>Framework</TableHead>
                                        <TableHead>Pass rate</TableHead>
                                        <TableHead>Outcomes</TableHead>
                                        <TableHead>Avg score</TableHead>
                                        <TableHead>Avg time</TableHead>
                                        <TableHead className="text-right">Attempts</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {frameworks.map((row) => (
                                        <TableRow
                                            key={`${row.framework_id}-${row.framework_name}`}
                                            className="border-border/60 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                                        >
                                            <TableCell className="py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                        <GraduationCap className="h-4 w-4" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                            {row.framework_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {row.total_attempts} attempts
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <PassRateDonut value={row.pass_rate} />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        {row.passed} passed
                                                    </Badge>
                                                    <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                        {row.failed} failed
                                                    </Badge>
                                                    {row.pending > 0 && (
                                                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                                                            {row.pending} pending
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                    {row.avg_score}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDuration(row.avg_time_seconds)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <Badge
                                                    variant="outline"
                                                    className="border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                                >
                                                    {row.total_attempts}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PlatformLayout>
    );
}
