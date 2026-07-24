<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    /**
     * Display the permissions the application defines.
     *
     * Permissions are declared in code and seeded from Permission::catalog(),
     * so this screen is a read-only reference. Grant them by attaching them to
     * a role, or directly to a user, from the other admin screens.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', Permission::class);

        return Inertia::render('admin/permissions/index', [
            'permissions' => Permission::query()
                ->with('roles:id,name')
                ->orderBy('name')
                ->get()
                ->map(fn (Permission $permission): array => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'group' => Permission::groupFor($permission->name),
                    'roles' => $permission->roles->pluck('name')->all(),
                    'is_orphaned' => ! in_array($permission->name, Permission::names(), true),
                ]),
        ]);
    }
}
