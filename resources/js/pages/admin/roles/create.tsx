import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PermissionPicker from '@/components/permission-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, index, store } from '@/routes/admin/roles';
import type { PermissionGroup } from '@/types';

export default function CreateRole({
    permissionGroups,
}: {
    permissionGroups: PermissionGroup[];
}) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        permissions: string[];
    }>({
        name: '',
        permissions: [],
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(store().url);
    };

    return (
        <>
            <Head title="New role" />

            <form onSubmit={submit} className="space-y-6">
                <Heading
                    variant="small"
                    title="New role"
                    description="Name the role and pick the permissions it grants"
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
                        placeholder="content-manager"
                        autoFocus
                        required
                    />

                    <p className="text-xs text-muted-foreground">
                        Lowercase letters, numbers and hyphens only.
                    </p>

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
                        Create role
                    </Button>

                    <Button variant="ghost" asChild>
                        <Link href={index()}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </>
    );
}

CreateRole.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: index(),
        },
        {
            title: 'New role',
            href: create(),
        },
    ],
};
