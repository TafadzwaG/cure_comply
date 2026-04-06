import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
    title: string;
    description: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
    children?: ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm shadow-black/5 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Cure Comply</p>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {children}
                {action?.label ? <Button asChild={Boolean(action.href)} onClick={action.onClick}>{action.href ? <a href={action.href}>{action.label}</a> : action.label}</Button> : null}
            </div>
        </div>
    );
}
