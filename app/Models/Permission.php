<?php

namespace App\Models;

use Database\Factories\PermissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;
use Spatie\Permission\Models\Permission as SpatiePermission;

/**
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Permission extends SpatiePermission
{
    /** @use HasFactory<PermissionFactory> */
    use HasFactory;

    public const ViewUsers = 'users.view';

    public const CreateUsers = 'users.create';

    public const UpdateUsers = 'users.update';

    public const DeleteUsers = 'users.delete';

    public const ViewRoles = 'roles.view';

    public const CreateRoles = 'roles.create';

    public const UpdateRoles = 'roles.update';

    public const DeleteRoles = 'roles.delete';

    public const ViewPermissions = 'permissions.view';

    /**
     * Get every permission the application ships with, grouped by subject.
     *
     * This list is the single source of truth. A permission only has meaning
     * because application code checks for it, so permissions are declared here
     * and pushed to the database by the seeder — never created at runtime.
     *
     * @return array<string, array<int, string>>
     */
    public static function catalog(): array
    {
        return [
            'Users' => [
                self::ViewUsers,
                self::CreateUsers,
                self::UpdateUsers,
                self::DeleteUsers,
            ],
            'Roles' => [
                self::ViewRoles,
                self::CreateRoles,
                self::UpdateRoles,
                self::DeleteRoles,
            ],
            'Permissions' => [
                self::ViewPermissions,
            ],
        ];
    }

    /**
     * Get a flat list of every permission name the application ships with.
     *
     * @return array<int, string>
     */
    public static function names(): array
    {
        return array_merge(...array_values(self::catalog()));
    }

    /**
     * Get the subject a permission name belongs to.
     */
    public static function groupFor(string $name): string
    {
        foreach (self::catalog() as $group => $names) {
            if (in_array($name, $names, true)) {
                return $group;
            }
        }

        return 'Other';
    }
}
