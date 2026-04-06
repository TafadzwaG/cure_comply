import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LucideIcon } from 'lucide-react';

interface GuidanceItem {
    title: string;
    description: string;
    icon: LucideIcon;
}

export function CreateGuidancePanel({
    title,
    description,
    items,
}: {
    title: string;
    description: string;
    items: GuidanceItem[];
}) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <div key={item.title}>
                            <div className="flex items-start gap-3">
                                <div className="rounded-md border border-border/70 bg-muted/40 p-2 text-foreground">
                                    <Icon className="size-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                            {index < items.length - 1 ? <Separator className="mt-4" /> : null}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
