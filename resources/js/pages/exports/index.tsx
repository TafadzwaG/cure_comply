import { DataIndexPage } from '@/components/data-index-page';
import { EmptyState } from '@/components/empty-state';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters } from '@/types';
import { AlertCircle, CheckCircle2, Download, FileText, LoaderCircle, TimerReset } from 'lucide-react';
import moment from 'moment';

interface ExportRow {
    id: number;
    source: string;
    source_label: string;
    format: string;
    status: string;
    file_name?: string | null;
    error_message?: string | null;
    created_at?: string | null;
    completed_at?: string | null;
    download_url?: string | null;
}

export default function ExportsIndex({
    exports,
    filters,
    stats,
    sources,
    highlight,
}: {
    exports: Paginated<ExportRow>;
    filters: TableFilters;
    stats: Record<string, number>;
    sources: Array<{ label: string; value: string }>;
    highlight?: number | null;
}) {
    const statItems: IndexStat[] = [
        { label: 'Exports', value: stats.total, detail: 'All export requests created by this account.', icon: FileText },
        { label: 'Queued', value: stats.queued, detail: 'Jobs waiting for processing.', icon: TimerReset },
        { label: 'Completed', value: stats.completed, detail: 'Files ready for authenticated download.', icon: CheckCircle2 },
        { label: 'Failed', value: stats.failed, detail: 'Exports that need to be retried.', icon: AlertCircle },
    ];

    return (
        <PlatformLayout>
            <DataIndexPage
                title="Exports"
                description="A retrieval workspace for queued Excel and PDF exports from reports, employee operations, and other index pages."
                stats={statItems}
                filters={filters}
                filterConfigs={[
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { label: 'Queued', value: 'queued' },
                            { label: 'Processing', value: 'processing' },
                            { label: 'Completed', value: 'completed' },
                            { label: 'Failed', value: 'failed' },
                        ],
                    },
                    {
                        key: 'format',
                        label: 'Format',
                        options: [
                            { label: 'Excel', value: 'xlsx' },
                            { label: 'PDF', value: 'pdf' },
                        ],
                    },
                    {
                        key: 'source',
                        label: 'Source',
                        options: sources,
                    },
                ]}
                paginated={exports}
                tableTitle="Export queue"
                tableDescription="Completed files remain downloadable here even after the initial ready notification has been dismissed."
            >
                {exports.data.length ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableTableHead label="Export" column="source" filters={filters} />
                                <SortableTableHead label="Format" column="format" filters={filters} />
                                <SortableTableHead label="Status" column="status" filters={filters} />
                                <SortableTableHead label="Requested" column="created_at" filters={filters} />
                                <SortableTableHead label="Completed" column="completed_at" filters={filters} />
                                <TableHead className="w-[130px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exports.data.map((exportItem) => {
                                const isHighlighted = highlight === exportItem.id;

                                return (
                                    <TableRow key={exportItem.id} className={isHighlighted ? 'bg-[#14417A]/5' : undefined}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{exportItem.file_name ?? exportItem.source_label}</div>
                                                <div className="text-xs text-muted-foreground">{exportItem.source_label}</div>
                                                {exportItem.error_message ? (
                                                    <div className="text-xs text-destructive">{exportItem.error_message}</div>
                                                ) : null}
                                                {isHighlighted ? (
                                                    <Badge variant="outline" className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A]">
                                                        Latest export
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{exportItem.format.toUpperCase()}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge value={exportItem.status} />
                                        </TableCell>
                                        <TableCell>{formatDateTime(exportItem.created_at)}</TableCell>
                                        <TableCell>{exportItem.completed_at ? formatDateTime(exportItem.completed_at) : 'Pending'}</TableCell>
                                        <TableCell className="text-right">
                                            {exportItem.download_url ? (
                                                <Button asChild size="sm" variant="outline">
                                                    <a href={exportItem.download_url}>
                                                        <Download className="size-4" />
                                                        Download
                                                    </a>
                                                </Button>
                                            ) : exportItem.status === 'processing' || exportItem.status === 'queued' ? (
                                                <Button size="sm" variant="outline" disabled>
                                                    <LoaderCircle className="size-4 animate-spin" />
                                                    Processing
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No file</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="p-6">
                        <EmptyState
                            icon={Download}
                            title="No exports yet"
                            description="Queued exports will appear here once you request Excel or PDF output from a supported page."
                        />
                    </div>
                )}
            </DataIndexPage>
        </PlatformLayout>
    );
}

function formatDateTime(value?: string | null) {
    return value ? moment(value).format('ddd D MMM YYYY h:mm A') : 'N/A';
}
