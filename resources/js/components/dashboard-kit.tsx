import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface BreakdownItem {
    label: string;
    value: number;
}

export interface ActivityItem {
    id: number;
    title: string;
    description: string;
    meta?: string | null;
    created_at?: string | null;
}

export interface TrendSeriesPoint {
    label: string;
    primary: number;
    secondary?: number;
    tertiary?: number;
}

export function DashboardQuickStat({ title, value, hint }: { title: string; value: string; hint: string }) {
    return (
        <div className="rounded-lg border border-[#c3c6d1]/50 bg-white px-4 py-3 shadow-none">
            <p className="text-xs uppercase tracking-[0.2em] text-[#434750]">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#002753]">{value}</p>
            <p className="mt-1 text-xs text-[#434750]">{hint}</p>
        </div>
    );
}

export function DashboardMetricCard({
    label,
    value,
    detail,
    icon,
}: {
    label: string;
    value: string | number;
    detail: string;
    icon: ReactNode;
}) {
    return (
        <Card className="border-[#c3c6d1]/50 bg-white shadow-none">
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#434750]">{label}</span>
                    <div className="rounded-xl bg-[#d6e3ff] p-2 text-[#083d77]">{icon}</div>
                </div>
                <div>
                    <div className="text-3xl font-semibold tracking-tight text-[#002753] tabular-nums">{value}</div>
                    <p className="mt-1 text-xs leading-5 text-[#434750]">{detail}</p>
                </div>
            </CardHeader>
        </Card>
    );
}

