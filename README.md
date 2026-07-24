# Laravel 13 — Roles & Permission Setup

A Laravel 13 + React (Inertia v3) starter kit with a pre-made roles & permissions setup.

**Current state:** the stock Laravel React starter kit with Fortify authentication (login,
registration, email verification, password reset, 2FA, passkeys) and settings pages, plus a
complete roles & permissions layer built on `spatie/laravel-permission` — seeded roles and
permissions, policies, route middleware, permission-aware React helpers, and an admin UI for
managing roles, permissions and user access.

## Stack

| Layer    | Tech                                                                        |
| -------- | --------------------------------------------------------------------------- |
| Backend  | PHP 8.3+, Laravel 13, Fortify (auth), Wayfinder (typed routes), Spatie perms |
| Frontend | React 19, Inertia.js v3, TypeScript, Tailwind CSS v4, Radix/shadcn           |
| Tooling  | Vite 8, Pest 4, Pint, Larastan (PHPStan), ESLint, Prettier                   |

## Requirements

- PHP **8.3+** (8.4 recommended) with the usual Laravel extensions
- Composer 2
- Node.js **20+** and npm
- MySQL 8 (default), or SQLite if you prefer

## Quick start

```bash
git clone <repo-url> laravel_13_premade_roles_permission_setup
cd laravel_13_premade_roles_permission_setup

composer setup
```

`composer setup` runs `composer install`, copies `.env.example` → `.env`, generates the app key,
runs migrations, then `npm install` and `npm run build`.

Create the database first (or switch to SQLite — see below), otherwise the migrate step fails.

### Manual setup

If you'd rather run the steps yourself:

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate

# create the `laravel` database in MySQL first
php artisan migrate

npm run build
```

### Seed roles, permissions and test users

```bash
php artisan db:seed
```

This creates every role and permission, then two accounts that share the factory's default
password (`password`):

| Email                | Role    |
| -------------------- | ------- |
| `admin@example.com`  | `admin` |
| `test@example.com`   | `user`  |

To (re-)seed only the roles and permissions, without touching users:

```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

The seeder is idempotent, so it is safe to re-run after changing the catalog. Note that it also
**deletes** permissions the catalog no longer declares, so the database mirrors the code.

## Database configuration

The default `.env.example` points at MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

To use SQLite instead, replace those lines with:

```env
DB_CONNECTION=sqlite
```

then create the file and migrate:

```bash
touch database/database.sqlite
php artisan migrate
```

Sessions, cache, and queues all use the `database` driver by default, so their tables come from
the initial migrations — no extra services needed.

## Running the app

```bash
composer dev
```

This runs `php artisan dev`, which starts the PHP server, queue worker, log viewer (Pail), and
Vite dev server together. The app is served at http://localhost:8000.

To run pieces separately:

```bash
php artisan serve      # http://localhost:8000
npm run dev            # Vite dev server + HMR
php artisan queue:work
php artisan pail       # tail logs
```

If a frontend change doesn't show up, make sure `npm run dev` is running or run `npm run build`.

## Testing

```bash
php artisan test --compact                 # all tests
php artisan test --compact --filter=Auth   # filter by name
composer test                              # lint + static analysis + tests
```

Tests run against an in-memory SQLite database (configured in `phpunit.xml`), so they don't touch
your local MySQL data.

## Code quality

```bash
composer lint          # Pint — fix PHP formatting
composer lint:check    # Pint — check only
composer types:check   # Larastan / PHPStan
npm run lint           # ESLint — fix
npm run format         # Prettier — write
npm run types:check    # tsc --noEmit
composer ci:check      # everything CI runs
```

## Project layout

```
app/
  Actions/Fortify/     Fortify action classes (user creation, password reset)
  Concerns/            Shared validation rule traits
  Http/Controllers/    Controllers (settings: profile, security; admin: roles, permissions, users)
  Http/Middleware/     Inertia request handling, appearance (dark mode)
  Http/Requests/       Form requests (settings, admin)
  Models/              Eloquent models (User, Role, Permission)
  Policies/            Role, Permission and User policies
  Providers/           App + Fortify service providers
database/
  factories/           Model factories
  migrations/          Schema migrations (users, cache, jobs, passkeys, 2FA, permission tables)
  seeders/             DatabaseSeeder, RolesAndPermissionsSeeder
resources/js/
  pages/               Inertia page components (routed server-side), incl. pages/admin/, pages/user/
  components/          Reusable React components (incl. can.tsx, permission-picker.tsx)
  hooks/               React hooks (incl. use-permissions.ts)
  layouts/             Page layouts (app, auth, settings, admin)
  lib/permissions.ts   Permission/role name constants mirroring the PHP catalog
routes/
  web.php              Public + dashboard routes, plus the admin and user role groups
  settings.php         Settings routes
  console.php          Scheduled/console commands
tests/
  Feature/             Feature tests (auth, settings, dashboard, access control, admin)
  Unit/                Unit tests
```

