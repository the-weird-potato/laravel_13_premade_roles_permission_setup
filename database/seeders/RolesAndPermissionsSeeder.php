<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * The registrar cache is flushed by hand between each stage because seeders
     * are frequently run with model events muted, which is what normally keeps
     * the cache in step with the database.
     */
    public function run(): void
    {
        $registrar = app(PermissionRegistrar::class);

        $registrar->forgetCachedPermissions();

        foreach (Permission::names() as $name) {
            Permission::findOrCreate($name, 'web');
        }

        $this->pruneStalePermissions();

        $registrar->forgetCachedPermissions();

        foreach (Role::catalog() as $name => $permissions) {
            Role::findOrCreate($name, 'web')->syncPermissions($permissions);
        }

        $registrar->forgetCachedPermissions();
    }

    /**
     * Delete permissions the application no longer declares.
     *
     * The catalog is authoritative, so a row with no matching constant is one
     * no code can ever check. Removing it also detaches it from every role and
     * user that still referenced it.
     */
    protected function pruneStalePermissions(): void
    {
        Permission::query()
            ->whereNotIn('name', Permission::names())
            ->get()
            ->each(fn (Permission $permission) => $permission->delete());
    }
}
