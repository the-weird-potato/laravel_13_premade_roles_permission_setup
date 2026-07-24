<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRolesUpdateRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users and the roles they hold.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = $request->string('search')->trim()->value();

        $users = User::query()
            ->with('roles:id,name')
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"),
            ))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->all(),
                'is_self' => $request->user()?->is($user) ?? false,
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form for editing the given user's roles and permissions.
     */
    public function edit(Request $request, User $user): Response
    {
        Gate::authorize('update', $user);

        $this->assertNotSelf($request, $user);

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->all(),
                'permissions' => $user->getDirectPermissions()->pluck('name')->all(),
            ],
            'roles' => Role::query()->orderBy('name')->pluck('name')->all(),
            'permissionGroups' => Permission::query()
                ->orderBy('name')
                ->pluck('name')
                ->groupBy(fn (string $name): string => Permission::groupFor($name))
                ->map(fn ($names, string $group): array => [
                    'group' => $group,
                    'permissions' => $names->values()->all(),
                ])
                ->values()
                ->all(),
        ]);
    }

    /**
     * Update the roles and direct permissions held by the given user.
     */
    public function update(UserRolesUpdateRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $this->assertNotSelf($request, $user);

        $user->syncRoles($request->array('roles'));
        $user->syncPermissions($request->array('permissions'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User access updated.')]);

        return to_route('admin.users.index');
    }

    /**
     * Remove the given user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        $this->assertNotSelf($request, $user);

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return to_route('admin.users.index');
    }

    /**
     * Prevent an administrator from changing or removing their own account.
     */
    protected function assertNotSelf(Request $request, User $user): void
    {
        abort_if(
            $request->user()?->is($user) ?? false,
            403,
            __('You cannot manage your own account from here.'),
        );
    }
}
