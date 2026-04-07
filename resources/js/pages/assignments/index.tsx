

import { DataIndexPage } from '@/components/data-index-page';
import { SortableTableHead } from '@/components/sortable-table-head';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import moment from 'moment';
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
import { IndexStat, Paginated, TableFilters, User } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
    AlarmClock,
    BadgeCheck,
    CalendarDays,
    ClipboardList,
    MoreHorizontal,
    Plus,
    SquareKanban,
    UserRound,
} from 'lucide-react';

interface Assignment {
    id: number;
    due_date?: string | null;
    status: string;
    course?: { id: number; title: string } | null;
    assigned_to?: { id: number; name: string } | null;
    tenant?: { id: number; name: string } | null;
}

function StatusPill({ value }: { value: string }) {
    const styles: Record<string, string> = {
        assigned:
            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300',
        in_progress:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
        completed:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
        overdue:
            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
    };

    const labelMap: Record<string, string> = {
        assigned: 'Assigned',
        in_progress: 'In Progress',
        completed: 'Completed',
        overdue: 'Overdue',
    };

    return (
        <Badge
            variant="outline"
            className={`font-medium ${styles[value] ?? 'border-border bg-background text-foreground'}`}
        >
            {labelMap[value] ?? value}
        </Badge>
    );
}

function DueDateBadge({
    dueDate,
    status,
}: {
    dueDate?: string | null;
    status: string;
}) {
    if (!dueDate) {
        return (
            <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
                No due date
            </Badge>
        );
    }

    const isOverdue = moment(dueDate).isBefore(moment(), 'day') && status !== 'completed';
    const isToday = moment(dueDate).isSame(moment(), 'day');

    const badgeClass = isOverdue
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
        : isToday
          ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
          : 'border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300';

    return (
        <div className="flex flex-col gap-1">
            <Badge variant="outline" className={`w-fit font-medium ${badgeClass}`}>
                {moment(dueDate).format('DD MMM YYYY')}
            </Badge>
            <span className="text-xs text-muted-foreground">
                {moment(dueDate).fromNow()}
            </span>
        </div>
    );
}

export default function AssignmentsIndex({
    assignments,
    courses,
    users,
    tenants = [],
    isSuperAdmin = false,
    filters,
    stats,
}: {
    assignments: Paginated<Assignment>;
    courses: Array<{ id: number; title: string }>;
    users: User[];
    tenants?: Array<{ id: number; name: string }>;
    isSuperAdmin?: boolean;
    filters: TableFilters;
    stats: Record<string, number>;
}) {
    const statItems: IndexStat[] = [
        {
            label: 'Assignments',
            value: stats.total,
            detail: 'Training allocations in the workspace.',
            icon: SquareKanban,
        },
        {
            label: 'In progress',
            value: stats.inProgress,
            detail: 'Employees currently working through content.',
            icon: ClipboardList,
        },
        {
            label: 'Completed',
            value: stats.completed,
            detail: 'Assignments already completed.',
            icon: BadgeCheck,
        },
        {
            label: 'Overdue',
            value: stats.overdue,
            detail: 'Assignments past their due date.',
            icon: AlarmClock,
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Assignments"
                    description="Assign courses to employees and monitor completion against due dates."
                    stats={statItems}
                    actions={[{ label: 'Assign Training', href: route('assignments.create'), icon: SquareKanban }]}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Assigned', value: 'assigned' },
                                { label: 'In Progress', value: 'in_progress' },
                                { label: 'Completed', value: 'completed' },
                                { label: 'Overdue', value: 'overdue' },
                            ],
                        },
                        {
                            key: 'due_state',
                            label: 'Due State',
                            options: [
                                { label: 'Upcoming', value: 'upcoming' },
                                { label: 'Overdue', value: 'overdue' },
                            ],
                        },
                        {
                            key: 'course_id',
                            label: 'Course',
                            options: courses.map((c) => ({ label: c.title, value: String(c.id) })),
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
                    paginated={assignments}
                    tableTitle="Assignment Tracker"
                    tableDescription="Use this view to drive overdue follow-up and training completion campaigns."
                    exportable
                >
                    <div className="space-y-6">
                        <Card className="overflow-hidden border-0 shadow-none">
                            <CardContent className="bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="max-w-2xl space-y-2">
                                        <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                            PrivacyCure Assignment Hub
                                        </Badge>
                                        <h2 className="text-2xl font-semibold tracking-tight">
                                            Manage employee assignments with clear progress and due dates
                                        </h2>
                                        <p className="text-sm text-white/80">
                                            Track course allocation, monitor overdue employees, and keep training
                                            completion visible with stronger brand styling.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-white text-[#0F2E52] hover:bg-white/90"
                                        >
                                            <Link href={route('assignments.create')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Assign Training
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                                        >
                                            {assignments.total ?? assignments.data.length} Total Assignments
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
                                            Assignment Tracker
                                        </CardTitle>
                                        <CardDescription>
                                            A brand-led view of employee course allocation, completion, and deadlines.
                                        </CardDescription>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="w-fit border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                    >
                                        {assignments.total ?? assignments.data.length} records
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="px-0 pb-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/60">
                                            <TableHead>Employee</TableHead>
                                            {isSuperAdmin && <TableHead>Tenant</TableHead>}
                                            <TableHead>Course</TableHead>
                                            <SortableTableHead label="Due Date" column="due_date" filters={filters} />
                                            <SortableTableHead label="Status" column="status" filters={filters} />
                                            <TableHead className="w-[190px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {assignments.data.map((assignment) => (
                                            <TableRow
                                                key={assignment.id}
                                                className="border-border/60 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14417A]/10 text-[#14417A] dark:bg-blue-950/40 dark:text-blue-300">
                                                            <UserRound className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-[#0F2E52] dark:text-blue-200">
                                                                {assignment.assigned_to?.name ?? 'Unassigned'}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Assignment #{assignment.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {isSuperAdmin && (
                                                    <TableCell className="py-4">
                                                        <span className="text-sm font-medium text-[#0F2E52] dark:text-blue-200">
                                                            {assignment.tenant?.name ?? 'Platform'}
                                                        </span>
                                                    </TableCell>
                                                )}

                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                            <ClipboardList className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Link
                                                                href={route('assignments.show', assignment.id)}
                                                                className="font-medium text-[#0F2E52] hover:text-[#14417A] hover:underline dark:text-blue-200 dark:hover:text-blue-300"
                                                            >
                                                                {assignment.course?.title ?? 'No course'}
                                                            </Link>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-[#14417A]/15 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                                            >
                                                                Training Assignment
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-2">
                                                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                            <CalendarDays className="h-4 w-4" />
                                                        </div>
                                                        <DueDateBadge
                                                            dueDate={assignment.due_date}
                                                            status={assignment.status}
                                                        />
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <StatusPill value={assignment.status} />
                                                </TableCell>

                                                <TableCell className="py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                                        >
                                                            <Link href={route('assignments.show', assignment.id)}>
                                                                Open
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
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.get(route('assignments.show', assignment.id))
                                                                    }
                                                                >
                                                                    Open course
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() =>
                                                                        router.delete(route('assignments.destroy', assignment.id))
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

                                        {assignments.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={isSuperAdmin ? 6 : 5}
                                                    className="py-12 text-center text-sm text-muted-foreground"
                                                >
                                                    No assignments found for the current filters.
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