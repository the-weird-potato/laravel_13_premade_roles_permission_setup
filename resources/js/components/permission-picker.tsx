import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { PermissionGroup } from '@/types';

export default function PermissionPicker({
    groups,
    selected,
    onChange,
    idPrefix = 'permission',
}: {
    groups: PermissionGroup[];
    selected: string[];
    onChange: (permissions: string[]) => void;
    idPrefix?: string;
}) {
    const toggle = (permission: string, checked: boolean) => {
        onChange(
            checked
                ? [...new Set([...selected, permission])]
                : selected.filter((name) => name !== permission),
        );
    };

    const toggleGroup = (group: PermissionGroup, checked: boolean) => {
        onChange(
            checked
                ? [...new Set([...selected, ...group.permissions])]
                : selected.filter((name) => !group.permissions.includes(name)),
        );
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
                const allChecked = group.permissions.every((permission) =>
                    selected.includes(permission),
                );

                return (
                    <div
                        key={group.group}
                        className="space-y-3 rounded-lg border p-4"
                    >
                        <div className="flex items-center gap-2 border-b pb-2">
                            <Checkbox
                                id={`${idPrefix}-group-${group.group}`}
                                checked={allChecked}
                                onCheckedChange={(checked) =>
                                    toggleGroup(group, checked === true)
                                }
                            />
                            <Label
                                htmlFor={`${idPrefix}-group-${group.group}`}
                                className="text-sm font-medium"
                            >
                                {group.group}
                            </Label>
                        </div>

                        <div className="space-y-2">
                            {group.permissions.map((permission) => (
                                <div
                                    key={permission}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox
                                        id={`${idPrefix}-${permission}`}
                                        checked={selected.includes(permission)}
                                        onCheckedChange={(checked) =>
                                            toggle(permission, checked === true)
                                        }
                                    />
                                    <Label
                                        htmlFor={`${idPrefix}-${permission}`}
                                        className="font-normal text-muted-foreground"
                                    >
                                        {permission}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
