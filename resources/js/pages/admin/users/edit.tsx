import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PermissionPicker from '@/components/permission-picker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { index, update } from '@/routes/admin/users';
import type { PermissionGroup } from '@/types';

type EditableUser = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
};

export default function EditUser({
    user,
    roles,
    permissionGroups,
}: {
    user: EditableUser;
    roles: string[];
    permissionGroups: PermissionGroup[];
}) {
    const { data, setData, put, processing, errors } = useForm<{
        roles: string[];
        permissions: string[];
    }>({
        roles: user.roles,
        permissions: user.permissions,
    });

    const toggleRole = (role: string, checked: boolean) => {
        setData(
            'roles',
            checked
                ? [...new Set([...data.roles, role])]
                : data.roles.filter((name) => name !== role),
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put(update(user.id).url);
    };

    return (
        <>
            <Head title={`Manage ${user.name}`} />

            <form onSubmit={submit} className="space-y-6">
                <Heading
                    variant="small"
                    title={user.name}
                    description={user.email}
                />

                <div className="space-y-3">
                    <Label>Roles</Label>

                    <div className="flex flex-wrap gap-4 rounded-lg border p-4">
                        {roles.map((role) => (
                            <div key={role} className="flex items-center gap-2">
                                <Checkbox
                                    id={`role-${role}`}
                                    checked={data.roles.includes(role)}
                                    onCheckedChange={(checked) =>
                                        toggleRole(role, checked === true)
                                    }
                                />
                                <Label
                                    htmlFor={`role-${role}`}
                                    className="font-normal"
                                >
                                    {role}
                                </Label>
                            </div>
                        ))}
                    </div>

                    <InputError message={errors.roles} />
                </div>

                <div className="space-y-3">
                    <Label>Direct permissions</Label>

                    <p className="text-xs text-muted-foreground">
                        Granted on top of whatever the selected roles already
                        allow. Leave these empty to manage access purely through
                        roles.
                    </p>

                    <PermissionPicker
                        groups={permissionGroups}
                        selected={data.permissions}
                        onChange={(permissions) =>
                            setData('permissions', permissions)
                        }
                        idPrefix="direct"
                    />

                    <InputError message={errors.permissions} />
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        disabled={processing}
                        data-test="save-user-access-button"
                    >
                        Save changes
                    </Button>

                    <Button variant="ghost" asChild>
                        <Link href={index()}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index(),
        },
    ],
};
