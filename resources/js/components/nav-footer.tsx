import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Eye, ShieldX } from 'lucide-react';

export function NavFooter({
    items,
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const page = usePage<SharedData>();
    const { auth, impersonation } = page.props;

    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.url === page.url} className="cursor-pointer text-foreground/70 hover:text-foreground">
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon className="h-5 w-5" />}
                                    <span>{item.title}</span>
                                    {item.badgeCount ? (
                                        <Badge className="ml-auto rounded-full bg-primary text-primary-foreground">{item.badgeCount}</Badge>
                                    ) : null}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>

                {impersonation.active ? (
                    <div className="mt-4 space-y-3 rounded-2xl border border-[#0D3B73]/20 bg-gradient-to-br from-[#0F2E52] via-[#123867] to-[#14417A] p-4 text-white shadow-sm shadow-[#001833]/15 group-data-[collapsible=icon]:hidden dark:border-white/10">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-white/12 p-2.5 text-white">
                                <Eye className="size-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold tracking-tight">Impersonation active</p>
                                <p className="text-xs leading-5 text-blue-100/90 dark:text-white/80">
                                    {(impersonation.impersonator_name ?? 'A user')} is impersonating {auth.user?.name ?? 'user'}.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full rounded-xl border-0 bg-white text-[#0F2E52] hover:bg-cyan-50 hover:text-[#0F2E52] dark:bg-white dark:text-[#0F2E52] dark:hover:bg-cyan-50 dark:hover:text-[#0F2E52]"
                            onClick={() => router.delete(route('impersonation.stop'))}
                        >
                            <ShieldX className="size-4" />
                            Stop impersonation
                        </Button>
                    </div>
                ) : null}
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
