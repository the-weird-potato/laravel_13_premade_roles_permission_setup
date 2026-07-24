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
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

test('an administrator can list users', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    User::factory()->create(['name' => 'Ada Lovelace']);

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 2),
        );
});

test('the user list can be searched', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    User::factory()->create(['name' => 'Ada Lovelace']);
    User::factory()->create(['name' => 'Grace Hopper']);

    $this->actingAs($admin)
        ->get(route('admin.users.index', ['search' => 'Ada']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Ada Lovelace'),
        );
});

test('an administrator can assign roles to a user', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'roles' => [Role::User],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users.index'));

    expect($user->refresh()->hasRole(Role::User))->toBeTrue();
});

test('an administrator can grant direct permissions to a user', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'roles' => [Role::User],
            'permissions' => [Permission::ViewUsers],
        ])
        ->assertSessionHasNoErrors();

    $user->refresh();

    expect($user->can(Permission::ViewUsers))->toBeTrue()
        ->and($user->getDirectPermissions()->pluck('name')->all())->toBe([Permission::ViewUsers]);
});

test('syncing roles removes the roles that were not submitted', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    Role::create(['name' => 'support', 'guard_name' => 'web']);
    $user = User::factory()->create()->assignRole(['support', Role::User]);

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), ['roles' => [Role::User]])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->getRoleNames()->all())->toBe([Role::User]);
});

test('unknown roles are rejected', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->from(route('admin.users.edit', $user))
        ->put(route('admin.users.update', $user), ['roles' => ['ghost']])
        ->assertSessionHasErrors('roles.0');
});

test('an administrator cannot manage their own account', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);

    $this->actingAs($admin)
        ->get(route('admin.users.edit', $admin))
        ->assertForbidden();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $admin), ['roles' => []])
        ->assertForbidden();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $admin))
        ->assertForbidden();

    expect($admin->fresh())->not->toBeNull();
});

test('an administrator can delete another user', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $user))
        ->assertRedirect(route('admin.users.index'));

    expect($user->fresh())->toBeNull();
});

test('revoking users.delete from the administrator role blocks deleting users', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create();
    Role::findByName(Role::Admin)->revokePermissionTo(Permission::DeleteUsers);

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $user))
        ->assertForbidden();

    expect($user->fresh())->not->toBeNull();
});
