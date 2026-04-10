import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Palette } from 'lucide-react';

export default function SettingsLayout({
    children,
    fullWidth = false,
}: {
    children: React.ReactNode;
    fullWidth?: boolean;
}) {
    const currentPath = window.location.pathname;
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.display_role === 'super_admin';
    const isCompanyAdmin = auth.user?.display_role === 'company_admin';
    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            url: '/settings/profile',
            icon: null,
        },
        {
            title: 'Password',
            url: '/settings/password',
            icon: null,
        },
        {
            title: 'Appearance',
            url: '/settings/appearance',
            icon: null,
        },
        ...((isSuperAdmin || isCompanyAdmin)
            ? [
                  {
                      title: 'Branding',
                      url: '/settings/branding',
                      icon: Palette,
                  },
              ]
            : []),
        ...(isSuperAdmin
            ? [
                  {
                      title: 'Platform',
                      url: '/settings/platform',
                      icon: null,
                  },
              ]
            : []),
    ];

    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.url,
                                })}
                            >
                                <Link href={item.url} prefetch>
                                    {item.icon ? <item.icon className="size-4" /> : null}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className={cn('flex-1', fullWidth ? 'min-w-0' : 'md:max-w-2xl')}>
                    <section className={cn('space-y-12', fullWidth ? 'w-full' : 'max-w-xl')}>{children}</section>
                </div>
            </div>
        </div>
    );
}
