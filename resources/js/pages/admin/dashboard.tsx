import { Head, Link } from '@inertiajs/react';
import { KeyRound, ShieldCheck, Users } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import { index as permissionsIndex } from '@/routes/admin/permissions';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as usersIndex } from '@/routes/admin/users';

const shortcuts = [
    {
        title: 'Roles',
        description: 'Create roles and choose the permissions they grant.',
        href: rolesIndex(),
        icon: ShieldCheck,
    },
    {
        title: 'Permissions',
        description: 'Review every permission and the roles holding it.',
        href: permissionsIndex(),
        icon: KeyRound,
    },
    {
        title: 'Users',
        description: 'Assign roles and grant direct permissions.',
        href: usersIndex(),
        icon: Users,
    },
];

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    title="Admin"
                    description="Everything reachable only by administrators"
                />

                <div className="grid gap-4 md:grid-cols-3">
                    {shortcuts.map((shortcut) => (
                        <div
                            key={shortcut.title}
                            className="flex flex-col gap-3 rounded-xl border p-4"
                        >
                            <shortcut.icon className="h-5 w-5 text-muted-foreground" />

                            <div className="space-y-1">
                                <p className="font-medium">{shortcut.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {shortcut.description}
                                </p>
                            </div>

                            <Button
                                asChild
                                size="sm"
                                variant="secondary"
                                className="mt-auto w-fit"
                            >
                                <Link href={shortcut.href}>Open</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard(),
        },
    ],
};
