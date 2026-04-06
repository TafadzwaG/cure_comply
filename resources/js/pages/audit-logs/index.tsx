import { DataTablePagination } from '@/components/data-table-pagination';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import { PageHeader } from '@/components/page-header';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatLongDateTime } from '@/lib/date';
import PlatformLayout from '@/layouts/platform-layout';
import { Paginated, TableFilters, Tenant } from '@/types';
import { Activity, FileSearch, ShieldCheck, UserRoundCog, WalletCards } from 'lucide-react';

interface AuditLogRow {
    id: number;
    action: string;
    entity_type: string;
    created_at: string;
    user?: { name?: string | null; email?: string | null } | null;
    tenant?: Tenant | null;
}

export default function AuditLogsIndex({
    logs,
    filters,
    stats,
    actions,
    entityTypes,
}: {
    logs: Paginated<AuditLogRow>;
    filters: TableFilters;
    stats: Record<string, number>;
    actions: string[];
    entityTypes: string[];
}) {
    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="Audit Logs" description="Monochrome traceability for support operations, review events, and governance activity." />

                <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardContent className="space-y-5 p-6">
                            <div className="space-y-3">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                    Governance timeline
                                </Badge>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-semibold tracking-tight">Track every high-impact platform event from a single operational timeline</h2>
                                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Support interventions, impersonation sessions, review decisions, and system-level actions are surfaced here for fast
                                        traceability and follow-up.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <MetricCard label="Audit events" value={stats.total} icon={Activity} detail="Every recorded event in the current audit scope." />
                                <MetricCard label="Today" value={stats.today} icon={WalletCards} detail="Events generated since the current day started." />
                                <MetricCard
                                    label="Impersonation"
                                    value={stats.impersonation}
                                    icon={UserRoundCog}
                                    detail="Support sessions started or stopped through impersonation."
                                />
                                <MetricCard label="Reviews" value={stats.reviews} icon={ShieldCheck} detail="Review-driven actions captured in the audit ledger." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 bg-muted/20 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Signal summary</CardTitle>
                            <CardDescription>Read the current audit distribution before drilling into raw rows.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InsightRow
                                title="System-generated"
                                value={stats.system}
                                description="Events without a direct acting user, usually emitted by background or automated flows."
                            />
                            <Separator />
                            <InsightRow title="Action categories" value={actions.length} description="Distinct action labels currently present in the audit stream." />
                            <Separator />
                            <InsightRow
                                title="Entity footprint"
                                value={entityTypes.length}
                                description="Number of model or entity families represented in this slice of activity."
                            />
                        </CardContent>
                    </Card>
                </section>

                <Card className="border-border/70 shadow-none">
                    <CardHeader>
                        <CardTitle>Activity timeline</CardTitle>
                        <CardDescription>Search by actor, entity, or action, then filter the stream down to the exact operational signal you need.</CardDescription>
                    </CardHeader>
                    <DataTableToolbar
                        filters={filters}
                        filterConfigs={[
                            { key: 'action', label: 'Action', options: actions.map((action) => ({ label: action, value: action })) },
                            { key: 'entity_type', label: 'Entity', options: entityTypes.map((entity) => ({ label: entity, value: entity })) },
                        ]}
                    />
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableTableHead label="Action" column="action" filters={filters} />
                                    <SortableTableHead label="Entity" column="entity_type" filters={filters} />
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <SortableTableHead label="Recorded" column="created_at" filters={filters} />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-lg border border-border/70 bg-muted/35 p-2">
                                                    <Activity className="size-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-medium">{log.action}</div>
                                                    <div className="text-xs text-muted-foreground">Audit event #{log.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge value={log.entity_type} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{log.user?.name ?? 'System'}</div>
                                            <div className="text-xs text-muted-foreground">{log.user?.email ?? 'Automated event'}</div>
                                        </TableCell>
                                        <TableCell>{log.tenant?.name ?? 'Platform'}</TableCell>
                                        <TableCell>{formatLongDateTime(log.created_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <DataTablePagination paginated={logs} filters={filters} />
                </Card>
            </div>
        </PlatformLayout>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    detail,
}: {
    label: string;
    value: string | number;
    icon: typeof Activity;
    detail: string;
}) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
                    <p className="text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background p-2">
                    <Icon className="size-4" />
                </div>
            </div>
        </div>
    );
}

function InsightRow({
    title,
    value,
    description,
}: {
    title: string;
    value: string | number;
    description: string;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{title}</p>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                    {value}
                </Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
    );
}
