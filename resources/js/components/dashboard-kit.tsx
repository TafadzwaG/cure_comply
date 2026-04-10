import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScoreDonut } from '@/components/score-donut';
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

export function DashboardQuickStat({
    title,
    value,
    hint,
    donutValue,
}: {
    title: string;
    value: string;
    hint: string;
    donutValue?: number;
}) {
    return (
        <div className="rounded-lg border border-border/70 bg-card px-4 py-3 shadow-none">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                </div>
                {typeof donutValue === 'number' ? <DashboardInlineScore value={donutValue} size="sm" /> : null}
            </div>
        </div>
    );
}

export function DashboardMetricCard({
    label,
    value,
    detail,
    icon,
    donutValue,
}: {
    label: string;
    value: string | number;
    detail: string;
    icon: ReactNode;
    donutValue?: number;
}) {
    return (
        <Card className="border-border/70 bg-card shadow-none">
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                    </div>
                    {typeof donutValue === 'number' ? <DashboardInlineScore value={donutValue} /> : null}
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
        <Card className="border-border/70 bg-card shadow-none">
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base font-medium">{title}</CardTitle>
                        <CardDescription className="text-muted-foreground">{description}</CardDescription>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{item.label}</span>
                            <span className="tabular-nums text-muted-foreground">{item.value}</span>
                        </div>
                        <Progress className="h-2 bg-muted" value={(item.value / total) * 100} />
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
            <Card className="h-full border-border/70 bg-card shadow-none transition-colors hover:bg-muted/40">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
                        <div className="flex items-center gap-2">
                            {badge ? <Badge variant="outline">{badge}</Badge> : null}
                            <ArrowRight className="size-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium">{title}</CardTitle>
                        <CardDescription className="text-muted-foreground">{description}</CardDescription>
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
        <Card className="border-border/70 bg-card shadow-none">
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.length ? (
                    items.map((item, index) => (
                        <div key={item.id}>
                            <div className="flex items-start justify-between gap-4 py-1">
                                <div className="min-w-0 flex-1 space-y-1">
                                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                                    <p className="text-xs leading-5 text-muted-foreground">{item.description}</p>
                                    {item.meta ? <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.meta}</p> : null}
                                </div>
                                {item.created_at ? (
                                    <div className="whitespace-nowrap text-xs text-muted-foreground">{item.created_at}</div>
                                ) : null}
                            </div>
                            {index < items.length - 1 ? <Separator /> : null}
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
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
        <Card className="border-border/70 bg-card shadow-none">
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid h-64 grid-cols-6 items-end gap-3 rounded-lg border border-border/70 bg-muted/30 p-4">
                    {points.map((point) => (
                        <div key={point.label} className="flex h-full flex-col justify-end gap-2">
                            <div className="flex h-full items-end justify-center gap-1.5">
                                <TrendBar value={point.primary} max={max} className="bg-primary" />
                                {typeof point.secondary === 'number' ? (
                                    <TrendBar value={point.secondary} max={max} className="bg-primary/70" />
                                ) : null}
                                {typeof point.tertiary === 'number' ? (
                                    <TrendBar value={point.tertiary} max={max} className="bg-primary/40" />
                                ) : null}
                            </div>
                            <div className="text-center text-xs text-muted-foreground">{point.label}</div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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
    return (
        <Card className="border-border/70 bg-card shadow-none">
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {items.length ? (
                    <ScoreDonut value={value} subtitle={subtitle} items={items} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
                        <ScoreDonut value={value} subtitle={subtitle} />
                        <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                            No section scoring is available yet.
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function DashboardInlineScore({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
    const clamped = Math.max(0, Math.min(100, value));
    const radius = size === 'sm' ? 16 : 18;
    const svgSize = size === 'sm' ? 40 : 44;
    const strokeWidth = 4;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (clamped / 100) * circumference;

    return (
        <div className="inline-flex items-center gap-2">
            <div
                className={`relative inline-flex items-center justify-center ${size === 'sm' ? 'h-10 w-10' : 'h-11 w-11'}`}
                aria-hidden="true"
            >
                <svg className="-rotate-90" width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                    <circle
                        cx={svgSize / 2}
                        cy={svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-border"
                    />
                    <circle
                        cx={svgSize / 2}
                        cy={svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="text-primary"
                    />
                </svg>
                <span className={`absolute font-semibold tabular-nums text-foreground ${size === 'sm' ? 'text-[10px]' : 'text-[11px]'}`}>
                    {Math.round(clamped)}
                </span>
            </div>
            <span className="font-medium tabular-nums text-foreground">{Math.round(clamped)}%</span>
        </div>
    );
}

function TrendBar({ value, max, className }: { value: number; max: number; className: string }) {
    const height = Math.max((value / max) * 100, value > 0 ? 8 : 2);

    return <div className={`w-3 rounded-sm ${className}`} style={{ height: `${height}%`, opacity: Math.max(0.32, value / max) }} />;
}
