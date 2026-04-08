import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { Download, Eye, MoreHorizontal, Pencil, Plus, RotateCcw, Trash2, UserCog } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface RowAction {
    label: string;
    href?: string;
    method?: 'get' | 'post' | 'patch' | 'put' | 'delete';
    onClick?: () => void;
    destructive?: boolean;
    icon?: LucideIcon;
}

export function RowActionsMenu({ actions }: { actions: RowAction[] }) {
    if (actions.length === 0) {
        return null;
    }

    return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open row actions">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {actions.map((action, index) => (
                    <div key={`${action.label}-${index}`}>
                        {index > 0 ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem
                            className={action.destructive ? 'cursor-pointer text-destructive focus:text-destructive' : 'cursor-pointer'}
                            onClick={() => {
                                if (action.onClick) {
                                    action.onClick();

                                    return;
                                }

                                if (action.href) {
                                    router.visit(action.href, {
                                        method: action.method ?? 'get',
                                        preserveScroll: true,
                                    });
                                }
                            }}
                        >
                            {(action.icon ?? inferActionIcon(action.label)) ? (
                                (() => {
                                    const Icon = action.icon ?? inferActionIcon(action.label);

                                    return Icon ? <Icon className="size-4" /> : null;
                                })()
                            ) : null}
                            {action.label}
                        </DropdownMenuItem>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function inferActionIcon(label: string): LucideIcon | undefined {
    const normalized = label.toLowerCase();

    if (normalized.includes('view')) {
        return Eye;
    }

    if (normalized.includes('edit')) {
        return Pencil;
    }

    if (normalized.includes('delete') || normalized.includes('remove')) {
        return Trash2;
    }

    if (normalized.includes('download')) {
        return Download;
    }

    if (normalized.includes('recalculate') || normalized.includes('refresh')) {
        return RotateCcw;
    }

    if (normalized.includes('assign') || normalized.includes('invite') || normalized.includes('add') || normalized.includes('create')) {
        return Plus;
    }

    if (normalized.includes('impersonat')) {
        return UserCog;
    }

    return undefined;
}