export function DashboardBreakdownCard({
    title,
    description,
    items,
    icon,
}: {
    title: string;
    description: string;
    items: BreakdownItem[];
    icon: ReactNode;
}) {
    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

    return (
        <Card className="border-[#c3c6d1]/50 bg-white shadow-none">
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base font-medium text-[#002753]">{title}</CardTitle>
                        <CardDescription className="text-[#434750]">{description}</CardDescription>
                    </div>
                    <div className="rounded-xl bg-[#d6e3ff] p-2 text-[#083d77]">{icon}</div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#002753]">{item.label}</span>
                            <span className="tabular-nums text-[#434750]">{item.value}</span>
                        </div>
                        <Progress className="h-2 bg-[#e6e8ea]" value={(item.value / total) * 100} />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function DashboardActionCard({
    title,
    description,
    href,
    icon,
    badge,
}: {
    title: string;
    description: string;
    href: string;
    icon: ReactNode;
    badge?: string;
}) {
    return (
        <Link href={href} className="block">
            <Card className="h-full border-[#c3c6d1]/50 bg-white shadow-none transition-colors hover:bg-[#d6e3ff]/20">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="rounded-xl bg-[#d6e3ff] p-2 text-[#083d77]">{icon}</div>
                        <div className="flex items-center gap-2">
                            {badge ? <Badge variant="outline">{badge}</Badge> : null}
                            <ArrowRight className="size-4 text-[#434750]" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium text-[#002753]">{title}</CardTitle>
                        <CardDescription className="text-[#434750]">{description}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}

export function DashboardActivityFeed({
    title,
    description,
    items,
    emptyMessage,
}: {
    title: string;
    description: string;
    items: ActivityItem[];
    emptyMessage: string;
}) {
    return (
        <Card className="border-[#c3c6d1]/50 bg-white shadow-none">
            <CardHeader>
                <CardTitle className="text-base font-medium text-[#002753]">{title}</CardTitle>
                <CardDescription className="text-[#434750]">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.length ? (
                    items.map((item, index) => (
                        <div key={item.id}>
                            <div className="flex items-start justify-between gap-4 py-1">
                                <div className="min-w-0 flex-1 space-y-1">
                                    <p className="text-sm font-medium text-[#002753]">{item.title}</p>
                                    <p className="text-xs leading-5 text-[#434750]">{item.description}</p>
                                    {item.meta ? <p className="text-[11px] uppercase tracking-[0.18em] text-[#434750]">{item.meta}</p> : null}
                                </div>
                                {item.created_at ? (
                                    <div className="whitespace-nowrap text-xs text-[#434750]">{item.created_at}</div>
                                ) : null}
                            </div>
                            {index < items.length - 1 ? <Separator /> : null}
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-[#c3c6d1]/60 bg-[#f2f4f6] p-4 text-sm text-[#434750]">
                        {emptyMessage}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function DashboardTrendChart({
    title,
    description,
    points,
    legends,
}: {
    title: string;
    description: string;
    points: TrendSeriesPoint[];
    legends: { label: string; tone: string }[];
}) {
    const values = points.flatMap((point) => [point.primary, point.secondary ?? 0, point.tertiary ?? 0]);
    const max = Math.max(...values, 1);

    return (
        <Card className="border-[#c3c6d1]/50 bg-white shadow-none">
            <CardHeader>
                <CardTitle className="text-base font-medium text-[#002753]">{title}</CardTitle>
                <CardDescription className="text-[#434750]">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid h-64 grid-cols-6 items-end gap-3 rounded-lg border border-[#c3c6d1]/50 bg-[#f2f4f6] p-4">
                    {points.map((point) => (
                        <div key={point.label} className="flex h-full flex-col justify-end gap-2">
                            <div className="flex h-full items-end justify-center gap-1.5">
                                <TrendBar value={point.primary} max={max} className="bg-[#083d77]" />
                                {typeof point.secondary === 'number' ? (
                                    <TrendBar value={point.secondary} max={max} className="bg-[#194781]" />
                                ) : null}
                                {typeof point.tertiary === 'number' ? (
                                    <TrendBar value={point.tertiary} max={max} className="bg-[#00b9ce]" />
                                ) : null}
                            </div>
                            <div className="text-center text-xs text-[#434750]">{point.label}</div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-[#434750]">
                    {legends.map((legend) => (
                        <span key={legend.label} className="inline-flex items-center gap-2">
                            <span className={`size-2 rounded-full ${legend.tone}`} />
                            {legend.label}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function DashboardRingCard({
    title,
    description,
    value,
    subtitle,
    items,
}: {
    title: string;
    description: string;
    value: number;
    subtitle: string;
    items: BreakdownItem[];
}) {
    const circumference = 2 * Math.PI * 52;
    const clamped = Math.max(0, Math.min(100, value));
    const dashOffset = circumference - (clamped / 100) * circumference;

    return (
        <Card className="border-[#c3c6d1]/50 bg-white shadow-none">
            <CardHeader>
                <CardTitle className="text-base font-medium text-[#002753]">{title}</CardTitle>
                <CardDescription className="text-[#434750]">{description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
                <div className="flex items-center justify-center">
                    <div className="relative flex h-40 w-40 items-center justify-center">
                        <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
                            <circle cx="70" cy="70" r="52" fill="none" stroke="currentColor" strokeWidth="12" className="text-[#e6e8ea]" />
                            <circle
                                cx="70"
                                cy="70"
                                r="52"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                className="text-[#083d77]"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <div className="text-3xl font-semibold text-[#002753] tabular-nums">{Math.round(clamped)}%</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#434750]">{subtitle}</div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    {items.length ? (
                        items.map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#002753]">{item.label}</span>
                                    <span className="tabular-nums text-[#434750]">{item.value}%</span>
                                </div>
                                <Progress className="h-2 bg-[#e6e8ea]" value={item.value} />
                            </div>
                        ))
                    ) : (
                        <div className="rounded-lg border border-dashed border-[#c3c6d1]/60 bg-[#f2f4f6] p-4 text-sm text-[#434750]">
                            No section scoring is available yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function TrendBar({ value, max, className }: { value: number; max: number; className: string }) {
    const height = Math.max((value / max) * 100, value > 0 ? 8 : 2);

    return <div className={`w-3 rounded-sm ${className}`} style={{ height: `${height}%`, opacity: Math.max(0.32, value / max) }} />;
}
