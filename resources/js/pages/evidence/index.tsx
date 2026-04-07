import moment from 'moment';

import { DataIndexPage } from '@/components/data-index-page';
import { EvidenceReviewDialog } from '@/components/evidence-review-dialog';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters } from '@/types';
import { Link } from '@inertiajs/react';
import {
    CheckCheck,
    Clock3,
    Download,
    FileCheck2,
    FileSearch,
    FileText,
    MoreHorizontal,
    ShieldAlert,
} from 'lucide-react';

interface EvidenceFileRow {
    id: number;
    original_name: string;
    file_size?: number | null;
    uploaded_at?: string | null;
    review_status: string;
    uploader?: { name?: string | null } | null;
    reviews?: Array<{
        id: number;
        review_status: string;
        review_comment?: string | null;
        reviewed_at?: string | null;
        reviewer?: { name?: string | null } | null;
    }>;
    response?: {
        question?: {
            question_text?: string | null;
        } | null;
    } | null;
}

function StatusPill({ value }: { value: string }) {
    const styles: Record<string, string> = {
        pending:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
        approved:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
        rejected:
            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
    };

    return (
        <Badge
            variant="outline"
            className={`capitalize font-medium ${styles[value.toLowerCase()] ?? 'border-border bg-background text-foreground'}`}
        >
            {value}
        </Badge>
    );
}

function formatFileSize(bytes?: number | null) {
    if (!bytes || bytes <= 0) return 'Unknown size';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size % 1 === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

function UploadedBadge({ uploadedAt }: { uploadedAt?: string | null }) {
    if (!uploadedAt) {
        return (
            <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
                No upload date
            </Badge>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <Badge
                variant="outline"
                className="w-fit border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
            >
                {moment(uploadedAt).format('DD MMM YYYY, HH:mm')}
            </Badge>
            <span className="text-xs text-muted-foreground">{moment(uploadedAt).fromNow()}</span>
        </div>
    );
}

export default function EvidenceIndex({
    evidence,
    filters,
    stats,
    frameworks = [],
    tenants = [],
    isSuperAdmin = false,
}: {
    evidence: Paginated<EvidenceFileRow>;
    filters: TableFilters;
    stats: Record<string, number>;
    frameworks?: Array<{ id: number; name: string }>;
    tenants?: Array<{ id: number; name: string }>;
    isSuperAdmin?: boolean;
}) {
    const statItems: IndexStat[] = [
        {
            label: 'Evidence files',
            value: stats.total,
            detail: 'Files stored for compliance responses.',
            icon: ShieldAlert,
        },
        {
            label: 'Pending',
            value: stats.pending,
            detail: 'Waiting for reviewer action.',
            icon: Clock3,
        },
        {
            label: 'Approved',
            value: stats.approved,
            detail: 'Accepted supporting evidence.',
            icon: CheckCheck,
        },
        {
            label: 'Rejected',
            value: stats.rejected,
            detail: 'Rejected or insufficient evidence.',
            icon: ShieldAlert,
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Evidence Review"
                    description="Review uploaded files, download artifacts securely, and record formal evidence decisions."
                    stats={statItems}
                    actions={[
                        {
                            label: 'Open Pending Queue',
                            href: '/evidence?review_status=pending',
                            icon: Clock3,
                        },
                    ]}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: 'review_status',
                            label: 'Review Status',
                            options: [
                                { label: 'Pending', value: 'pending' },
                                { label: 'Approved', value: 'approved' },
                                { label: 'Rejected', value: 'rejected' },
                            ],
                        },
                        {
                            key: 'framework_id',
                            label: 'Framework',
                            options: frameworks.map((f) => ({ label: f.name, value: String(f.id) })),
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
                    paginated={evidence}
                    tableTitle="Evidence Queue"
                    tableDescription="All files are stored privately and exposed through authorized downloads."
                    exportable
                >
                    <div className="space-y-6">
                        <Card className="border-[#14417A]/15 shadow-none">
                            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold text-[#0F2E52] dark:text-blue-200">
                                            Evidence Queue
                                        </CardTitle>
                                        <CardDescription>
                                            A brand-led view of uploaded compliance evidence, timestamps, and review
                                            decisions.
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                    >
                                        {evidence.total ?? evidence.data.length} records
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="px-0 pb-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/60">
                                            <TableHead>Question</TableHead>
                                            <SortableTableHead label="File" column="original_name" filters={filters} />
                                            <SortableTableHead label="Uploaded" column="uploaded_at" filters={filters} />
                                            <SortableTableHead
                                                label="Review Status"
                                                column="review_status"
                                                filters={filters}
                                            />
                                            <TableHead className="w-[220px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {evidence.data.map((file) => (
                                            <TableRow
                                                key={file.id}
                                                className="border-border/60 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                            <FileSearch className="h-4 w-4" />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className="font-medium text-[#0F2E52] dark:text-blue-200">
                                                                {file.response?.question?.question_text ?? 'No linked question'}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Evidence #{file.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                                            <FileText className="h-4 w-4" />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <a
                                                                href={route('evidence.download', file.id, false)}
                                                                className="font-medium text-[#0F2E52] hover:text-[#14417A] hover:underline dark:text-blue-200 dark:hover:text-blue-300"
                                                            >
                                                                {file.original_name}
                                                            </a>

                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-sm text-muted-foreground">
                                                                    {file.uploader?.name ?? 'Unknown uploader'}
                                                                </p>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                                                >
                                                                    {formatFileSize(file.file_size)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <UploadedBadge uploadedAt={file.uploaded_at} />
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <StatusPill value={file.review_status} />
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                                        >
                                                            <a href={route('evidence.download', file.id, false)}>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download
                                                            </a>
                                                        </Button>

                                                        <EvidenceReviewDialog evidenceFile={file} compact />

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

                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <a href={route('evidence.download', file.id, false)}>
                                                                        Download evidence
                                                                    </a>
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem>
                                                                    <FileCheck2 className="mr-2 h-4 w-4" />
                                                                    Review evidence
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem className="text-muted-foreground">
                                                                    Uploaded by {file.uploader?.name ?? 'Unknown uploader'}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {evidence.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="py-12 text-center text-sm text-muted-foreground"
                                                >
                                                    No evidence files found for the current filters.
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