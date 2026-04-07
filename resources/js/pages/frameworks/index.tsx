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
    BookMarked,
    Eye,
    Files,
    FolderKanban,
    MoreHorizontal,
    PenSquare,
    Plus,
    ShieldCheck,
    Trash2,
} from 'lucide-react';

interface Framework {
    id: number;
    name: string;
    version?: string | null;
    status: string;
    sections_count?: number;
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

export default function FrameworksIndex({
    frameworks,
    filters,
    stats,
}: {
    frameworks: Paginated<Framework>;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        {
            label: 'Frameworks',
            value: stats.total,
            detail: 'Reusable compliance frameworks.',
            icon: ShieldCheck,
        },
        {
            label: 'Published',
            value: stats.published,
            detail: 'Ready for tenant submissions.',
            icon: BookMarked,
        },
        {
            label: 'Draft',
            value: stats.draft,
            detail: 'Still being designed.',
            icon: PenSquare,
        },
        {
            label: 'Sections',
            value: stats.sections,
            detail: 'Total framework sections defined.',
            icon: Files,
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Compliance Frameworks"
                    description="Define sections and scored questions that companies will answer during compliance execution."
                    stats={statItems}
                    actions={[
                        {
                            label: 'Add New Framework',
                            href: route('frameworks.create', undefined, false),
                            icon: ShieldCheck,
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
                    paginated={frameworks}
                    tableTitle="Framework Library"
                    tableDescription="Use frameworks to structure submissions, scoring, and reporting."
                    exportable
                >
                    <div className="space-y-6">
                        <Card className="overflow-hidden border-0 shadow-none">
                            <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="max-w-2xl space-y-2">
                                        <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                            PrivacyCure Framework Hub
                                        </Badge>
                                        <h2 className="text-2xl font-semibold tracking-tight">
                                            Manage compliance frameworks
                                        </h2>
                                        <p className="text-sm text-white/80">
                                            Organize reusable framework versions and structure sections for submissions.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-white text-[#0F2E52] hover:bg-white/90"
                                        >
                                            <Link href={route('frameworks.create', undefined, false)}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Framework
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                                        >
                                            {frameworks.total ?? frameworks.data.length} Total Frameworks
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
                                            Framework Library
                                        </CardTitle>
                                        <CardDescription>
                                            A brand-led view of reusable compliance frameworks, statuses, and
                                            section coverage.
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                    >
                                        {frameworks.total ?? frameworks.data.length} records
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="px-0 pb-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/60">
                                            <SortableTableHead label="Name" column="name" filters={filters} />
                                            <SortableTableHead label="Version" column="version" filters={filters} />
                                            <TableHead>Sections</TableHead>
                                            <SortableTableHead label="Status" column="status" filters={filters} />
                                            <TableHead className="w-[190px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {frameworks.data.map((framework) => (
                                            <TableRow
                                                key={framework.id}
                                                className="border-border/60 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                                            <ShieldCheck className="h-4 w-4" />
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <Link
                                                                href={route('frameworks.show', framework.id, false)}
                                                                className="text-sm font-semibold text-[#0F2E52] hover:text-[#14417A] hover:underline dark:text-blue-200 dark:hover:text-blue-300"
                                                            >
                                                                {framework.name}
                                                            </Link>
                                                            <p className="text-xs text-muted-foreground">
                                                                Framework #{framework.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                                    >
                                                        {framework.version ?? 'N/A'}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                            <FolderKanban className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className="text-sm text-[#3A3A3C] dark:text-slate-200">
                                                                {framework.sections_count ?? 0}
                                                            </span>
                                                            <p className="text-xs text-muted-foreground">
                                                                Sections defined
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <StatusPill value={framework.status} />
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                                        >
                                                            <Link href={route('frameworks.show', framework.id, false)}>
                                                                <Eye className="mr-2 h-4 w-4" />
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
                                                                    <Link
                                                                        href={route(
                                                                            'frameworks.show',
                                                                            framework.id,
                                                                            false,
                                                                        )}
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View framework
                                                                    </Link>
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() =>
                                                                        router.delete(
                                                                            route(
                                                                                'frameworks.destroy',
                                                                                framework.id,
                                                                                false,
                                                                            ),
                                                                        )
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

                                        {frameworks.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="py-12 text-center text-sm text-muted-foreground"
                                                >
                                                    No frameworks found for the current filters.
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