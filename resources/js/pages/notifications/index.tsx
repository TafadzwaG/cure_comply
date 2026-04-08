import { DataTablePagination } from '@/components/data-table-pagination';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { RowActionsMenu } from '@/components/row-actions-menu';
import { SortableTableHead } from '@/components/sortable-table-head';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { Paginated, SharedData, TableFilters, Tenant } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BellRing, CircleCheck, MailOpen, MessageSquareDot, TimerReset } from 'lucide-react';
import moment from 'moment';

interface NotificationRow {
    id: number;
    title: string;
    message: string;
    type: string;
    action_url?: string | null;
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
    const { notification_unread_count } = usePage<SharedData>().props;
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
                                value={notification_unread_count ?? stats.unread}
                                description="Unread items can be acknowledged individually or cleared in one action."
                            />
                        </CardContent>
                    </Card>
                </section>

                <Card className="border-border/70 shadow-none">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>Notification feed</CardTitle>
                            <CardDescription>Filter by read status and notification type, then review the full message payload below.</CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.patch(route('notifications.read-all'))}
                            disabled={stats.unread === 0}
                        >
                            Mark all read
                        </Button>
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
                        {notifications.data.length ? (
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
                                                        {notification.action_url ? (
                                                            <Link href={route('notifications.open', notification.id)} className="text-xs font-medium text-[#083d77] hover:underline">
                                                                Open related item
                                                            </Link>
                                                        ) : null}
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
                                            <TableCell>{moment(notification.created_at).format('dddd D MMMM YYYY h:mm A')}</TableCell>
                                            <TableCell className="text-right">
                                                <RowActionsMenu
                                                    actions={[
                                                        ...(notification.action_url ? [{ label: 'Open', href: route('notifications.open', notification.id) }] : []),
                                                        ...(!notification.is_read ? [{ label: 'Mark as read', method: 'patch' as const, href: route('notifications.update', notification.id) }] : []),
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-6">
                                <EmptyState
                                    icon={BellRing}
                                    title="No notifications match these filters"
                                    description="Try widening the status or type filters to bring more inbox items back into view."
                                />
                            </div>
                        )}
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
