<?php

use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Models\Role;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

/*
 * Administrator area. The role gate is the outer boundary; each action is still
 * authorized individually against its policy, so revoking a single permission
 * from the admin role takes effect without touching these definitions.
 */
Route::middleware(['auth', 'verified', 'role:'.Role::Admin])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');

        Route::resource('roles', RoleController::class)->except(['show']);

        Route::resource('permissions', PermissionController::class)
            ->only(['index']);

        Route::resource('users', UserController::class)
            ->only(['index', 'edit', 'update', 'destroy']);
    });

/*
 * Standard user area, reachable by anyone holding the user role.
 */
Route::middleware(['auth', 'verified', 'role:'.Role::User])
    ->prefix('user')
    ->name('user.')
    ->group(function () {
        Route::inertia('dashboard', 'user/dashboard')->name('dashboard');
    });

require __DIR__.'/settings.php';
