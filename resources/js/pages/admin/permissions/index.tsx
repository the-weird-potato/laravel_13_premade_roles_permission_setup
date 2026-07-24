import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index } from '@/routes/admin/permissions';
import type { PermissionSummary } from '@/types';

export default function PermissionsIndex({
    permissions,
}: {
    permissions: PermissionSummary[];
}) {
    return (
        <>
            <Head title="Permissions" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-base font-medium">Permissions</h1>
                    <p className="text-sm text-muted-foreground">
                        {permissions.length} permission
                        {permissions.length === 1 ? '' : 's'} defined by the
                        application
                    </p>
                </div>

                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Permissions are declared in code, in{' '}
                    <code className="text-foreground">
                        App\Models\Permission::catalog()
                    </code>
                    , and seeded from there — a permission only does anything
                    because the application checks for it. To hand one out,
                    attach it to a role or grant it to a user directly.
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">
                                    Permission
                                </TableHead>
                                <TableHead>Group</TableHead>
                                <TableHead className="pr-4">
                                    Granted to
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((permission) => (
                                <TableRow key={permission.id}>
                                    <TableCell className="pl-4 font-medium">
                                        <span className="flex items-center gap-2">
                                            {permission.name}
                                            {permission.is_orphaned && (
                                                <Badge variant="outline">
                                                    Not in catalog
                                                </Badge>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {permission.group}
                                    </TableCell>
                                    <TableCell className="pr-4 whitespace-normal">
                                        {permission.roles.length === 0 ? (
                                            <span className="text-muted-foreground">
                                                No roles
                                            </span>
                                        ) : (
                                            <span className="flex flex-wrap gap-1">
                                                {permission.roles.map(
                                                    (role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="secondary"
                                                        >
                                                            {role}
                                                        </Badge>
                                                    ),
                                                )}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Permissions',
            href: index(),
        },
    ],
};
