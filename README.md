# Supportdesk — CCS112 IT Helpdesk

React 19 + Vite + React Router frontend with a separate Laravel 13 REST API. Tickets use SQLite locally and managed PostgreSQL on Render.

## Current verification

- Production frontend build passes.
- All 6 Laravel tests pass, with 55 assertions covering authentication, CRUD, validation, API identification, and CORS.
- Browser checks pass for protected routes, invalid/valid login, required fields, create, details, edit status, search, filters, inline deletion, mobile layout, and logout.
- A created ticket remained available after both local servers were fully stopped and restarted.
- Live backend deployment and cloud redeployment verification are still pending.

## Run locally

Dependencies are already installed on this workstation. From the repository directory, start two terminals:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Open **http://127.0.0.1:5173**. Login: **itadmin / helpdesk123**.

The backend runs on port 8017. Vite proxies `/api` to that server. `run-php.mjs` automatically uses the portable PHP 8.4 runtime in the ignored `.tools/php84` folder on this workstation. Elsewhere install PHP 8.4+ and Composer, or set `PHP_BINARY` to your runtime.

For a fresh clone, use Node.js 22.12+ and PHP 8.4+:

```powershell
cd backend
composer install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
cd ..
node run-php.mjs artisan key:generate
if (!(Test-Path backend/database/database.sqlite)) { New-Item backend/database/database.sqlite -ItemType File }
node run-php.mjs artisan migrate
npm --prefix frontend ci --include=dev
```

On this workstation, Composer can use the portable runtime explicitly:
`.tools/php84/php.exe C:/composer/composer.phar install --working-dir=backend`.
Keep an existing environment file and application key when restarting.

## Vercel frontend

The supplied Vercel branch URL is `https://boilerplates-git-main-jyzd.vercel.app`.
The supplied Render service is `srv-db7dnm2vcj2c73d8tr80`, with API base URL
`https://boilerplates-y4tf.onrender.com/api`. The production frontend build includes
this public API endpoint through `frontend/.env.production`; Vercel environment
variables can override it. If `VITE_API_BASE_URL` already exists in Vercel, set it
to this same API URL or remove the old override before redeploying.

Public live verification is pending: the supplied Vercel branch URL redirected
to Vercel authentication, and the Render service timed out during health checks.
Use the public production domain for submission. Vercel deployment protection
can be reviewed under Settings > Deployment Protection.

The frontend is deployed separately from Laravel. For a Vercel project using **Root Directory: frontend**:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Install Command | `npm ci --include=dev` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variable | `VITE_API_BASE_URL=https://boilerplates-y4tf.onrender.com/api` |

`frontend/vercel.json` supplies these build settings and SPA route rewrites. If Vercel uses the repository root instead, the root `vercel.json` installs/builds the frontend and publishes `frontend/dist`.

The `--include=dev` option installs Vite and other build tools even when a production environment would otherwise omit development dependencies. After adding or changing `VITE_API_BASE_URL`, redeploy the frontend. Without a deployed Laravel API and that variable, the hosted site cannot sign in or save tickets.

## Render Laravel API

The root `render.yaml` now creates only the Laravel API and PostgreSQL database, since the frontend is on Vercel. Connect [zuri-sys/boilerplates](https://github.com/zuri-sys/boilerplates) through [Render Blueprints](https://dashboard.render.com/select-repo?type=blueprint) and use that file.

If creating a web service manually:

| Setting | Value |
| --- | --- |
| Runtime / Language | Docker |
| Root Directory | `backend` |
| Dockerfile Path | `./Dockerfile` |
| Docker Command | Leave blank to use the Dockerfile; optional override: `sh render-start.sh` |
| Health Check Path | `/up` |

Do not use Node, Yarn, or an npm build command for the Laravel service. The Dockerfile installs PHP and Composer dependencies. Its startup command runs migrations and starts Apache.

The Blueprint supplies the known Vercel origins and database connection. You still need to provide the application key. For a manually created Render service, set these API environment variables:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_KEY=YOUR_GENERATED_LARAVEL_KEY
FRONTEND_URL=https://boilerplates-git-main-jyzd.vercel.app,https://boilerplates-bz6qh28ay-jyzd.vercel.app
DB_CONNECTION=pgsql
DB_URL=YOUR_RENDER_POSTGRES_INTERNAL_CONNECTION_STRING
DB_SSLMODE=require
PORT=80
LOG_CHANNEL=stderr
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

Generate a valid key with `node run-php.mjs artisan key:generate --show`, then enter it in Render. Keep the same key across deployments. `FRONTEND_URL` must match the exact Vercel origin without a trailing slash. Multiple allowed origins can be comma-separated.

The Blueprint injects `DB_URL` from the separate managed database. Migrations preserve existing data; startup never resets or seeds the database. See [Render Blueprint reference](https://render.com/docs/blueprint-spec) for configuration and [free service limits](https://render.com/docs/free) for database lifetime limits.

Once deployed, verify `https://YOUR-RENDER-API.onrender.com/up`, set the frontend API variable, and redeploy Vercel. Create a ticket, redeploy both services, and confirm the same ticket remains in PostgreSQL.

## API and application behavior

| Method | Path | Purpose |
| --- | --- | --- |
| POST | /api/auth/login | Obtain an 8-hour token using laboratory credentials |
| GET | /api/tickets | List tickets, newest first |
| POST | /api/tickets | Create a ticket with Open status |
| GET | /api/tickets/{id} | Complete ticket details |
| PUT | /api/tickets/{id} | Update fields and status |
| DELETE | /api/tickets/{id} | Delete a ticket |

Ticket requests use `Authorization: Bearer <token>` and `Accept: application/json`. Validation returns 422 with field errors; invalid/expired tokens return 401; missing tickets return 404.

React routes: `/login`, `/tickets`, `/tickets/new`, `/tickets/:id`, and `/tickets/:id/edit`. All routes except login are protected. The list includes a fixed circular Add Ticket button. Validation, loading, server errors, and delete confirmation appear inline.

Tickets require requester name/email, category, priority, subject, and description. Ticket data is always stored through Laravel; there is no browser-storage fallback. Session storage holds only the temporary login token. The published credentials are required by the lab exercise; real organizational use needs individual user accounts.

Unused inventory components, models, controllers, migration, seeding, tests, image, and backend Vite assets were removed. Core Laravel configuration and migrations remain.

## Formatting and checks

```powershell
npm --prefix frontend run format
npm --prefix frontend run format:check
npm run build
npm test
```

PHP follows Laravel Pint formatting. Frontend code uses the root Prettier configuration.

## Submission screenshots

Screenshots from the local browser verification are saved in the ignored `artifacts` directory:

- `01-ticket-list-after-login.png`
- `02-add-ticket-filled.png`
- `03-ticket-details.png`
- `04-mobile-ticket-list.png`
- `05-mobile-login.png`
- `06-login.png`
- `07-ticket-list-after-restart.png`

Submit the real Vercel frontend URL and Render API base URL. Also capture the ticket list after cloud redeployment and the matching PostgreSQL row once the backend is deployed. Local restart evidence verifies SQLite persistence; cloud persistence has not yet been tested.
