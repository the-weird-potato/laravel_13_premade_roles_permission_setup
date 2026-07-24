# Laravel 13 — Roles & Permission Setup

A Laravel 13 + React (Inertia v3) starter kit, intended as the base for a pre-made roles &
permissions setup.

**Current state:** this is the stock Laravel React starter kit with Fortify authentication
(login, registration, email verification, password reset, 2FA, passkeys) and settings pages.
No roles/permissions package is installed yet.

## Stack

| Layer    | Tech                                                              |
| -------- | ----------------------------------------------------------------- |
| Backend  | PHP 8.3+, Laravel 13, Fortify (auth), Wayfinder (typed routes)     |
| Frontend | React 19, Inertia.js v3, TypeScript, Tailwind CSS v4, Radix/shadcn |
| Tooling  | Vite 8, Pest 4, Pint, Larastan (PHPStan), ESLint, Prettier         |

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

### Optional: seed a test user

```bash
php artisan db:seed
```

Creates `test@example.com` with the factory's default password (`password`).

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
  Http/Controllers/    Controllers (settings: profile, security)
  Http/Middleware/     Inertia request handling, appearance (dark mode)
  Models/              Eloquent models
  Providers/           App + Fortify service providers
database/
  factories/           Model factories
  migrations/          Schema migrations (users, cache, jobs, passkeys, 2FA)
  seeders/             DatabaseSeeder
resources/js/
  pages/               Inertia page components (routed server-side)
  components/          Reusable React components
  layouts/             Page layouts
routes/
  web.php              Public + dashboard routes
  settings.php         Settings routes
  console.php          Scheduled/console commands
tests/
  Feature/             Feature tests (auth, settings, dashboard)
  Unit/                Unit tests
```

## Notes

- **Wayfinder** generates typed route helpers into `resources/js/actions` and `resources/js/routes`
  during the Vite build. Import from `@/actions/...` or `@/routes/...` instead of hardcoding URLs.
  Regenerate manually with `php artisan wayfinder:generate`.
- **Auth routes** are registered by Fortify, not defined in `routes/`. Run `php artisan route:list`
  to see them.
- **Mail** defaults to the `log` driver, so verification and password-reset emails land in
  `storage/logs/laravel.log`.

## Adding roles & permissions

Nothing is wired up yet. The usual next step is installing a permissions package:

```bash
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

Then add `HasRoles` to `App\Models\User`, seed roles/permissions in `DatabaseSeeder`, and guard
routes with the `role:` / `permission:` middleware.
