import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type PendingItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Building2,
    FileSearch,
    ShieldCheck,
} from 'lucide-react';

interface PendingItemsPanelProps {
    items: PendingItem[];
}

const typeConfig: Record<
    PendingItem['type'],
    { label: string; icon: typeof BookOpen; color: string; bgColor: string }
> = {
    tenant_approval: {
        label: 'Tenant Approvals',
        icon: Building2,
        color: 'text-violet-700 dark:text-violet-300',
        bgColor: 'bg-violet-100 dark:bg-violet-900/40',
    },
    course_assignment: {
        label: 'Course Assignments',
        icon: BookOpen,
        color: 'text-blue-700 dark:text-blue-300',
        bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    },
    compliance_submission: {
        label: 'Compliance Submissions',
        icon: ShieldCheck,
        color: 'text-amber-700 dark:text-amber-300',
        bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    },
    evidence_review: {
        label: 'Evidence Review',
        icon: FileSearch,
        color: 'text-emerald-700 dark:text-emerald-300',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    },
};

const priorityStyles: Record<string, string> = {
    high: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300',
    medium: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    low: 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function PendingItemsPanel({ items }: PendingItemsPanelProps) {
    if (!items || items.length === 0) {
        return null;
    }

    const grouped = items.reduce(
        (acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        },
        {} as Record<string, PendingItem[]>,
    );

    const totalCount = items.length;
    const highPriority = items.filter((i) => i.priority === 'high').length;

    return (
        <Card className="border-[#c3c6d1]/50 shadow-none">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base font-medium text-[#002753] dark:text-slate-100">
                            <AlertTriangle className="size-4 text-amber-500" />
                            Action Required
                        </CardTitle>
                        <CardDescription>
                            {totalCount} pending {totalCount === 1 ? 'item' : 'items'} across your workspace
                            {highPriority > 0 && (
                                <span className="ml-1 font-medium text-red-600 dark:text-red-400">
                                    ({highPriority} high priority)
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full tabular-nums">
                        {totalCount}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {Object.entries(grouped).map(([type, groupItems]) => {
                    const config = typeConfig[type as PendingItem['type']];
                    const Icon = config.icon;

                    return (
                        <div key={type} className="space-y-2.5">
                            <div className="flex items-center gap-2">
                                <div className={`rounded-lg p-1.5 ${config.bgColor}`}>
                                    <Icon className={`size-3.5 ${config.color}`} />
                                </div>
                                <span className="text-sm font-medium text-[#002753] dark:text-slate-200">
                                    {config.label}
                                </span>
                                <Badge variant="secondary" className="ml-auto rounded-full text-xs tabular-nums">
                                    {groupItems.length}
                                </Badge>
                            </div>

                            <div className="space-y-2 pl-1">
                                {groupItems.map((item) => (
                                    <Link
                                        key={`${item.type}-${item.id}`}
                                        href={item.href}
                                        className="group block rounded-lg border border-[#c3c6d1]/40 bg-white p-3 transition-all hover:border-[#14417A]/30 hover:bg-[#d6e3ff]/10 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-medium text-[#002753] dark:text-slate-100">
                                                        {item.title}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={`shrink-0 rounded-full px-2 py-0 text-[10px] uppercase tracking-wider ${priorityStyles[item.priority]}`}
                                                    >
                                                        {item.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs leading-5 text-[#434750] dark:text-slate-400">
                                                    {item.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-[11px] text-[#434750]/70 dark:text-slate-500">
                                                    {item.due_date && (
                                                        <span>Due: {item.due_date}</span>
                                                    )}
                                                    {item.created_at && (
                                                        <span>{item.created_at}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="mt-0.5 size-4 shrink-0 text-[#434750]/50 transition-transform group-hover:translate-x-0.5 group-hover:text-[#14417A] dark:text-slate-500 dark:group-hover:text-slate-300" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
