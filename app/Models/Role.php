<?php

namespace App\Models;

use Database\Factories\RoleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read int|null $users_count
 */
class Role extends SpatieRole
{
    /** @use HasFactory<RoleFactory> */
    use HasFactory;

    public const Admin = 'admin';

    public const User = 'user';

    /**
     * Get the roles the application ships with, mapped to their permissions.
     *
     * @return array<string, array<int, string>>
     */
    public static function catalog(): array
    {
        return [
            self::Admin => Permission::names(),
            self::User => [],
        ];
    }

    /**
     * Determine whether the role is protected from being edited or deleted.
     *
     * The administrator role is the only way into the admin area, so renaming
     * or removing it would lock the application out of itself. Custom roles
     * created through the admin UI carry no such restriction.
     */
    public function isLocked(): bool
    {
        return $this->name === self::Admin;
    }
}
