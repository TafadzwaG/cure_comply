import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters } from '@/types';
import { router } from '@inertiajs/react';
import { ClipboardCheck, FileBadge2, FolderSync, ShieldCheck } from 'lucide-react';

interface Submission {
    id: number;
    title: string;
    status: string;
    reporting_period?: string | null;
    framework?: { id: number; name: string } | null;
    score?: { overall_score?: number | null } | null;
}

export default function SubmissionsIndex({
    submissions,
    frameworks,
    filters,
    stats,
}: {
    submissions: Paginated<Submission>;
    frameworks: Array<{ id: number; name: string }>;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        { label: 'Submissions', value: stats.total, detail: 'Compliance execution records.', icon: ClipboardCheck },
        { label: 'Submitted', value: stats.submitted, detail: 'Awaiting review and scoring.', icon: ShieldCheck },
        { label: 'In review', value: stats.inReview, detail: 'Currently being assessed.', icon: FolderSync },
        { label: 'Scored', value: stats.scored, detail: 'Completed calculations available.', icon: FileBadge2 },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Compliance Submissions"
                    description="Create and manage tenant submissions against the selected framework version."
                    stats={statItems}
                    actions={[{ label: 'New Submission', href: route('submissions.create'), icon: ClipboardCheck }]}
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
                            options: frameworks.map((framework) => ({ label: framework.name, value: String(framework.id) })),
                        },
                    ]}
                    paginated={submissions}
                    tableTitle="Submission Register"
                    tableDescription="Submissions move from draft to submitted, then into scoring and closure."
                    exportable
                >
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <SortableTableHead label="Title" column="title" filters={filters} />
                            <TableHead>Framework</TableHead>
                            <TableHead>Score</TableHead>
                            <SortableTableHead label="Status" column="status" filters={filters} />
                            <TableHead className="w-[70px] text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.data.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell>{submission.title}</TableCell>
                                    <TableCell>{submission.framework?.name}</TableCell>
                                    <TableCell>{submission.score?.overall_score ?? 'Not scored'}</TableCell>
                                    <TableCell><StatusBadge value={submission.status} /></TableCell>
                                    <TableCell className="text-right">
                                        <RowActionsMenu
                                            actions={[
                                                { label: 'View submission', href: route('submissions.show', submission.id) },
                                                { label: 'Recalculate', method: 'post', href: route('submissions.recalculate', submission.id) },
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DataIndexPage>
            </div>
        </PlatformLayout>
    );
}
