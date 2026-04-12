# Privacy Cure Compliance

A multi-tenant compliance management platform built with Laravel 12 and React 19. Designed for organizations to manage regulatory compliance frameworks (GDPR, HIPAA, etc.), employee training, evidence collection, and audit trails.

## Tech Stack

- **Backend:** Laravel 12 (PHP 8.2+), Eloquent ORM, Spatie Permission
- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Radix UI
- **Bridge:** Inertia.js (SSR-style SPA without a REST API)
- **Build:** Vite 6
- **Database:** SQLite (dev), MySQL/PostgreSQL (production)
- **Testing:** PHPUnit

## Prerequisites

- PHP 8.2+
- Composer 2.x
- Node.js 22+ with npm
- SQLite (or MySQL/PostgreSQL for production)

## Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd cure_comply

# Install dependencies
composer install
npm ci

# Environment setup
cp .env.example .env
php artisan key:generate

# Database setup
touch database/database.sqlite
php artisan migrate --seed

# Start development server
composer dev
```

This runs the PHP server, queue worker, and Vite dev server concurrently.

The bundled worker listens to both the `mail` and `default` queues:

```bash
php artisan queue:listen --queue=mail,default --tries=1
```

This matters for invitation emails and other queued mail notifications, because they are dispatched onto the `mail` queue.

## Project Structure

```
app/
  Enums/              # Status enums (UserStatus, CourseStatus, etc.)
  Http/
    Controllers/      # Request handling, returns Inertia responses
    Middleware/        # Tenant resolution, auth, impersonation audit
    Requests/         # Form request validation classes
  Models/
    Concerns/         # BelongsToTenant trait (multi-tenancy scope)
  Policies/           # Authorization policies per resource
  Services/           # Business logic (scoring, evidence storage, etc.)
  Support/            # Permissions constants
config/               # Laravel configuration files
database/
  factories/          # Model factories for testing
  migrations/         # Database schema definitions
  seeders/            # Seed data
resources/
  js/
    components/       # Reusable React components
    hooks/            # Custom React hooks
    layouts/          # Page layouts (app, auth, platform)
    pages/            # Inertia page components (one per route)
    types/            # TypeScript type definitions
  css/                # Tailwind CSS entry point
routes/
  web.php             # Main application routes
  auth.php            # Authentication routes
  settings.php        # User settings routes
tests/
  Feature/            # Integration tests
  Unit/               # Unit tests
```

## Key Modules

### Multi-Tenancy
All tenant-scoped models use the `BelongsToTenant` trait, which applies a global scope filtering by `tenant_id`. Super admins bypass this scope. Tenant resolution happens via the `ResolveCurrentTenant` middleware.

### Compliance Framework
- **Frameworks** contain **Sections**, which contain **Questions** (weighted)
- **Submissions** track a tenant's responses to a framework
- **Scoring** uses weighted averages: question scores roll up to section scores, then to an overall score
- Ratings: Green (80+), Amber (50-79), Red (<50)
- Questions can require evidence uploads; missing evidence caps the score

### Evidence Management
- Files uploaded to the `private` disk with UUID-prefixed filenames
- Supports PDF, Word, Excel, CSV, and image formats
- Evidence goes through a review workflow (pending -> approved/rejected)
- Rejected evidence impacts compliance scores

### Training & Courses
- Courses contain modules and lessons
- Courses are assigned to employees with due dates
- Tests with multiple question types and configurable pass marks
- Test attempts are tracked with scoring

### Roles & Permissions
Uses Spatie Permission with 18 granular permissions. Key roles:
- **super_admin** — platform-wide access, can impersonate users
- **company_admin** — tenant-level management
- **reviewer** — evidence review capability
- **employee** — training completion, compliance responses

## Running Tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage
```

## Code Quality

```bash
# PHP formatting (Laravel Pint)
vendor/bin/pint

# Frontend linting
npm run lint

# Frontend formatting
npm run format
```

## Architecture Decisions

- **Inertia.js over REST API:** Single codebase, no API versioning overhead, automatic type sharing between backend and frontend.
- **Service layer for business logic:** Controllers stay thin; complex operations like compliance scoring live in dedicated services.
- **Policy-based authorization:** Every resource has an authorization policy. Policies check tenant boundaries via `sameTenant()`.
- **Soft deletes on core models:** Preserves audit trail for compliance history. Hard-deleted records would break regulatory reporting.
- **Rate limiting:** Auth endpoints throttled at 5/min per email+IP. Evidence uploads at 10/min. General API at 60/min.

## Environment Variables

See `.env.example` for all available configuration. Key variables:

| Variable | Description |
|---|---|
| `DB_CONNECTION` | Database driver (sqlite, mysql, pgsql) |
| `QUEUE_CONNECTION` | Queue backend (database, redis, sync) |
| `SESSION_DRIVER` | Session storage (database, cookie, redis) |
| `MAIL_MAILER` | Mail driver (smtp, log, ses) |
| `BCRYPT_ROUNDS` | Password hashing cost (default: 12) |

## License

Proprietary. All rights reserved.
