import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BellRing, Settings } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { notification_unread_count = 0 } = usePage<SharedData>().props;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button asChild variant="ghost" size="icon" className="relative rounded-full" aria-label="Open notifications">
                    <Link href={route('notifications.index')}>
                        <BellRing className="size-4" />
                        {notification_unread_count > 0 ? (
                            <Badge className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full border border-background bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground shadow-none">
                                {notification_unread_count > 99 ? '99+' : notification_unread_count}
                            </Badge>
                        ) : null}
                    </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Open settings">
                    <Link href={route('profile.edit')}>
                        <Settings className="size-4" />
                    </Link>
                </Button>
                <ThemeSwitcher />
            </div>
        </header>
    );
}
