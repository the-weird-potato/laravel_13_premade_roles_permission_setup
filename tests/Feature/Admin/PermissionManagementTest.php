<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('users without the administrator role are forbidden', function () {
    $user = User::factory()->create()->assignRole(Role::User);

    $this->actingAs($user)
        ->get(route('admin.permissions.index'))
        ->assertForbidden();
});

test('an administrator can list permissions', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);

    $this->actingAs($admin)
        ->get(route('admin.permissions.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/permissions/index')
            ->has('permissions', count(Permission::names())),
        );
});

test('revoking permissions.view from the administrator role blocks the screen', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    Role::findByName(Role::Admin)->revokePermissionTo(Permission::ViewPermissions);

    $this->actingAs($admin)
        ->get(route('admin.permissions.index'))
        ->assertForbidden();
});

test('permissions cannot be created or deleted over http', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $permission = Permission::findByName(Permission::ViewUsers);

    $this->actingAs($admin)
        ->post('/admin/permissions', ['name' => 'posts.publish'])
        ->assertMethodNotAllowed();

    $this->actingAs($admin)
        ->delete('/admin/permissions/'.$permission->id)
        ->assertNotFound();

    expect(Permission::query()->where('name', 'posts.publish')->exists())->toBeFalse()
        ->and(Permission::query()->where('name', Permission::ViewUsers)->exists())->toBeTrue();
});

test('the seeder prunes permissions the catalog no longer declares', function () {
    Permission::create(['name' => 'posts.publish', 'guard_name' => 'web']);
    Role::findByName(Role::Admin)->givePermissionTo('posts.publish');

    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Permission::query()->where('name', 'posts.publish')->exists())->toBeFalse()
        ->and(Permission::query()->pluck('name')->all())
        ->toEqualCanonicalizing(Permission::names());
});

test('pruning detaches the permission from the roles holding it', function () {
    Permission::create(['name' => 'posts.publish', 'guard_name' => 'web']);
    $role = Role::create(['name' => 'support', 'guard_name' => 'web']);
    $role->givePermissionTo('posts.publish');

    expect($role->fresh()->permissions)->toHaveCount(1);

    $this->seed(RolesAndPermissionsSeeder::class);

    expect($role->fresh()->permissions)->toHaveCount(0);
});

test('an orphaned permission is flagged on the screen', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    Permission::create(['name' => 'posts.publish', 'guard_name' => 'web']);

    $response = $this->actingAs($admin)
        ->get(route('admin.permissions.index'))
        ->assertOk();

    $permissions = collect($response->viewData('page')['props']['permissions']);

    expect($permissions->firstWhere('name', 'posts.publish')['is_orphaned'])->toBeTrue()
        ->and($permissions->firstWhere('name', Permission::ViewUsers)['is_orphaned'])->toBeFalse();
});
