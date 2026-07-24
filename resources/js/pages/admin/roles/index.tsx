import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Can from '@/components/can';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PERMISSIONS } from '@/lib/permissions';
import {
    create,
    destroy,
    edit,
    index as rolesIndex,
} from '@/routes/admin/roles';
import type { RoleSummary } from '@/types';

export default function RolesIndex({ roles }: { roles: RoleSummary[] }) {
    return (
        <>
            <Head title="Roles" />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-base font-medium">Roles</h1>
                        <p className="text-sm text-muted-foreground">
                            {roles.length} role{roles.length === 1 ? '' : 's'}{' '}
                            defined
                        </p>
                    </div>

                    <Can permission={PERMISSIONS.createRoles}>
                        <Button
                            asChild
                            size="sm"
                            data-test="create-role-button"
                        >
                            <Link href={create()}>
                                <Plus className="h-4 w-4" />
                                New role
                            </Link>
                        </Button>
                    </Can>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">Role</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead className="pr-4 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="pl-4 font-medium">
                                        <span className="flex items-center gap-2">
                                            {role.name}
                                            {role.is_locked && (
                                                <Badge variant="outline">
                                                    Locked
                                                </Badge>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="whitespace-normal">
                                        {role.permissions.length === 0 ? (
                                            <span className="text-muted-foreground">
                                                No permissions
                                            </span>
                                        ) : (
                                            <span className="flex flex-wrap gap-1">
                                                {role.permissions.map(
                                                    (permission) => (
                                                        <Badge
                                                            key={permission}
                                                            variant="secondary"
                                                        >
                                                            {permission}
                                                        </Badge>
                                                    ),
                                                )}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{role.users_count}</TableCell>
                                    <TableCell className="pr-4 text-right">
                                        {role.is_locked ? (
                                            <span className="text-sm text-muted-foreground">
                                                Protected
                                            </span>
                                        ) : (
                                            <span className="flex justify-end gap-1">
                                                <Can
                                                    permission={
                                                        PERMISSIONS.updateRoles
                                                    }
                                                >
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="ghost"
                                                    >
                                                        <Link
                                                            href={edit(role.id)}
                                                            aria-label={`Edit ${role.name}`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </Can>

                                                <Can
                                                    permission={
                                                        PERMISSIONS.deleteRoles
                                                    }
                                                >
                                                    <DeleteRoleDialog
                                                        role={role}
                                                    />
                                                </Can>
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

function DeleteRoleDialog({ role }: { role: RoleSummary }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${role.name}`}
                    data-test={`delete-role-${role.id}`}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Delete the {role.name} role?</DialogTitle>
                <DialogDescription>
                    {role.users_count === 0
                        ? 'This role is not assigned to anyone. Deleting it cannot be undone.'
                        : `This role is assigned to ${role.users_count} user${
                              role.users_count === 1 ? '' : 's'
                          }, who will lose the permissions it grants.`}
                </DialogDescription>

                <Form {...destroy.form(role.id)}>
                    {({ processing }) => (
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary" type="button">
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                variant="destructive"
                                disabled={processing}
                                data-test="confirm-delete-role"
                            >
                                Delete role
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: rolesIndex(),
        },
    ],
};
