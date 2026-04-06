import { Card, CardContent } from '@/components/ui/card';
import { type IndexStat } from '@/types';

export function IndexStatCard({ label, value, detail, icon: Icon }: IndexStat) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
                    {detail ? <p className="text-xs leading-5 text-muted-foreground">{detail}</p> : null}
                </div>
                {Icon ? (
                    <div className="rounded-md border border-border/70 bg-muted/40 p-2.5 text-foreground">
                        <Icon className="size-4" />
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
