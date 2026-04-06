import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, ArrowRight, LayoutTemplate, Sparkles } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    eyebrow?: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
        icon?: LucideIcon;
    };
    children?: ReactNode;
}

export function PageHeader({
    title,
    description,
    icon: Icon = LayoutTemplate,
    eyebrow = 'PrivacyCure Workspace',
    action,
    children,
}: PageHeaderProps) {
    const ActionIcon = action?.icon ?? ArrowRight;

    return (
        <div className="rounded-md border border-border/60 shadow-none">
            <div className="rounded-md bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 max-w-3xl space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-md border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/10">
                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                {eyebrow}
                            </Badge>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10">
                                <Icon className="h-5 w-5 text-white" />
                            </div>

                            <div className="min-w-0 space-y-1">
                                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                                <p className="text-sm leading-6 text-white/80">{description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {children}

                        {action?.label ? (
                            action.href ? (
                                <Button
                                    asChild
                                    className="rounded-md bg-white text-[#0F2E52] hover:bg-white/90"
                                >
                                    <a href={action.href}>
                                        {action.label}
                                        <ActionIcon className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            ) : (
                                <Button
                                    onClick={action.onClick}
                                    className="rounded-md bg-white text-[#0F2E52] hover:bg-white/90"
                                >
                                    {action.label}
                                    <ActionIcon className="ml-2 h-4 w-4" />
                                </Button>
                            )
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}