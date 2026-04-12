import moment from 'moment';

import { DataIndexPage } from '@/components/data-index-page';
import { EmptyState } from '@/components/empty-state';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformLayout from '@/layouts/platform-layout';
import {
    IndexStat,
    MyPolicyAssignment,
    Paginated,
    PolicyAssignmentSummary,
    PolicySummary,
    TableFilters,
} from '@/types';
import { router, useForm } from '@inertiajs/react';
import { CheckCheck, Clock3, Download, FileCheck2, Files, Send, ShieldCheck, UserCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type PolicyTab = 'published' | 'assignments' | 'my';

interface Option {
    id: number;
    name: string;
    tenant_id?: number | null;
    tenant_name?: string | null;
    email?: string | null;
}

interface Props {
    tab: PolicyTab;
    filters: TableFilters & {
        tab?: PolicyTab;
        status?: string;
        category?: string;
    };
    stats: {
        published: number;
        pending: number;
        overdue: number;
        acknowledged: number;
    };
    categoryOptions: Array<{ label: string; value: string }>;
    statusOptions: Array<{ label: string; value: string }>;
    users: Option[];
    departments: Option[];
    canManage: boolean;
    canAssign: boolean;
    canAcknowledge: boolean;
    isSuperAdmin: boolean;
    policies?: Paginated<PolicySummary>;
    assignments?: Paginated<PolicyAssignmentSummary>;
    myPolicies?: Paginated<MyPolicyAssignment>;
}

interface AssignmentFormData {
    library_file_id: string;
    assigned_to_user_ids: string[];
    department_ids: string[];
    due_date: string;
}

interface AcknowledgeFormData {
    confirmed: boolean;
}

export default function PoliciesIndex({
    tab,
    filters,
    stats,
    categoryOptions,
    statusOptions,
    users,
    departments,
    canManage,
    canAssign,
    policies,
    assignments,
    myPolicies,
}: Props) {
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<PolicySummary | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<MyPolicyAssignment | null>(null);

    const assignmentForm = useForm<AssignmentFormData>({
        library_file_id: '',
        assigned_to_user_ids: [],
        department_ids: [],
        due_date: moment().add(7, 'days').format('YYYY-MM-DD'),
    });

    const acknowledgeForm = useForm<AcknowledgeFormData>({
        confirmed: false,
    });

    useEffect(() => {
        if (!assignmentDialogOpen) {
            assignmentForm.reset();
            assignmentForm.clearErrors();
            setSelectedPolicy(null);
        }
    }, [assignmentDialogOpen]);

    useEffect(() => {
        if (!acknowledgeDialogOpen) {
            acknowledgeForm.reset();
            acknowledgeForm.clearErrors();
            setSelectedAssignment(null);
        }
    }, [acknowledgeDialogOpen]);

    const currentData = useMemo(() => {
        if (tab === 'published') {
            return policies;
        }

        if (tab === 'assignments') {
            return assignments;
        }

        return myPolicies;
    }, [tab, policies, assignments, myPolicies]);

    const statItems: IndexStat[] = canManage || canAssign
        ? [
              { label: 'Published policies', value: stats.published, detail: 'Current published policy versions in scope.', icon: Files },
              { label: 'Open acknowledgments', value: stats.pending, detail: 'Assignments still waiting for acknowledgment.', icon: Clock3 },
              { label: 'Overdue', value: stats.overdue, detail: 'Assignments past the due date.', icon: ShieldCheck },
              { label: 'Acknowledged', value: stats.acknowledged, detail: 'Completed acknowledgments on the current audience.', icon: CheckCheck },
          ]
        : [
              { label: 'Assigned policies', value: stats.pending + stats.overdue + stats.acknowledged, detail: 'Policies assigned to you.', icon: FileCheck2 },
              { label: 'Open', value: stats.pending, detail: 'Policies that still need action.', icon: Clock3 },
              { label: 'Overdue', value: stats.overdue, detail: 'Acknowledgments that are late.', icon: ShieldCheck },
              { label: 'Acknowledged', value: stats.acknowledged, detail: 'Policies you have already accepted.', icon: UserCheck },
          ];

    const filterConfigs = tab === 'published'
        ? [{ key: 'category', label: 'Category', options: categoryOptions }]
        : [{ key: 'status', label: 'Status', options: statusOptions }];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <DataIndexPage
                    title="Policies"
                    description="Track published policy versions, assign acknowledgments, and monitor who has read and accepted them."
                    stats={statItems}
                    actions={
                        canManage
                            ? [{ label: 'Open Files', href: route('files.index'), icon: Files, variant: 'outline' }]
                            : []
                    }
                    filters={filters}
                    filterConfigs={filterConfigs}
                    paginated={currentData ?? emptyPage()}
                    tableTitle={tabTitle(tab)}
                    tableDescription={tabDescription(tab, canManage || canAssign)}
                    exportable
                    tableToolbarAddon={
                        <Tabs value={tab} onValueChange={(value) => switchTab(value as PolicyTab, filters)}>
                            <TabsList className="w-full justify-start">
                                {canManage || canAssign ? <TabsTrigger value="published">Published policies</TabsTrigger> : null}
                                {canManage || canAssign ? <TabsTrigger value="assignments">Assignments</TabsTrigger> : null}
                                <TabsTrigger value="my">My policies</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    }
                >
                    {tab === 'published' ? renderPublishedTable(policies ?? emptyPage(), openAssignDialog, canAssign, filters) : null}
                    {tab === 'assignments' ? renderAssignmentsTable(assignments ?? emptyPage(), filters) : null}
                    {tab === 'my' ? renderMyPoliciesTable(myPolicies ?? emptyPage(), openAcknowledgeDialog, filters) : null}
                </DataIndexPage>

                <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Assign policy</DialogTitle>
                            <DialogDescription>
                                {selectedPolicy ? `Create acknowledgment work for ${selectedPolicy.title}.` : 'Select users or departments and set a due date.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5">
                            <Field label="Due date" error={assignmentForm.errors.due_date}>
                                <Input
                                    type="date"
                                    value={assignmentForm.data.due_date}
                                    onChange={(event) => assignmentForm.setData('due_date', event.target.value)}
                                />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <MultiSelectField
                                    label="Users"
                                    description="Direct assignees"
                                    items={users}
                                    selected={assignmentForm.data.assigned_to_user_ids}
                                    onToggle={(value) => toggleValue(value, assignmentForm.data.assigned_to_user_ids, (next) => assignmentForm.setData('assigned_to_user_ids', next))}
                                />
                                <MultiSelectField
                                    label="Departments"
                                    description="Current members will expand into individual assignments"
                                    items={departments}
                                    selected={assignmentForm.data.department_ids}
                                    onToggle={(value) => toggleValue(value, assignmentForm.data.department_ids, (next) => assignmentForm.setData('department_ids', next))}
                                />
                            </div>

                            {assignmentForm.errors.assigned_to_user_ids ? (
                                <p className="text-sm text-destructive">{assignmentForm.errors.assigned_to_user_ids}</p>
                            ) : null}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAssignmentDialogOpen(false)} disabled={assignmentForm.processing}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    assignmentForm.post(route('policy-assignments.store'), {
                                        preserveScroll: true,
                                        onSuccess: () => setAssignmentDialogOpen(false),
                                        onError: (errors) => toast.error(Object.values(errors).join('\n') || 'Could not save policy assignments.'),
                                    });
                                }}
                                disabled={assignmentForm.processing}
                            >
                                <Send className="size-4" />
                                Assign policy
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={acknowledgeDialogOpen} onOpenChange={setAcknowledgeDialogOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Acknowledge policy</DialogTitle>
                            <DialogDescription>
                                {selectedAssignment ? `Confirm that you have read and understood ${selectedAssignment.policy_title}.` : 'Confirm acknowledgment.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <label className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-3">
                                <Checkbox
                                    checked={acknowledgeForm.data.confirmed}
                                    onCheckedChange={(checked) => acknowledgeForm.setData('confirmed', checked === true)}
                                    className="mt-0.5"
                                />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">I have read and understood this policy.</p>
                                    <p className="text-sm text-muted-foreground">This acknowledgment is recorded against the currently assigned version.</p>
                                </div>
                            </label>
                            {acknowledgeForm.errors.confirmed ? <p className="text-sm text-destructive">{acknowledgeForm.errors.confirmed}</p> : null}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAcknowledgeDialogOpen(false)} disabled={acknowledgeForm.processing}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    if (!selectedAssignment) {
                                        return;
                                    }

                                    acknowledgeForm.post(selectedAssignment.acknowledge_url, {
                                        preserveScroll: true,
                                        onSuccess: () => setAcknowledgeDialogOpen(false),
                                        onError: (errors) => toast.error(Object.values(errors).join('\n') || 'Could not acknowledge policy.'),
                                    });
                                }}
                                disabled={acknowledgeForm.processing}
                            >
                                <CheckCheck className="size-4" />
                                Confirm acknowledgment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PlatformLayout>
    );

    function openAssignDialog(policy: PolicySummary) {
        setSelectedPolicy(policy);
        assignmentForm.setData({
            library_file_id: String(policy.id),
            assigned_to_user_ids: [],
            department_ids: [],
            due_date: moment().add(7, 'days').format('YYYY-MM-DD'),
        });
        setAssignmentDialogOpen(true);
    }

    function openAcknowledgeDialog(assignment: MyPolicyAssignment) {
        setSelectedAssignment(assignment);
        acknowledgeForm.reset();
        setAcknowledgeDialogOpen(true);
    }
}

