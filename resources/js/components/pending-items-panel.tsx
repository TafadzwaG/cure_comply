import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type PendingItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Building2,
    CheckCircle2,
    FileSearch,
    ShieldCheck,
} from 'lucide-react';

interface PendingItemsPanelProps {
    items: PendingItem[];
}

const typeConfig: Record<
    PendingItem['type'],
    {
        label: string;
        icon: typeof BookOpen;
    }
> = {
    tenant_approval: {
        label: 'Tenant Approvals',
        icon: Building2,
    },
    course_assignment: {
        label: 'Course Assignments',
        icon: BookOpen,
    },
    compliance_submission: {
        label: 'Compliance Submissions',
        icon: ShieldCheck,
    },
    evidence_review: {
        label: 'Evidence Review',
        icon: FileSearch,
    },
};

function PriorityBadge({ value }: { value: PendingItem['priority'] }) {
    return (
        <Badge
            variant="outline"
            className="rounded-md px-2 py-0 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
        >
            {value}
        </Badge>
    );
}

function QueueStat({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium tabular-nums">{value}</span>
        </div>
    );
}

export default function PendingItemsPanel({ items }: PendingItemsPanelProps) {
    if (!items || items.length === 0) {
        return null;
    }

    const counts = {
        total: items.length,
        high: items.filter((item) => item.priority === 'high').length,
        medium: items.filter((item) => item.priority === 'medium').length,
        low: items.filter((item) => item.priority === 'low').length,
        tenant_approval: items.filter((item) => item.type === 'tenant_approval').length,
        course_assignment: items.filter((item) => item.type === 'course_assignment').length,
        compliance_submission: items.filter((item) => item.type === 'compliance_submission').length,
        evidence_review: items.filter((item) => item.type === 'evidence_review').length,
    };

    const sortedItems = [...items].sort((a, b) => {
        const priorityRank = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.title.localeCompare(b.title);
    });

    return (
        <Card className="rounded-md border-border/60 shadow-none">
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                            <AlertTriangle className="size-4 text-[#14417A]" />
                            Action Required
                        </CardTitle>
                        <CardDescription>
                            A unified queue of approvals, assignments, submissions, and evidence items
                            that still need attention.
                        </CardDescription>
                    </div>

                    <Badge variant="outline" className="w-fit rounded-md tabular-nums">
                        {counts.total} open
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                Overview
                            </p>

                            <QueueStat label="Total Open" value={counts.total} />
                            <QueueStat label="High Priority" value={counts.high} />
                            <QueueStat label="Medium Priority" value={counts.medium} />
                            <QueueStat label="Low Priority" value={counts.low} />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                By Type
                            </p>

                            <div className="space-y-2">
                                {(
                                    [
                                        'tenant_approval',
                                        'course_assignment',
                                        'compliance_submission',
                                        'evidence_review',
                                    ] as PendingItem['type'][]
                                ).map((type) => {
                                    const config = typeConfig[type];
                                    const Icon = config.icon;
                                    const count = counts[type];

                                    if (!count) return null;

                                    return (
                                        <div
                                            key={type}
                                            className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#14417A]/15 bg-[#14417A]/5">
                                                    <Icon className="size-3.5 text-[#14417A]" />
                                                </div>
                                                <span className="truncate text-sm">{config.label}</span>
                                            </div>

                                            <span className="text-sm font-medium tabular-nums">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <Separator />

                        <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 text-[#14417A]" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Queue guidance</p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Prioritize high items first, then clear grouped operational work
                                        like assignments and evidence review.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                Pending Queue
                            </p>
                            <span className="text-xs text-muted-foreground">
                                Sorted by priority
                            </span>
                        </div>

                        <div className="overflow-hidden rounded-md border border-border/60">
                            {sortedItems.map((item, index) => {
                                const config = typeConfig[item.type];
                                const Icon = config.icon;

                                return (
                                    <div key={`${item.type}-${item.id}`}>
                                        <Link
                                            href={item.href}
                                            className="group block bg-background px-4 py-3 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#14417A]/15 bg-[#14417A]/5">
                                                    <Icon className="size-4 text-[#14417A]" />
                                                </div>

                                                <div className="min-w-0 flex-1 space-y-1.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-medium">
                                                            {item.title}
                                                        </p>
                                                        <PriorityBadge value={item.priority} />
                                                        <Badge
                                                            variant="secondary"
                                                            className="rounded-md px-1.5 py-0 text-[11px]"
                                                        >
                                                            {config.label}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-xs leading-5 text-muted-foreground">
                                                        {item.description}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                                        {item.due_date ? <span>Due: {item.due_date}</span> : null}
                                                        {item.created_at ? <span>{item.created_at}</span> : null}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 rounded-md text-[#14417A] hover:bg-[#14417A]/5 hover:text-[#14417A]"
                                                >
                                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                                </Button>
                                            </div>
                                        </Link>

                                        {index < sortedItems.length - 1 ? <Separator /> : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}