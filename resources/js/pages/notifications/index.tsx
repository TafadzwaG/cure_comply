import { DataTablePagination } from '@/components/data-table-pagination';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import { PageHeader } from '@/components/page-header';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { Paginated, TableFilters, Tenant } from '@/types';
import { BellRing, CircleCheck, MailOpen, MessageSquareDot, TimerReset } from 'lucide-react';

interface NotificationRow {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    tenant?: Tenant | null;
}

export default function NotificationsIndex({
    notifications,
    filters,
    stats,
    types,
}: {
    notifications: Paginated<NotificationRow>;
    filters: TableFilters;
    stats: Record<string, number>;
    types: string[];
}) {
    const unreadRatio = stats.total === 0 ? 0 : Math.round((stats.unread / stats.total) * 100);

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title="Notifications" description="A monochrome inbox for platform alerts, tenant activity, and workflow updates." />

                <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardContent className="space-y-5 p-6">
                            <div className="space-y-3">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                                    Personal inbox
                                </Badge>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-semibold tracking-tight">Review platform messages without leaving your workflow</h2>
                                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                        This workspace keeps unread items, recent system alerts, and tenant-linked messages in one neutral operational feed.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <MetricCard label="Notifications" value={stats.total} icon={BellRing} detail="Everything currently visible in your inbox." />
                                <MetricCard label="Unread" value={stats.unread} icon={MailOpen} detail="Messages still waiting for acknowledgement." />
                                <MetricCard label="Read" value={stats.read} icon={CircleCheck} detail="Messages already opened or resolved." />
                                <MetricCard label="Recent" value={stats.recent} icon={TimerReset} detail="Items created in the last seven days." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 bg-muted/20 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Inbox posture</CardTitle>
                            <CardDescription>Quick context for how much of the feed still needs attention.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InsightRow title="Unread intensity" value={`${unreadRatio}%`} description="Share of visible notifications that still need to be opened." />
                            <Separator />
                            <InsightRow title="Message types" value={types.length} description="Distinct notification categories currently represented." />
                            <Separator />
                            <InsightRow
                                title="Action pattern"
                                value="Mark as read"
                                description="Unread items can be acknowledged directly from the action menu in the table."
                            />
                        </CardContent>
                    </Card>
                </section>

                <Card className="border-border/70 shadow-none">
                    <CardHeader>
                        <CardTitle>Notification feed</CardTitle>
                        <CardDescription>Filter by read status and notification type, then review the full message payload below.</CardDescription>
                    </CardHeader>
                    <DataTableToolbar
                        filters={filters}
                        filterConfigs={[
                            {
                                key: 'status',
                                label: 'Status',
                                options: [
                                    { label: 'Unread', value: 'unread' },
                                    { label: 'Read', value: 'read' },
                                ],
                            },
                            {
                                key: 'type',
                                label: 'Type',
                                options: types.map((type) => ({ label: type, value: type })),
                            },
                        ]}
                    />
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableTableHead label="Notification" column="title" filters={filters} />
                                    <SortableTableHead label="Type" column="type" filters={filters} />
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Status</TableHead>
                                    <SortableTableHead label="Created" column="created_at" filters={filters} />
                                    <TableHead className="w-[70px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.data.map((notification) => (
                                    <TableRow key={notification.id}>
                                        <TableCell className="align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-lg border border-border/70 bg-muted/35 p-2">
                                                    <MessageSquareDot className="size-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-medium">{notification.title}</div>
                                                    <div className="max-w-xl text-sm leading-6 text-muted-foreground">{notification.message}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-full px-3 py-1">
                                                {notification.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{notification.tenant?.name ?? 'Platform'}</TableCell>
                                        <TableCell>
                                            <StatusBadge value={notification.is_read ? 'read' : 'unread'} />
                                        </TableCell>
                                        <TableCell>{notification.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <RowActionsMenu
                                                actions={
                                                    notification.is_read
                                                        ? []
                                                        : [{ label: 'Mark as read', method: 'patch', href: route('notifications.update', notification.id) }]
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <DataTablePagination paginated={notifications} filters={filters} />
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
    icon: typeof BellRing;
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