function renderPublishedTable(
    policies: Paginated<PolicySummary>,
    onAssign: (policy: PolicySummary) => void,
    canAssign: boolean,
    filters: TableFilters,
) {
    if (!policies.data.length) {
        return (
            <EmptyState
                icon={Files}
                title="No published policies"
                description="Publish eligible files from the file library, then assign those policy versions to users or departments."
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableTableHead label="Policy" column="title" filters={filters} />
                        <TableHead>Scope</TableHead>
                        <SortableTableHead label="Version" column="version" filters={filters} />
                        <TableHead>Coverage</TableHead>
                        <SortableTableHead label="Published" column="created_at" filters={filters} />
                        <TableHead className="w-[140px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {policies.data.map((policy) => (
                        <TableRow key={policy.id}>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{policy.title}</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {policy.category ? <Badge variant="outline">{policy.category}</Badge> : null}
                                        <StatusBadge value={policy.policy_state} />
                                    </div>
                                    {policy.description ? <p className="max-w-xl text-sm text-muted-foreground">{policy.description}</p> : null}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{policy.scope_label}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">v{policy.current_version_number ?? '?'}</TableCell>
                            <TableCell>
                                <div className="grid gap-1 text-sm text-muted-foreground">
                                    <span>{policy.assignments_count} assigned</span>
                                    <span>{policy.pending_count} open</span>
                                    <span>{policy.overdue_count} overdue</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <span>{policy.published_at ? moment(policy.published_at).format('DD MMM YYYY') : 'Recently'}</span>
                                    <span className="text-xs text-muted-foreground">{policy.published_by?.name ?? 'Unknown publisher'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {canAssign && policy.abilities.canAssign ? (
                                    <Button type="button" size="sm" onClick={() => onAssign(policy)}>
                                        <UsersRound className="size-4" />
                                        Assign
                                    </Button>
                                ) : null}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function renderAssignmentsTable(assignments: Paginated<PolicyAssignmentSummary>, filters: TableFilters) {
    if (!assignments.data.length) {
        return (
            <EmptyState
                icon={UsersRound}
                title="No policy assignments yet"
                description="Assignments will appear here once published policies are targeted to users or departments."
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Policy</TableHead>
                        <TableHead>Assignee</TableHead>
                        <SortableTableHead label="Due date" column="due_date" filters={filters} />
                        <SortableTableHead label="Status" column="status" filters={filters} />
                        <TableHead>Source</TableHead>
                        <TableHead>Activity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignments.data.map((assignment) => (
                        <TableRow key={assignment.id}>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{assignment.policy_title}</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">{assignment.policy_scope_label}</Badge>
                                        <Badge variant="outline">v{assignment.version_number ?? '?'}</Badge>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{assignment.assigned_to?.name ?? 'Unknown user'}</p>
                                    <p className="text-sm text-muted-foreground">{assignment.assigned_to?.email ?? 'No email'}</p>
                                </div>
                            </TableCell>
                            <TableCell>{assignment.due_date ? moment(assignment.due_date).format('DD MMM YYYY') : 'No due date'}</TableCell>
                            <TableCell>
                                <StatusBadge value={assignment.status} />
                            </TableCell>
                            <TableCell>
                                {assignment.source_department?.name ?? sentenceCase(assignment.source_type)}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <div>{assignment.view_count} opens</div>
                                    <div>{assignment.last_viewed_at ? `Last opened ${moment(assignment.last_viewed_at).fromNow()}` : 'Not opened yet'}</div>
                                    {assignment.acknowledged_at ? <div>Acknowledged {moment(assignment.acknowledged_at).fromNow()}</div> : null}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function renderMyPoliciesTable(
    assignments: Paginated<MyPolicyAssignment>,
    onAcknowledge: (assignment: MyPolicyAssignment) => void,
    filters: TableFilters,
) {
    if (!assignments.data.length) {
        return (
            <EmptyState
                icon={FileCheck2}
                title="No assigned policies"
                description="Policy acknowledgments assigned to you will appear here."
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Policy</TableHead>
                        <SortableTableHead label="Due date" column="due_date" filters={filters} />
                        <SortableTableHead label="Status" column="status" filters={filters} />
                        <TableHead>Progress</TableHead>
                        <TableHead className="w-[220px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignments.data.map((assignment) => (
                        <TableRow key={assignment.id}>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{assignment.policy_title}</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">{assignment.policy_scope_label}</Badge>
                                        <Badge variant="outline">v{assignment.version_number ?? '?'}</Badge>
                                    </div>
                                    {assignment.assigned_by?.name ? <p className="text-sm text-muted-foreground">Assigned by {assignment.assigned_by.name}</p> : null}
                                </div>
                            </TableCell>
                            <TableCell>{assignment.due_date ? moment(assignment.due_date).format('DD MMM YYYY') : 'No due date'}</TableCell>
                            <TableCell>
                                <StatusBadge value={assignment.status} />
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <div>{assignment.view_count} tracked open{assignment.view_count === 1 ? '' : 's'}</div>
                                    <div>{assignment.first_viewed_at ? `First opened ${moment(assignment.first_viewed_at).fromNow()}` : 'Not opened yet'}</div>
                                    {assignment.acknowledged_at ? <div>Acknowledged {moment(assignment.acknowledged_at).fromNow()}</div> : null}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button asChild size="sm" variant="outline">
                                        <a href={assignment.open_url}>
                                            <Download className="size-4" />
                                            Open policy
                                        </a>
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => onAcknowledge(assignment)}
                                        disabled={!assignment.abilities.canAcknowledge || !!assignment.acknowledged_at || assignment.view_count < 1}
                                    >
                                        <CheckCheck className="size-4" />
                                        Acknowledge
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function MultiSelectField({
    label,
    description,
    items,
    selected,
    onToggle,
}: {
    label: string;
    description: string;
    items: Option[];
    selected: string[];
    onToggle: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <div className="space-y-1">
                <Label>{label}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border/70 p-3">
                {items.length ? (
                    items.map((item) => (
                        <label key={item.id} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/40">
                            <Checkbox checked={selected.includes(String(item.id))} onCheckedChange={() => onToggle(String(item.id))} className="mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {[item.email, item.tenant_name].filter(Boolean).join(' · ') || 'No extra details'}
                                </p>
                            </div>
                        </label>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No options available.</p>
                )}
            </div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

function toggleValue(value: string, selected: string[], onChange: (next: string[]) => void) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
}

function switchTab(tab: PolicyTab, filters: Props['filters']) {
    router.get(
        route('policies.index'),
        sanitizeFilters({
            ...filters,
            tab,
            page: undefined,
            search: undefined,
            status: undefined,
            category: undefined,
            export: undefined,
        }),
        { preserveScroll: true, preserveState: true, replace: true },
    );
}

function tabTitle(tab: PolicyTab) {
    return tab === 'published' ? 'Published policies' : tab === 'assignments' ? 'Assignment tracking' : 'My policy acknowledgments';
}

function tabDescription(tab: PolicyTab, manager: boolean) {
    if (tab === 'published') {
        return 'Published policy versions that can now be assigned for acknowledgment.';
    }

    if (tab === 'assignments') {
        return 'Per-user acknowledgment state for the current policy audience.';
    }

    return manager
        ? 'Your own policy assignments and acknowledgment state.'
        : 'Open, overdue, and completed policy acknowledgments assigned to you.';
}

function sentenceCase(value?: string | null) {
    return (value ?? 'unknown').replaceAll('_', ' ');
}

function sanitizeFilters(filters: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
}

function emptyPage<T>(): Paginated<T> {
    return {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 25,
        total: 0,
    };
}
