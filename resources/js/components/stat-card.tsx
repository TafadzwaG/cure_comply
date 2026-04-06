import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
    label: string;
    value: string | number;
    detail: string;
    icon?: ReactNode;
}

export function StatCard({ label, value, detail, icon }: StatCardProps) {
    return (
        <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm shadow-black/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">{value}</CardTitle>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-primary">{icon}</div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{detail}</p>
            </CardContent>
        </Card>
    );
}
