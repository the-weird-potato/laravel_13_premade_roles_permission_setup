<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('guests are redirected to login', function () {
    $this->get(route('admin.roles.index'))->assertRedirect(route('login'));
});

test('users without the administrator role are forbidden', function () {
    $user = User::factory()->create()->assignRole(Role::User);

    $this->actingAs($user)
        ->get(route('admin.roles.index'))
        ->assertForbidden();
});

test('holding a permission without the administrator role is not enough', function () {
    $support = Role::create(['name' => 'support', 'guard_name' => 'web']);
    $support->givePermissionTo(Permission::ViewRoles);

    $user = User::factory()->create()->assignRole('support');

    $this->actingAs($user)
        ->get(route('admin.roles.index'))
        ->assertForbidden();
});

test('an administrator sees the role list', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);

    $this->actingAs($admin)
        ->get(route('admin.roles.index'))
        ->assertOk();
});

test('an administrator can create a role with permissions', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);

    $this->actingAs($admin)
        ->post(route('admin.roles.store'), [
            'name' => 'content-manager',
            'permissions' => [Permission::ViewUsers, Permission::ViewRoles],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.roles.index'));

    $role = Role::findByName('content-manager');

    expect($role->permissions->pluck('name')->all())
        ->toEqualCanonicalizing([Permission::ViewUsers, Permission::ViewRoles]);
});

test('a role name must be unique and correctly formatted', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);

    $this->actingAs($admin)
        ->from(route('admin.roles.create'))
        ->post(route('admin.roles.store'), ['name' => Role::Admin])
        ->assertSessionHasErrors('name');

    $this->actingAs($admin)
        ->from(route('admin.roles.create'))
        ->post(route('admin.roles.store'), ['name' => 'Content Manager'])
        ->assertSessionHasErrors('name');
});

test('unknown permissions are rejected', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);

    $this->actingAs($admin)
        ->from(route('admin.roles.create'))
        ->post(route('admin.roles.store'), [
            'name' => 'content-manager',
            'permissions' => ['does.not-exist'],
        ])
        ->assertSessionHasErrors('permissions.0');
});

test('an administrator can update a role and its permissions', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $role = Role::create(['name' => 'content-manager', 'guard_name' => 'web']);
    $role->givePermissionTo(Permission::ViewUsers);

    $this->actingAs($admin)
        ->put(route('admin.roles.update', $role), [
            'name' => 'content-editor',
            'permissions' => [Permission::ViewRoles],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.roles.index'));

    $role->refresh();

    expect($role->name)->toBe('content-editor')
        ->and($role->permissions->pluck('name')->all())->toBe([Permission::ViewRoles]);
});

test('an administrator can delete a role', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $role = Role::create(['name' => 'content-manager', 'guard_name' => 'web']);

    $this->actingAs($admin)
        ->delete(route('admin.roles.destroy', $role))
        ->assertRedirect(route('admin.roles.index'));

    expect(Role::query()->where('name', 'content-manager')->exists())->toBeFalse();
});

test('the administrator role cannot be edited or deleted', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $role = Role::findByName(Role::Admin);

    $this->actingAs($admin)
        ->get(route('admin.roles.edit', $role))
        ->assertForbidden();

    $this->actingAs($admin)
        ->put(route('admin.roles.update', $role), ['name' => 'renamed'])
        ->assertForbidden();

    $this->actingAs($admin)
        ->delete(route('admin.roles.destroy', $role))
        ->assertForbidden();

    expect(Role::query()->where('name', Role::Admin)->exists())->toBeTrue();
});

test('the user role is not locked', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $role = Role::findByName(Role::User);

    $this->actingAs($admin)
        ->get(route('admin.roles.edit', $role))
        ->assertOk();
});

test('revoking roles.create from the administrator role blocks creating roles', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    Role::findByName(Role::Admin)->revokePermissionTo(Permission::CreateRoles);

    $this->actingAs($admin)
        ->post(route('admin.roles.store'), ['name' => 'content-manager'])
        ->assertForbidden();

    expect(Role::query()->where('name', 'content-manager')->exists())->toBeFalse();
});

test('revoking roles.delete from the administrator role blocks deleting roles', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $role = Role::create(['name' => 'content-manager', 'guard_name' => 'web']);
    Role::findByName(Role::Admin)->revokePermissionTo(Permission::DeleteRoles);

    $this->actingAs($admin)
        ->delete(route('admin.roles.destroy', $role))
        ->assertForbidden();

    expect(Role::query()->where('name', 'content-manager')->exists())->toBeTrue();
});
