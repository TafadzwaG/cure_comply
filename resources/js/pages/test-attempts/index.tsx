import { DataIndexPage } from '@/components/data-index-page';
import { SortableTableHead } from '@/components/sortable-table-head';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart3, CheckCircle2, ClipboardCheck, Clock, GraduationCap, XCircle } from 'lucide-react';

function formatDuration(seconds?: number | null) {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
        const h = Math.floor(mins / 60);
        return `${h}h ${mins % 60}m`;
    }
    return `${mins}m ${secs}s`;
}

interface Attempt {
    id: number;
    attempt_number: number;
    score?: number | null;
    percentage?: number | null;
    result_status: string;
    submitted_at?: string | null;
    time_spent_seconds?: number | null;
    test?: { id: number; title: string } | null;
    user?: { id: number; name: string; email: string } | null;
    tenant?: { id: number; name: string } | null;
}

function ResultBadge({ value }: { value: string }) {
    const styles: Record<string, string> = {
        passed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
        failed: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
        pending_review: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
    };
    const labels: Record<string, string> = {
        passed: 'Passed',
        failed: 'Failed',
        pending_review: 'Pending review',
    };
    return (
        <Badge variant="outline" className={`font-medium ${styles[value] ?? 'border-border'}`}>
            {labels[value] ?? value}
        </Badge>
    );
}

export default function TestAttemptsIndex({
    attempts,
    tests,
    tenants = [],
    isSuperAdmin = false,
    filters,
    stats,
}: {
    attempts: Paginated<Attempt>;
    tests: Array<{ id: number; title: string }>;
    tenants?: Array<{ id: number; name: string }>;
    isSuperAdmin?: boolean;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        { label: 'Attempts', value: stats.total, detail: 'Total recorded test attempts.', icon: ClipboardCheck },
        { label: 'Passed', value: stats.passed, detail: 'Met or exceeded the pass mark.', icon: CheckCircle2 },
        { label: 'Failed', value: stats.failed, detail: 'Below the pass mark.', icon: XCircle },
        { label: 'Pending', value: stats.pending, detail: 'Awaiting review or grading.', icon: Clock },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Test Attempts"
                    description="See who has taken which test, when, and how they scored."
                    stats={statItems}
                    actions={[
                        { label: 'View analytics', href: route('test-attempts.analytics'), icon: BarChart3 },
                    ]}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: 'result_status',
                            label: 'Result',
                            options: [
                                { label: 'Passed', value: 'passed' },
                                { label: 'Failed', value: 'failed' },
                                { label: 'Pending review', value: 'pending_review' },
                            ],
                        },
                        {
                            key: 'test_id',
                            label: 'Test',
                            options: tests.map((t) => ({ label: t.title, value: String(t.id) })),
                        },
                        ...(isSuperAdmin
                            ? [
                                  {
                                      key: 'tenant_id',
                                      label: 'Tenant',
                                      options: tenants.map((t) => ({ label: t.name, value: String(t.id) })),
                                  },
                              ]
                            : []),
                    ]}
                    paginated={attempts}
                    tableTitle="Attempt Register"
                    tableDescription="Filter by test, tenant, or result to investigate performance."
                    exportable
                >
                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold text-[#0F2E52] dark:text-blue-200">
                                        Attempt Register
                                    </CardTitle>
                                    <CardDescription>All test attempts across users.</CardDescription>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                >
                                    {attempts.total ?? attempts.data.length} records
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="px-0 pb-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/60">
                                        <TableHead>User</TableHead>
                                        {isSuperAdmin && <TableHead>Tenant</TableHead>}
                                        <TableHead>Test</TableHead>
                                        <SortableTableHead label="Attempt" column="attempt_number" filters={filters} />
                                        <SortableTableHead label="Score" column="percentage" filters={filters} />
                                        <TableHead>Result</TableHead>
                                        <TableHead>Time</TableHead>
                                        <SortableTableHead label="Submitted" column="submitted_at" filters={filters} />
                                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attempts.data.map((attempt) => (
                                        <TableRow key={attempt.id} className="border-border/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                                            <TableCell className="py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                                        <GraduationCap className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#0F2E52] dark:text-blue-200">
                                                            {attempt.user?.name ?? 'Unknown user'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{attempt.user?.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {isSuperAdmin && (
                                                <TableCell className="py-4">
                                                    <span className="text-sm font-medium text-[#0F2E52] dark:text-blue-200">
                                                        {attempt.tenant?.name ?? 'Platform'}
                                                    </span>
                                                </TableCell>
                                            )}
                                            <TableCell className="py-4 text-sm">{attempt.test?.title ?? '—'}</TableCell>
                                            <TableCell className="py-4 tabular-nums">{attempt.attempt_number}</TableCell>
                                            <TableCell className="py-4 font-medium tabular-nums">
                                                {attempt.percentage != null ? `${attempt.percentage}%` : '—'}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <ResultBadge value={attempt.result_status} />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDuration(attempt.time_spent_seconds)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-sm text-muted-foreground">
                                                {attempt.submitted_at
                                                    ? new Date(attempt.submitted_at).toLocaleString('en-GB', {
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                {attempt.test && (
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-[#14417A]/20 text-[#14417A] hover:bg-[#14417A]/5"
                                                    >
                                                        <Link href={route('tests.attempts.show', [attempt.test.id, attempt.id])}>
                                                            Review
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {attempts.data.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={isSuperAdmin ? 9 : 8}
                                                className="py-12 text-center text-sm text-muted-foreground"
                                            >
                                                No test attempts match the current filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </DataIndexPage>
            </div>
        </PlatformLayout>
    );
}
