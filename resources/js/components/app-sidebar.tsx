import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    Bell,
    Building2,
    CircleHelp,
    ClipboardCheck,
    Download,
    FileCheck2,
    FileSearch,
    FileText,
    GraduationCap,
    LayoutGrid,
    ShieldCheck,
    SquareKanban,
    UserRound,
    UserRoundPlus,
    Users,
    UsersRound,
    Waypoints,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth, notification_unread_count } = usePage<SharedData>().props;
    const permissions = auth.permissions ?? [];
    const roles = auth.user?.roles?.map((role) => role.name) ?? [];

    const can = (permission: string) => permissions.includes(permission);
    const hasRole = (role: string) => roles.includes(role);

    const makeNav = (items: Array<NavItem & { visible?: boolean }>): NavItem[] =>
        items.filter((item) => item.visible !== false).map(({ visible: _visible, ...item }) => item);

    const mainNavItems: NavItem[] = hasRole('super_admin')
        ? makeNav([
              { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
              { title: 'Tenants', url: '/tenants', icon: Building2, visible: can('manage tenants') },
              { title: 'Departments', url: '/departments', icon: Waypoints, visible: can('manage departments') },

              { title: 'Employees', url: '/employees', icon: Users, visible: can('manage users') },
              { title: 'Courses', url: '/courses', icon: GraduationCap, visible: can('manage courses') },
              { title: 'Courses Assignments', url: '/assignments', icon: SquareKanban, visible: can('assign training') || can('manage courses') },
            //   { title: 'Assessments ', url: '/tests', icon: ClipboardCheck, visible: can('manage tests') },
              { title: 'Test Assignments', url: '/tests?tab=assignments', icon: UsersRound, visible: can('manage tests') },
              { title: 'Assessments Attempts', url: '/test-attempts', icon: ClipboardCheck, visible: can('manage tests') },
              { title: 'Compliance Frameworks', url: '/frameworks', icon: ShieldCheck, visible: can('manage compliance frameworks') },
              //   { title: 'Compliance Frameworks', url: '/frameworks', icon: ShieldCheck, visible: can('manage compliance frameworks') },
              {
                  title: 'Compliance Submissions',
                  url: '/submissions',
                  icon: FileCheck2,
                  visible: can('manage compliance submissions') || can('answer compliance questions'),
              },
              { title: 'Frameworks Evidence', url: '/evidence', icon: FileSearch, visible: can('review evidence') || can('upload evidence') },
              { title: 'Files', url: '/files', icon: FileText, visible: can('view file library') || can('manage file library') },
          ])
        : hasRole('company_admin')
          ? makeNav([
                { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
                { title: 'Employees', url: '/employees', icon: Users, visible: can('manage users') },
                { title: 'Departments', url: '/departments', icon: Waypoints, visible: can('manage departments') },
                { title: 'Invitations', url: '/invitations', icon: UserRoundPlus, visible: can('invite employees') },
                { title: 'Courses', url: '/courses', icon: GraduationCap, visible: can('manage courses') },
                { title: 'Assignments', url: '/assignments', icon: SquareKanban, visible: can('assign training') },
                // { title: 'Tests', url: '/tests', icon: ClipboardCheck, visible: hasRole('company_admin') || can('manage tests') || can('take tests') },
                { title: 'Test Assignments', url: '/tests?tab=assignments', icon: UsersRound, visible: hasRole('company_admin') || can('manage tests') },
                // { title: 'Compliance', url: '/submissions', icon: ShieldCheck, visible: can('manage compliance submissions') || can('answer compliance questions') },
                {
                    title: 'Compliance Submissions',
                    url: '/submissions',
                    icon: FileCheck2,
                    visible: can('manage compliance submissions') || can('answer compliance questions'),
                },
                { title: 'Evidence', url: '/evidence', icon: FileSearch, visible: can('upload evidence') || can('review evidence') },
                { title: 'Files', url: '/files', icon: FileText, visible: can('view file library') || can('manage file library') },
            ])
          : hasRole('reviewer')
            ? makeNav([
                  { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
                  { title: 'Evidence', url: '/evidence', icon: FileSearch, visible: can('review evidence') },
                  {
                      title: 'Submissions',
                      url: '/submissions',
                      icon: FileCheck2,
                      visible: can('review evidence') || can('manage compliance submissions'),
                  },
                  {
                      title: 'Compliance',
                      url: '/submissions',
                      icon: ShieldCheck,
                      visible: can('review evidence') || can('manage compliance submissions'),
                  },
                  { title: 'Files', url: '/files', icon: FileText, visible: can('view file library') || can('manage file library') },
              ])
            : makeNav([
                  { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
                  { title: 'My Courses', url: '/courses', icon: GraduationCap, visible: can('take tests') },
                  { title: 'My Assignments', url: '/assignments', icon: SquareKanban, visible: can('take tests') },
                  { title: 'My Tests', url: '/tests', icon: ClipboardCheck, visible: can('take tests') },
                  {
                      title: 'Assigned Submissions',
                      url: '/submissions',
                      icon: FileCheck2,
                      visible: can('answer compliance questions') || can('upload evidence'),
                  },
                  { title: 'Files', url: '/files', icon: FileText, visible: can('view file library') || can('manage file library') },
                  { title: 'Certificates', url: '/certificates', icon: Award, visible: can('take tests') },
              ]);

    const accountFooterItems: NavItem[] = makeNav([
        { title: 'Help / Support', url: '/help', icon: CircleHelp },
        { title: 'Profile', url: '/settings/profile', icon: UserRound },
        { title: 'Notifications', url: '/notifications', icon: Bell, badgeCount: notification_unread_count },
    ]);

    const footerNavItems: NavItem[] = hasRole('super_admin')
        ? makeNav([
              { title: 'Users', url: '/users', icon: Users, visible: can('manage tenants') && can('manage users') },
              { title: 'Reports', url: '/reports', icon: ClipboardCheck, visible: can('view reports') },
              { title: 'Exports', url: '/exports', icon: Download, visible: can('export reports') },
              ...accountFooterItems,
              { title: 'Audit Logs', url: '/audit-logs', icon: FileSearch, visible: can('view audit logs') },
          ])
        : hasRole('company_admin')
          ? makeNav([
                { title: 'Reports', url: '/reports', icon: ClipboardCheck, visible: can('view reports') },
                { title: 'Exports', url: '/exports', icon: Download, visible: can('export reports') },
                ...accountFooterItems,
            ])
          : hasRole('reviewer')
            ? accountFooterItems
          : accountFooterItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
