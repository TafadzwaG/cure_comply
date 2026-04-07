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
    ClipboardCheck,
    Eye,
    FolderKanban,
    GraduationCap,
    MoreHorizontal,
    PenSquare,
    PlayCircle,
    Plus,
    Trash2,
} from 'lucide-react';

interface TestRecord {
    id: number;
    title: string;
    status: string;
    pass_mark: number;
    questions_count?: number;
    course?: { id: number; title: string } | null;
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

export default function TestsIndex({
    tests,
    courses,
    filters,
    stats,
}: {
    tests: Paginated<TestRecord>;
    courses: Array<{ id: number; title: string }>;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        { label: 'Tests', value: stats.total, detail: 'Assessments in the question bank.', icon: ClipboardCheck },
        { label: 'Published', value: stats.published, detail: 'Ready for employee attempts.', icon: GraduationCap },
        { label: 'Draft', value: stats.draft, detail: 'Still being prepared.', icon: PenSquare },
        { label: 'Archived', value: stats.archived, detail: 'Inactive assessments retained.', icon: FolderKanban },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Tests"
                    description="Create assessments linked to training content and monitor the publishing pipeline."
                    stats={statItems}
                    actions={[{ label: 'Add New Test', href: route('tests.create'), icon: ClipboardCheck }]}
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
                        {
                            key: 'course_id',
                            label: 'Course',
                            options: courses.map((course) => ({
                                label: course.title,
                                value: String(course.id),
                            })),
                        },
                    ]}
                    paginated={tests}
                    tableTitle="Assessment Bank"
                    tableDescription="Each published test can be taken by assigned employees."
                    exportable
                >
                    <div className="space-y-6">
                        <Card className="overflow-hidden border-0 shadow-none">
                            <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="max-w-2xl space-y-2">
                                        <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                            PrivacyCure Assessment Hub
                                        </Badge>
                                        <h2 className="text-2xl font-semibold tracking-tight">
                                            Manage assessments
                                        </h2>
                                        <p className="text-sm text-white/80">
                                            Create, publish, and monitor course-linked tests from one place.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-white text-[#0F2E52] hover:bg-white/90"
                                        >
                                            <Link href={route('tests.create')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Test
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                                        >
                                            {tests.total ?? tests.data.length} Total Assessments
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
                                            Assessment Bank
                                        </CardTitle>
                                        <CardDescription>
                                            A more colorful, brand-led view of your full test inventory.
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                    >
                                        {tests.total ?? tests.data.length} records
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="px-0 pb-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/60">
                                            <SortableTableHead label="Test" column="title" filters={filters} />
                                            <TableHead>Course</TableHead>
                                            <TableHead>Questions</TableHead>
                                            <SortableTableHead label="Status" column="status" filters={filters} />
                                            <TableHead>Pass Mark</TableHead>
                                            <TableHead className="w-[190px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {tests.data.map((test) => (
                                            <TableRow
                                                key={test.id}
                                                className="border-border/60 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                                            <ClipboardCheck className="h-4 w-4" />
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <Link
                                                                href={route('tests.show', test.id)}
                                                                className="text-sm font-semibold text-[#0F2E52] hover:text-[#14417A] hover:underline dark:text-blue-200 dark:hover:text-blue-300"
                                                            >
                                                                {test.title}
                                                            </Link>
                                                            <p className="text-xs text-muted-foreground">
                                                                Assessment #{test.id} · {test.questions_count ?? 0} questions
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                                    >
                                                        {test.course?.title ?? 'Standalone'}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <span className="text-sm text-[#3A3A3C] dark:text-slate-200">
                                                        {test.questions_count ?? 0}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <StatusPill value={test.status} />
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <Badge className="bg-[#14417A] text-white hover:bg-[#14417A]">
                                                        {test.pass_mark}%
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                                        >
                                                            <Link href={route('tests.show', test.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </Button>

                                                        {test.status === 'published' && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                                onClick={() =>
                                                                    router.get(route('tests.attempts.create', test.id))
                                                                }
                                                            >
                                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                                Take
                                                            </Button>
                                                        )}

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
                                                                    <Link href={route('tests.show', test.id)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View test
                                                                    </Link>
                                                                </DropdownMenuItem>

                                                                {test.status === 'published' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            router.get(
                                                                                route('tests.attempts.create', test.id),
                                                                            )
                                                                        }
                                                                    >
                                                                        <PlayCircle className="mr-2 h-4 w-4" />
                                                                        Take test
                                                                    </DropdownMenuItem>
                                                                )}

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() =>
                                                                        router.delete(route('tests.destroy', test.id))
                                                                    }
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {tests.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="py-12 text-center text-sm text-muted-foreground"
                                                >
                                                    No tests found for the current filters.
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