## Notes

- **Wayfinder** generates typed route helpers into `resources/js/actions` and `resources/js/routes`
  during the Vite build. Import from `@/actions/...` or `@/routes/...` instead of hardcoding URLs.
  Regenerate manually with `php artisan wayfinder:generate --with-form` — the `--with-form` flag
  matches the `formVariants: true` option the Vite plugin uses in `vite.config.ts`, and omitting it
  drops the `.form()` helpers that pages such as `pages/auth/login.tsx` rely on.
- **Auth routes** are registered by Fortify, not defined in `routes/`. Run `php artisan route:list`
  to see them.
- **Mail** defaults to the `log` driver, so verification and password-reset emails land in
  `storage/logs/laravel.log`.

## Roles & permissions

Built on [`spatie/laravel-permission`](https://spatie.be/docs/laravel-permission). `App\Models\Role`
and `App\Models\Permission` extend the package models (wired up in `config/permission.php`) so the
catalog of names lives in the app rather than in a migration.

### The catalog

`Permission::catalog()` groups every permission the app ships with; `Role::catalog()` maps each
role to the permissions it grants.

Permissions are **defined in code, not created at runtime**. A permission only does anything
because the application checks for it, so inventing one through a UI would produce a row no
`can()` call ever consults. The catalog is therefore the single source of truth: the seeder
creates the permissions it declares and deletes any that it does not, detaching them from every
role and user on the way out. The admin screen for permissions is read-only, and flags any row it
finds that the catalog no longer declares.

Roles work the other way round — they are just bundles of existing permissions, so composing them
at runtime is safe and fully supported in the admin UI.

| Role    | Grants                            |
| ------- | --------------------------------- |
| `admin` | every permission in the catalog   |
| `user`  | nothing                           |

Add a permission by adding a constant plus a `catalog()` entry on `App\Models\Permission`, then
re-running `php artisan db:seed --class=RolesAndPermissionsSeeder`. Because `admin` maps to
`Permission::names()`, new permissions are granted to administrators automatically.

The `admin` role is locked — the admin UI refuses to rename or delete it, since it is the only way
into the admin area and removing it would lock the application out of itself. Roles you create
yourself carry no such restriction. Individual permissions *can* still be revoked from the `admin`
role, and the policies honour that immediately.

### Route groups

`routes/web.php` defines two role-guarded groups:

| Group   | Prefix   | Middleware                            | Route names |
| ------- | -------- | ------------------------------------- | ----------- |
| Admin   | `/admin` | `auth`, `verified`, `role:admin`      | `admin.*`   |
| User    | `/user`  | `auth`, `verified`, `role:user`       | `user.*`    |

The role check is the outer boundary; each admin action is still authorized individually against
its policy. Note that the two are mutually exclusive as written — an administrator does not hold
the `user` role, so `/user/*` is closed to them. Assign both roles, or swap the guard for
`role_or_permission:`, if you want overlap.

If you would rather gate the admin area on permissions than on the role itself — so custom roles
can reach parts of it — replace `role:admin` with `permission:` or `role_or_permission:` on the
group; the policies underneath already work that way.

### Checking access on the backend

```php
$user->hasRole(Role::Admin);
$user->can(Permission::UpdateUsers);

Gate::authorize('update', $role);                    // via App\Policies\*
Route::middleware('role:'.Role::Admin)->group(...);  // aliases registered in bootstrap/app.php
Route::middleware('permission:'.Permission::DeleteUsers)->group(...);
```

### Checking access on the frontend

Roles and permissions are shared on every Inertia response as `auth.roles` and `auth.permissions`.

```tsx
import Can from '@/components/can';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/lib/permissions';

const { can, hasRole, canAny } = usePermissions();

<Can permission={PERMISSIONS.deleteUsers}>
    <DeleteButton />
</Can>;
```

These only control what is *rendered* — every route is independently guarded by a policy or
middleware on the server.

### Admin UI

Available at `/admin/roles`, `/admin/permissions` and `/admin/users`, reached from the "Access
control" sidebar entry (shown to administrators holding at least one of the relevant view
permissions) or from the `/admin/dashboard` landing page:

- **Roles** — create, edit and delete roles, and pick their permissions.
- **Permissions** — read-only reference of every permission the application defines and the roles
  holding it. Add one by declaring it in `Permission::catalog()` and re-running the seeder.
- **Users** — search users, assign roles, and grant direct permissions on top of them. You cannot
  edit or delete your own account from here.
