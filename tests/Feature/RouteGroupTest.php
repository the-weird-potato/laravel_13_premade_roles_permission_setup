<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('the admin group is reachable by administrators only', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create()->assignRole(Role::User);

    $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk();
    $this->actingAs($user)->get(route('admin.dashboard'))->assertForbidden();
});

test('the user group is reachable by standard users only', function () {
    $admin = User::factory()->create()->assignRole(Role::Admin);
    $user = User::factory()->create()->assignRole(Role::User);

    $this->actingAs($user)->get(route('user.dashboard'))->assertOk();
    $this->actingAs($admin)->get(route('user.dashboard'))->assertForbidden();
});

test('both groups redirect guests to login', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    $this->get(route('user.dashboard'))->assertRedirect(route('login'));
});

/*
 * Both groups carry the `verified` middleware, but App\Models\User does not
 * implement MustVerifyEmail, so EnsureEmailIsVerified passes everyone through —
 * exactly as it already does on the `dashboard` route. This test pins that
 * behaviour so enabling MustVerifyEmail surfaces here rather than silently
 * changing who can reach these routes.
 */
test('unverified users are not currently blocked by the verified middleware', function () {
    $admin = User::factory()->unverified()->create()->assignRole(Role::Admin);
    $user = User::factory()->unverified()->create()->assignRole(Role::User);

    $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk();
    $this->actingAs($user)->get(route('user.dashboard'))->assertOk();
});

test('a user holding neither role reaches neither group', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.dashboard'))->assertForbidden();
    $this->actingAs($user)->get(route('user.dashboard'))->assertForbidden();
});
