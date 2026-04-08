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
                        <circle cx="70" cy="70" r="52" fill="none" stroke="currentColor" strokeWidth="12" className="text-[#e6e8ea] dark:text-neutral-800" />
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
                        <div className="text-3xl font-semibold text-[#002753] tabular-nums dark:text-white">{Math.round(clamped)}%</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#434750] dark:text-neutral-400">{subtitle}</div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#002753] dark:text-white">{item.label}</span>
                            <span className="tabular-nums text-[#434750] dark:text-neutral-400">{item.value}%</span>
                        </div>
                        <Progress className="h-2 bg-[#e6e8ea] dark:bg-neutral-800" value={item.value} />
                    </div>
                ))}
            </div>
        </div>
    );
}
