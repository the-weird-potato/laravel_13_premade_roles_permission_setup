<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoleStoreRequest;
use App\Http\Requests\Admin\RoleUpdateRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', Role::class);

        return Inertia::render('admin/roles/index', [
            'roles' => Role::query()
                ->with('permissions:id,name')
                ->withCount('users')
                ->orderBy('name')
                ->get()
                ->map(fn (Role $role): array => $this->toArray($role)),
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        Gate::authorize('create', Role::class);

        return Inertia::render('admin/roles/create', [
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(RoleStoreRequest $request): RedirectResponse
    {
        Gate::authorize('create', Role::class);

        $role = Role::create([
            'name' => $request->string('name')->value(),
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($request->array('permissions'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role created.')]);

        return to_route('admin.roles.index');
    }

    /**
     * Show the form for editing the given role.
     */
    public function edit(Role $role): Response
    {
        Gate::authorize('update', $role);

        abort_if($role->isLocked(), 403, __('The :role role cannot be modified.', ['role' => $role->name]));

        return Inertia::render('admin/roles/edit', [
            'role' => $this->toArray($role->loadCount('users')->load('permissions:id,name')),
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Update the given role.
     */
    public function update(RoleUpdateRequest $request, Role $role): RedirectResponse
    {
        Gate::authorize('update', $role);

        abort_if($role->isLocked(), 403, __('The :role role cannot be modified.', ['role' => $role->name]));

        $role->update(['name' => $request->string('name')->value()]);

        $role->syncPermissions($request->array('permissions'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role updated.')]);

        return to_route('admin.roles.index');
    }

    /**
     * Remove the given role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        Gate::authorize('delete', $role);

        abort_if($role->isLocked(), 403, __('The :role role cannot be deleted.', ['role' => $role->name]));

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role deleted.')]);

        return to_route('admin.roles.index');
    }

    /**
     * Transform a role into the shape expected by the frontend.
     *
     * @return array{id: int, name: string, users_count: int, is_locked: bool, permissions: array<int, string>}
     */
    protected function toArray(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'users_count' => (int) $role->users_count,
            'is_locked' => $role->isLocked(),
            'permissions' => $role->permissions->pluck('name')->all(),
        ];
    }

    /**
     * Get every persisted permission grouped by subject.
     *
     * @return array<int, array{group: string, permissions: array<int, string>}>
     */
    protected function permissionGroups(): array
    {
        return Permission::query()
            ->orderBy('name')
            ->pluck('name')
            ->groupBy(fn (string $name): string => Permission::groupFor($name))
            ->map(fn ($names, string $group): array => [
                'group' => $group,
                'permissions' => $names->values()->all(),
            ])
            ->values()
            ->all();
    }
}
