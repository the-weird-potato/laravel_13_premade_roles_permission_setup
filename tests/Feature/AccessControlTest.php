<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('the seeder creates every role and permission', function () {
    expect(Permission::query()->pluck('name')->all())
        ->toEqualCanonicalizing(Permission::names())
        ->and(Role::query()->pluck('name')->all())
        ->toEqualCanonicalizing([Role::Admin, Role::User]);
});

test('the seeder is idempotent', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Permission::query()->count())->toBe(count(Permission::names()))
        ->and(Role::query()->count())->toBe(count(Role::catalog()));
});

test('the administrator role holds every permission', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);

    expect($admin->permissionNames())->toEqualCanonicalizing(Permission::names())
        ->and($admin->can(Permission::DeleteUsers))->toBeTrue();
});

test('the user role holds no permissions', function () {
    $user = User::factory()->create()->assignRole(Role::User);

    expect($user->permissionNames())->toBe([])
        ->and($user->can(Permission::ViewUsers))->toBeFalse();
});

test('a user without roles holds no permissions', function () {
    $user = User::factory()->create();

    expect($user->permissionNames())->toBe([])
        ->and($user->can(Permission::ViewUsers))->toBeFalse();
});

test('a custom role grants exactly the permissions given to it', function () {
    $support = Role::create(['name' => 'support', 'guard_name' => 'web']);
    $support->givePermissionTo(Permission::ViewUsers);

    $user = User::factory()->create()->assignRole('support');

    expect($user->can(Permission::ViewUsers))->toBeTrue()
        ->and($user->can(Permission::DeleteUsers))->toBeFalse();
});

test('direct permissions stack on top of role permissions', function () {
    $user = User::factory()->create()->assignRole(Role::User);
    $user->givePermissionTo(Permission::ViewUsers);

    expect($user->can(Permission::ViewUsers))->toBeTrue();
});

test('roles and permissions are shared with every inertia page', function () {
    $support = Role::create(['name' => 'support', 'guard_name' => 'web']);
    $support->givePermissionTo(Permission::ViewUsers);

    $user = User::factory()->create()->assignRole('support');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.roles', ['support'])
            ->where('auth.permissions', [Permission::ViewUsers]),
        );
});

test('the shared user does not repeat the role and permission relations', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->missing('auth.user.roles')
            ->missing('auth.user.permissions'),
        );
});

test('guests are shared empty roles and permissions', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.roles', [])
            ->where('auth.permissions', []),
        );
});

test('the role middleware alias guards routes', function () {
    Route::middleware(['web', 'auth', 'role:'.Role::Admin])
        ->get('/test-role-middleware', fn () => 'ok');

    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create()->assignRole(Role::User);

    $this->actingAs($admin)->get('/test-role-middleware')->assertOk();
    $this->actingAs($user)->get('/test-role-middleware')->assertForbidden();
});

test('the permission middleware alias guards routes', function () {
    Route::middleware(['web', 'auth', 'permission:'.Permission::DeleteUsers])
        ->get('/test-permission-middleware', fn () => 'ok');

    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create()->assignRole(Role::User);

    $this->actingAs($admin)->get('/test-permission-middleware')->assertOk();
    $this->actingAs($user)->get('/test-permission-middleware')->assertForbidden();
});
