import { Link } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    KeyRound,
    LayoutGrid,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS, ROLES } from '@/lib/permissions';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as permissionsIndex } from '@/routes/admin/permissions';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as usersIndex } from '@/routes/admin/users';
import { dashboard as userDashboard } from '@/routes/user';
import type { NavItem, NavMainItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const accessNavItems: (NavItem & { permission: string })[] = [
    {
        title: 'Roles',
        href: rolesIndex(),
        icon: ShieldCheck,
        permission: PERMISSIONS.viewRoles,
    },
    {
        title: 'Permissions',
        href: permissionsIndex(),
        icon: KeyRound,
        permission: PERMISSIONS.viewPermissions,
    },
    {
        title: 'Users',
        href: usersIndex(),
        icon: Users,
        permission: PERMISSIONS.viewUsers,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { can, hasRole } = usePermissions();

    const navItems: NavMainItem[] = [...mainNavItems];

    if (hasRole(ROLES.admin)) {
        navItems.push({
            title: 'Admin',
            href: adminDashboard(),
            icon: LayoutGrid,
        });

        const visibleAccessItems = accessNavItems.filter((item) =>
            can(item.permission),
        );

        if (visibleAccessItems.length > 0) {
            navItems.push({
                title: 'Access control',
                icon: ShieldCheck,
                items: visibleAccessItems,
            });
        }
    }

    if (hasRole(ROLES.user)) {
        navItems.push({
            title: 'My area',
            href: userDashboard(),
            icon: UserRound,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
