import { DataIndexPage } from '@/components/data-index-page';
import { SortableTableHead } from '@/components/sortable-table-head';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
    ClipboardCheck,
    Eye,
    FileBadge2,
    FolderSync,
    MoreHorizontal,
    Plus,
    RotateCw,
    ShieldCheck,
} from 'lucide-react';

interface Submission {
    id: number;
    title: string;
    status: string;
    reporting_period?: string | null;
    framework?: { id: number; name: string } | null;
    score?: { overall_score?: number | null } | null;
    tenant?: { id: number; name: string } | null;
}

function StatusPill({ value }: { value: string }) {
    const styles: Record<string, string> = {
        draft:
            'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
        submitted:
            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300',
        in_review:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
        scored:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
        closed:
            'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300',
    };

    const labels: Record<string, string> = {
        draft: 'Draft',
        submitted: 'Submitted',
        in_review: 'In Review',
        scored: 'Scored',
        closed: 'Closed',
    };

    return (
        <Badge
            variant="outline"
            className={`font-medium ${styles[value?.toLowerCase()] ?? 'border-border bg-background text-foreground'}`}
        >
            {labels[value?.toLowerCase()] ?? value}
        </Badge>
    );
}

function ScoreDonut({ score }: { score?: number | null }) {
    if (score === null || score === undefined) {
        return <span className="text-xs text-muted-foreground">Not scored</span>;
    }

    const value = Math.max(0, Math.min(100, Number(score)));
    const stroke =
        value >= 80 ? '#059669' : value >= 50 ? '#d97706' : '#e11d48';
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted"
                />
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">{value}%</span>
        </div>
    );
}

export default function SubmissionsIndex({
    submissions,
    frameworks,
    filters,
    stats,
    isSuperAdmin = false,
    tenants = [],
}: {
    submissions: Paginated<Submission>;
    frameworks: Array<{ id: number; name: string }>;
    filters: TableFilters;
    stats: Record<string, number>;
    isSuperAdmin?: boolean;
    tenants?: Array<{ id: number; name: string }>;
}) {
    const statItems: IndexStat[] = [
        {
            label: 'Submissions',
            value: stats.total,
            detail: 'Compliance execution records.',
            icon: ClipboardCheck,
        },
        {
            label: 'Submitted',
            value: stats.submitted,
            detail: 'Awaiting review and scoring.',
            icon: ShieldCheck,
        },
        {
            label: 'In review',
            value: stats.inReview,
            detail: 'Currently being assessed.',
            icon: FolderSync,
        },
        {
            label: 'Scored',
            value: stats.scored,
            detail: 'Completed calculations available.',
            icon: FileBadge2,
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Compliance Submissions"
                    description="Create and manage tenant submissions against the selected framework version."
                    stats={statItems}
                    actions={[
                        {
                            label: 'New Submission',
                            href: route('submissions.create'),
                            icon: ClipboardCheck,
                        },
                    ]}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Draft', value: 'draft' },
                                { label: 'Submitted', value: 'submitted' },
                                { label: 'In Review', value: 'in_review' },
                                { label: 'Scored', value: 'scored' },
                                { label: 'Closed', value: 'closed' },
                            ],
                        },
                        {
                            key: 'framework_id',
                            label: 'Framework',
                            options: frameworks.map((framework) => ({
                                label: framework.name,
                                value: String(framework.id),
                            })),
                        },
                        ...(isSuperAdmin
                            ? [
                                  {
                                      key: 'tenant_id',
                                      label: 'Tenant',
                                      options: tenants.map((tenant) => ({
                                          label: tenant.name,
                                          value: String(tenant.id),
                                      })),
                                  },
                              ]
                            : []),
                    ]}
                    paginated={submissions}
                    tableTitle="Submission Register"
                    tableDescription="Submissions move from draft to submitted, then into scoring and closure."
                    exportable
                >
                    <div className="space-y-6">
                        <Card className="overflow-hidden border-0 shadow-none">
                            <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="max-w-2xl space-y-2">
                                        <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                            PrivacyCure Submission Hub
                                        </Badge>
                                        <h2 className="text-2xl font-semibold tracking-tight">
                                            Manage compliance submissions
                                        </h2>
                                        <p className="text-sm text-white/80">
                                            Track framework submissions, review progress, and surface scoring results.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-white text-[#0F2E52] hover:bg-white/90"
                                        >
                                            <Link href={route('submissions.create')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Submission
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                                        >
                                            {submissions.total ?? submissions.data.length} Total Submissions
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#14417A]/15 shadow-none">
                            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold text-[#0F2E52] dark:text-blue-200">
                                            Submission Register
                                        </CardTitle>
                                        <CardDescription>
                                            A brand-led view of active submissions, linked frameworks, and score state.
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                    >
                                        {submissions.total ?? submissions.data.length} records
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="px-0 pb-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/60">
                                            <SortableTableHead label="Title" column="title" filters={filters} />
                                            {isSuperAdmin && <TableHead>Tenant</TableHead>}
                                            <TableHead>Framework</TableHead>
                                            <TableHead>Score</TableHead>
                                            <SortableTableHead label="Status" column="status" filters={filters} />
                                            <TableHead className="w-[190px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {submissions.data.map((submission) => (
                                            <TableRow
                                                key={submission.id}
                                                className="border-border/60 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                                            <ClipboardCheck className="h-4 w-4" />
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <Link
                                                                href={route('submissions.show', submission.id)}
                                                                className="text-sm font-semibold text-[#0F2E52] hover:text-[#14417A] hover:underline dark:text-blue-200 dark:hover:text-blue-300"
                                                            >
                                                                {submission.title}
                                                            </Link>
                                                            <p className="text-xs text-muted-foreground">
                                                                Submission #{submission.id}
                                                                {submission.reporting_period ? ` · ${submission.reporting_period}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {isSuperAdmin && (
                                                    <TableCell className="py-4">
                                                        <span className="text-sm text-[#0F2E52] dark:text-blue-200">
                                                            {submission.tenant?.name ?? 'Platform'}
                                                        </span>
                                                    </TableCell>
                                                )}

                                                <TableCell className="py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                                    >
                                                        {submission.framework?.name ?? 'No framework'}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <ScoreDonut score={submission.score?.overall_score} />
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <StatusPill value={submission.status} />
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                                        >
                                                            <Link href={route('submissions.show', submission.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                            onClick={() =>
                                                                router.post(route('submissions.recalculate', submission.id))
                                                            }
                                                        >
                                                            <RotateCw className="mr-2 h-4 w-4" />
                                                            Recalculate
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="border-[#14417A]/20 text-[#14417A] hover:bg-[#14417A]/5 hover:text-[#14417A]"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Open actions</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent align="end" className="w-44">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('submissions.show', submission.id)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View submission
                                                                    </Link>
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.post(
                                                                            route('submissions.recalculate', submission.id),
                                                                        )
                                                                    }
                                                                >
                                                                    <RotateCw className="mr-2 h-4 w-4" />
                                                                    Recalculate
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {submissions.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={isSuperAdmin ? 6 : 5}
                                                    className="py-12 text-center text-sm text-muted-foreground"
                                                >
                                                    No submissions found for the current filters.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </DataIndexPage>
            </div>
        </PlatformLayout>
    );
}