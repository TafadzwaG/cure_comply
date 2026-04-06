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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { IndexStat, Paginated, TableFilters } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
    BookOpen,
    FileStack,
    FolderKanban,
    MoreHorizontal,
    PenSquare,
    Plus,
} from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    estimated_minutes?: number | null;
    modules_count?: number;
    tests_count?: number;
}

function StatusPill({ value }: { value: string }) {
    const styles: Record<string, string> = {
        published:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
        draft:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
        archived:
            'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
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

export default function CoursesIndex({
    courses,
    filters,
    stats,
}: {
    courses: Paginated<Course>;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        {
            label: 'Courses',
            value: stats.total,
            detail: 'Training assets in the platform library.',
            icon: BookOpen,
        },
        {
            label: 'Published',
            value: stats.published,
            detail: 'Available for assignment.',
            icon: FileStack,
        },
        {
            label: 'Draft',
            value: stats.draft,
            detail: 'Still under construction.',
            icon: PenSquare,
        },
        {
            label: 'Archived',
            value: stats.archived,
            detail: 'Retained but inactive.',
            icon: FolderKanban,
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Courses"
                    description="Build the core data protection and cyber awareness curriculum used across tenant workspaces."
                    stats={statItems}
                    actions={[
                        {
                            label: 'Add New Course',
                            href: route('courses.create'),
                            icon: BookOpen,
                        },
                    ]}
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
                    <div className="space-y-6">
                        <Card className="overflow-hidden border-0 shadow-none">
                            <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="max-w-2xl space-y-2">
                                        <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                            PrivacyCure Course Hub
                                        </Badge>
                                        <h2 className="text-2xl font-semibold tracking-tight">
                                            Manage training courses with stronger brand styling and clearer structure
                                        </h2>
                                        <p className="text-sm text-white/80">
                                            Organize the learning library, track course readiness, and surface
                                            duration and module coverage in a cleaner branded interface.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-white text-[#0F2E52] hover:bg-white/90"
                                        >
                                            <Link href={route('courses.create')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Course
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                                        >
                                            {courses.total ?? courses.data.length} Total Courses
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
                                            Course Library
                                        </CardTitle>
                                        <CardDescription>
                                            A brand-led view of available courses, duration, modules, and publishing
                                            status.
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                    >
                                        {courses.total ?? courses.data.length} records
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="px-0 pb-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/60">
                                            <SortableTableHead label="Title" column="title" filters={filters} />
                                            <SortableTableHead
                                                label="Duration"
                                                column="estimated_minutes"
                                                filters={filters}
                                            />
                                            <TableHead>Modules</TableHead>
                                            <SortableTableHead label="Status" column="status" filters={filters} />
                                            <TableHead className="w-[190px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {courses.data.map((course) => (
                                            <TableRow
                                                key={course.id}
                                                className="border-border/60 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                                            <BookOpen className="h-4 w-4" />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <Link
                                                                href={route('courses.show', course.id)}
                                                                className="font-medium text-[#0F2E52] hover:text-[#14417A] hover:underline dark:text-blue-200 dark:hover:text-blue-300"
                                                            >
                                                                {course.title}
                                                            </Link>
                                                            <p className="text-xs text-muted-foreground">
                                                                {course.description ?? 'No summary'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                                    >
                                                        {course.estimated_minutes ?? 0} mins
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                            <FileStack className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="font-medium text-[#3A3A3C] dark:text-slate-200">
                                                                {course.modules_count ?? 0}
                                                            </span>
                                                            <p className="text-xs text-muted-foreground">
                                                                Modules
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <StatusPill value={course.status} />
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                                        >
                                                            <Link href={route('courses.show', course.id)}>
                                                                View
                                                            </Link>
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
                                                                    <Link href={route('courses.show', course.id)}>
                                                                        View course
                                                                    </Link>
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() =>
                                                                        router.delete(route('courses.destroy', course.id))
                                                                    }
                                                                >
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {courses.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="py-12 text-center text-sm text-muted-foreground"
                                                >
                                                    No courses found for the current filters.
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