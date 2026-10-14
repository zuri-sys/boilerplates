# Supportdesk — CCS112 IT Helpdesk

React 19 + Vite + React Router frontend and a separate Laravel 13 REST API. This implements the laboratory task in the provided image.

## Start locally

Use PHP **8.4+** (the locked development packages require it), Composer, and Node.js 22.12+. On this workstation a portable PHP 8.4 runtime is installed in the ignored `.tools/php84` directory; `run-php.mjs` selects it automatically without changing XAMPP.

From this repository directory:

```powershell
cd backend
composer install
# Keep an existing .env; copy only on first setup.
if (!(Test-Path .env)) { Copy-Item .env.example .env }
cd ..
node run-php.mjs artisan key:generate
if (!(Test-Path backend/database/database.sqlite)) { New-Item backend/database/database.sqlite -ItemType File }
node run-php.mjs artisan migrate
npm --prefix frontend ci
```

If Composer uses PHP 8.2 on this workstation, run `.tools/php84/php.exe C:/composer/composer.phar install` from the repository root with `--working-dir=backend`. Elsewhere use your PHP 8.4+ installation.

Start these in two separate terminals:

```powershell
npm run dev:backend
npm run dev:frontend
```

Open **http://127.0.0.1:5173** and log in with **itadmin / helpdesk123**. The frontend proxies `/api` to Laravel at port 8017. Override the runtime with `PHP_BINARY` if needed.

## Task coverage

- The default page is login. All remaining React routes require a session; logout and expired API tokens return to login. Invalid credentials show an inline message.
- React Router provides `/tickets`, `/tickets/new`, `/tickets/:id`, and `/tickets/:id/edit`. A circular button at the bottom right of the list opens Add Ticket.
- Ticket creation requires requester name/email, issue category, priority, subject, and description. Errors appear beside fields. Successful POST/PUT returns to the list without refreshing the browser.
- The queue fetches Laravel records on mount, supports inline loading/errors and retry, and displays ticket number, requester, subject, priority, status, and creation date. Search and filters are available.
- Details show all ticket fields and Back/Edit actions. Editing updates status and details. Deletion uses an inline confirmation and an HTTP DELETE request.
- Eloquent records persist in SQLite locally and PostgreSQL on Render. Ticket numbers derive from database IDs, avoiding collisions between concurrent requests.
- There is no local-storage fallback for ticket data. Frontend session storage contains only the temporary login token.
- The API also verifies the laboratory credentials and protects ticket endpoints with an encrypted, expiring bearer token. These published credentials are for the required lab exercise; replace this authentication with real user accounts before using sensitive organizational data.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | /api/auth/login | Validate credentials and obtain an 8-hour token |
| GET | /api/tickets | List tickets, newest first |
| POST | /api/tickets | Create ticket with Open status |
| GET | /api/tickets/{id} | Complete ticket details |
| PUT | /api/tickets/{id} | Update ticket fields and status |
| DELETE | /api/tickets/{id} | Delete a ticket |

Ticket requests send `Authorization: Bearer <token>` and `Accept: application/json`. Validation returns HTTP 422 with field errors; missing/expired tokens return 401; missing tickets return 404.

## Render deployment

The root `render.yaml` defines two independently deployed HTTPS services and a managed PostgreSQL database. The API builds `backend/Dockerfile`; the React static site builds `frontend/dist`. Startup runs non-destructive migrations, never database resets or seeding. React deep links rewrite to `index.html`.

1. Push this repository to [zuri-sys/boilerplates](https://github.com/zuri-sys/boilerplates).
2. In [Render Blueprints](https://dashboard.render.com/select-repo?type=blueprint), connect that repository and use `render.yaml`.
3. Provide `APP_KEY`: generate it locally using `node run-php.mjs artisan key:generate --show` and enter the output in Render. Keep the same key across redeployments.
4. Provide API `FRONTEND_URL` as the exact frontend HTTPS origin, without a trailing slash, such as `https://supportdesk-web.onrender.com`.
5. Provide frontend `VITE_API_BASE_URL` as the actual API HTTPS URL **including /api**, such as `https://supportdesk-api.onrender.com/api`.
6. Verify the assigned hostnames after Render creates the services; update those two URL variables if Render appends a suffix. Rebuild the frontend after changing its API URL.
7. Sign in, create a ticket, and redeploy both services. The ticket should still be listed because `DB_URL` points to the separate managed PostgreSQL database.

Blueprint URL variables require your actual service addresses; the examples above are not deployed URLs. The database connection is injected from Render, never committed. See [Render Blueprint reference](https://render.com/docs/blueprint-spec) for the configuration fields. The template selects free services; review [Render free service limits](https://render.com/docs/free) before deploying, particularly free PostgreSQL expiry. For lasting hosting, choose the database plan that suits your needs in Render.

Live deployment and cloud persistence verification require access to your Render account. Preparing these files does not create hosted services.

## Checks and submission evidence

```powershell
npm run build
npm test
```

The Laravel ticket tests cover login rejection, unauthorized/tampered/expired tokens, create/list/details/update/delete, required fields, email validation, invalid categories/priorities/statuses, and subject length. Existing inventory tests remain regression coverage for the starter API.

For submission, collect:

- React frontend HTTPS URL and Laravel API base URL.
- Ticket list immediately after login.
- Add Ticket screen with all fields filled before saving.
- Details screen for that newly added ticket.
- Ticket list after stopping and restarting both local servers.
- Ticket list after redeploying both Render services, plus the matching row in Render PostgreSQL.

Browser verification screenshots from this workstation are saved in the ignored `artifacts` folder when available. Local restart evidence confirms local database persistence; the cloud redeploy evidence must be collected after the Render deployment.
