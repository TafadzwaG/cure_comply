import { Progress } from '@/components/ui/progress';

export function ScoreDonut({
    value,
    subtitle,
    items = [],
}: {
    value: number;
    subtitle: string;
    items?: Array<{ label: string; value: number }>;
}) {
    const circumference = 2 * Math.PI * 52;
    const clamped = Math.max(0, Math.min(100, value));
    const dashOffset = circumference - (clamped / 100) * circumference;

    return (
        <div className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
            <div className="flex items-center justify-center">
                <div className="relative flex h-40 w-40 items-center justify-center">
                    <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r="52" fill="none" stroke="currentColor" strokeWidth="12" className="text-border" />
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
                            className="text-primary"
                        />
                    </svg>
                    <div className="absolute text-center">
                        <div className="text-3xl font-semibold text-foreground tabular-nums">{Math.round(clamped)}%</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{subtitle}</div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{item.label}</span>
                            <span className="tabular-nums text-muted-foreground">{item.value}%</span>
                        </div>
                        <Progress className="h-2 bg-muted" value={item.value} />
                    </div>
                ))}
            </div>
        </div>
    );
}
