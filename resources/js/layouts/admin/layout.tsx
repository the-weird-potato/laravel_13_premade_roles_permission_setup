import { Link } from '@inertiajs/react';
import { KeyRound, ShieldCheck, Users } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { cn, toUrl } from '@/lib/utils';
import { index as permissionsIndex } from '@/routes/admin/permissions';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as usersIndex } from '@/routes/admin/users';
import type { NavItem } from '@/types';

const navItems: (NavItem & { permission: string })[] = [
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

export default function AdminLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { can } = usePermissions();

    const visibleItems = navItems.filter((item) => can(item.permission));

    return (
        <div className="px-4 py-6">
            <Heading
                title="Access control"
                description="Manage roles, permissions and the access each user holds"
            />

            <nav
                className="flex flex-wrap items-center gap-1"
                aria-label="Access control"
            >
                {visibleItems.map((item, index) => (
                    <Button
                        key={`${toUrl(item.href)}-${index}`}
                        size="sm"
                        variant="ghost"
                        asChild
                        className={cn({
                            'bg-muted': isCurrentOrParentUrl(item.href),
                        })}
                    >
                        <Link href={item.href} prefetch>
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.title}
                        </Link>
                    </Button>
                ))}
            </nav>

            <Separator className="my-6" />

            {children}
        </div>
    );
}
