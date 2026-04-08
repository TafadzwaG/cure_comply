import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export function BrandCard({
    title,
    description,
    children,
    className,
    headerRight,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    headerRight?: ReactNode;
}) {
    return (
        <Card className={cn('border-[#c3c6d1]/50 bg-white shadow-none dark:bg-neutral-900', className)}>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-base font-medium text-[#002753] dark:text-white">{title}</CardTitle>
                        {description ? <CardDescription className="text-[#434750] dark:text-neutral-400">{description}</CardDescription> : null}
                    </div>
                    {headerRight}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
