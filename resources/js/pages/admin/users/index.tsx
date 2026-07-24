import { Form, Head, Link, router } from '@inertiajs/react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
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
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PERMISSIONS } from '@/lib/permissions';
import { destroy, edit, index } from '@/routes/admin/users';
import type { ManagedUser, Paginated } from '@/types';

export default function UsersIndex({
    users,
    filters,
}: {
    users: Paginated<ManagedUser>;
    filters: { search: string };
}) {
    const [search, setSearch] = useState(filters.search);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            index().url,
            { search },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Users" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-base font-medium">Users</h1>
                        <p className="text-sm text-muted-foreground">
                            {users.total} user{users.total === 1 ? '' : 's'}
                        </p>
                    </div>

                    <form
                        onSubmit={submitSearch}
                        className="flex w-full max-w-sm items-center gap-2"
                    >
                        <Input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or email"
                            aria-label="Search users"
                        />

                        <Button size="sm" variant="secondary" type="submit">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                    </form>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead className="pr-4 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No users matched your search.
                                    </TableCell>
                                </TableRow>
                            )}

                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="pl-4 font-medium">
                                        <span className="flex items-center gap-2">
                                            {user.name}
                                            {user.is_self && (
                                                <Badge variant="outline">
                                                    You
                                                </Badge>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {user.email}
                                    </TableCell>
                                    <TableCell className="whitespace-normal">
                                        {user.roles.length === 0 ? (
                                            <span className="text-muted-foreground">
                                                No roles
                                            </span>
                                        ) : (
                                            <span className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="secondary"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="pr-4 text-right">
                                        {user.is_self ? (
                                            <span className="text-sm text-muted-foreground">
                                                Manage in settings
                                            </span>
                                        ) : (
                                            <span className="flex justify-end gap-1">
                                                <Can
                                                    permission={
                                                        PERMISSIONS.updateUsers
                                                    }
                                                >
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="ghost"
                                                    >
                                                        <Link
                                                            href={edit(user.id)}
                                                            aria-label={`Edit ${user.name}`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </Can>

                                                <Can
                                                    permission={
                                                        PERMISSIONS.deleteUsers
                                                    }
                                                >
                                                    <DeleteUserDialog
                                                        user={user}
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

                {users.links.length > 3 && (
                    <nav
                        className="flex flex-wrap gap-1"
                        aria-label="Pagination"
                    >
                        {users.links.map((link, position) => (
                            <Button
                                key={`${link.label}-${position}`}
                                size="sm"
                                variant={link.active ? 'secondary' : 'ghost'}
                                disabled={link.url === null}
                                asChild={link.url !== null}
                            >
                                {link.url === null ? (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <Link
                                        href={link.url}
                                        preserveState
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </nav>
                )}
            </div>
        </>
    );
}

function DeleteUserDialog({ user }: { user: ManagedUser }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${user.name}`}
                    data-test={`delete-user-${user.id}`}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Delete {user.name}?</DialogTitle>
                <DialogDescription>
                    This permanently deletes the account and everything attached
                    to it. This cannot be undone.
                </DialogDescription>

                <Form {...destroy.form(user.id)}>
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
                                data-test="confirm-delete-user"
                            >
                                Delete user
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index(),
        },
    ],
};
