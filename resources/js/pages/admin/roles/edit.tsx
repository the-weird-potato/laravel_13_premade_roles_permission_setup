import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PermissionPicker from '@/components/permission-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, update } from '@/routes/admin/roles';
import type { PermissionGroup, RoleSummary } from '@/types';

export default function EditRole({
    role,
    permissionGroups,
}: {
    role: RoleSummary;
    permissionGroups: PermissionGroup[];
}) {
    const { data, setData, put, processing, errors } = useForm<{
        name: string;
        permissions: string[];
    }>({
        name: role.name,
        permissions: role.permissions,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put(update(role.id).url);
    };

    return (
        <>
            <Head title={`Edit ${role.name}`} />

            <form onSubmit={submit} className="space-y-6">
                <Heading
                    variant="small"
                    title={`Edit ${role.name}`}
                    description={`Held by ${role.users_count} user${
                        role.users_count === 1 ? '' : 's'
                    }`}
                />

                <div className="grid max-w-md gap-2">
                    <Label htmlFor="name">Name</Label>

                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        required
                    />

                    <InputError message={errors.name} />
                </div>

                <div className="space-y-3">
                    <Label>Permissions</Label>

                    <PermissionPicker
                        groups={permissionGroups}
                        selected={data.permissions}
                        onChange={(permissions) =>
                            setData('permissions', permissions)
                        }
                    />

                    <InputError message={errors.permissions} />
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing} data-test="save-role-button">
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

EditRole.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: index(),
        },
    ],
};
