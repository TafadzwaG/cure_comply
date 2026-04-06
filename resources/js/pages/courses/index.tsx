import { DataIndexPage } from '@/components/data-index-page';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters } from '@/types';
import { router } from '@inertiajs/react';
import { BookOpen, FileStack, FolderKanban, PenSquare } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    estimated_minutes?: number | null;
    modules_count?: number;
    tests_count?: number;
}

export default function CoursesIndex({ courses, filters, stats }: { courses: Paginated<Course>; filters: TableFilters; stats: Record<string, number> }) {
    const statItems: IndexStat[] = [
        { label: 'Courses', value: stats.total, detail: 'Training assets in the platform library.', icon: BookOpen },
        { label: 'Published', value: stats.published, detail: 'Available for assignment.', icon: FileStack },
        { label: 'Draft', value: stats.draft, detail: 'Still under construction.', icon: PenSquare },
        { label: 'Archived', value: stats.archived, detail: 'Retained but inactive.', icon: FolderKanban },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Courses"
                    description="Build the core data protection and cyber awareness curriculum used across tenant workspaces."
                    stats={statItems}
                    actions={[{ label: 'Add New Course', href: route('courses.create'), icon: BookOpen }]}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Draft', value: 'draft' },
                                { label: 'Published', value: 'published' },
                                { label: 'Archived', value: 'archived' },
                            ],
                        },
                    ]}
                    paginated={courses}
                    tableTitle="Course Library"
                    tableDescription="Published courses become available for assignment and reporting."
                    exportable
                >
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <SortableTableHead label="Title" column="title" filters={filters} />
                            <SortableTableHead label="Duration" column="estimated_minutes" filters={filters} />
                            <TableHead>Modules</TableHead>
                            <SortableTableHead label="Status" column="status" filters={filters} />
                            <TableHead className="w-[70px] text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.data.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div className="font-medium">{course.title}</div>
                                        <div className="text-xs text-muted-foreground">{course.description ?? 'No summary'}</div>
                                    </TableCell>
                                    <TableCell>{course.estimated_minutes ?? 0} mins</TableCell>
                                    <TableCell>{course.modules_count ?? 0}</TableCell>
                                    <TableCell><StatusBadge value={course.status} /></TableCell>
                                    <TableCell className="text-right">
                                        <RowActionsMenu
                                            actions={[
                                                { label: 'View course', href: route('courses.show', course.id) },
                                                { label: 'Delete', destructive: true, onClick: () => router.delete(route('courses.destroy', course.id)) },
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
