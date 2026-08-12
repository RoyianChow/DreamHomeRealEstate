# Dream Home Real Estate

Dream Home Real Estate is a Next.js administration demo for staff, branches,
and clients. It uses server-side route handlers, shared validation, Oracle
PL/SQL procedures, and a safe offline mock mode. Prepared by **Royian**.

## Demo-ready status

- The three assessed workflows are implemented: Staff, Branch, and Client.
- `DATA_SOURCE=oracle` uses the server-only `oracledb` connection pool.
- `DATA_SOURCE=mock` remains available for an offline rehearsal.
- API errors are returned as safe messages; credentials and Oracle stack traces
  never reach the browser.
- The production build has a `build` script and is compatible with Vercel's
  automatic Next.js detection.

## Run locally

```bash
npm install
```

For an offline rehearsal:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. The root route redirects to `/dashboard`.

For the live Oracle demo, set these values in the ignored `.env.local` file:

```text
DATA_SOURCE=oracle
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=your_working_oracle_connect_string
```

Keep `ORACLE_PASSWORD` out of Git, screenshots, slides, and chat. The optional
pool values and Thick-mode client path are documented in `.env.example`.
Use the exact connect string that succeeds in SQL Developer; for the course
connection this may be a SID descriptor for `SQLD` rather than a service name.

## Database setup

Run the scripts in SQL Developer as the schema owner, in this order:

1. `database/10_staff_hire_sp.sql`
2. `database/11_staff_update.sql`
3. `database/20_new_branch.sql`
4. `database/21_branch_address.sql`
5. `database/22_branch_update.sql`
6. `database/30_client_create.sql`
7. `database/31_client_update.sql`
8. `database/90_demo_data.sql` (optional reserved demo rows)
9. `database/99_compile_all.sql`

`database/91_reset.sql` removes only the reserved demo rows (`B900`, `ST9000`,
and `CR9000`) when you want a clean rehearsal. It does not delete shared course
data.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint checks |
| `npm run build` | Production build and TypeScript check |
| `npm start` | Serve the production build for the demo |

Before presenting, run `npm run lint`, `npm run build`, then `npm start` and
walk through the dashboard, Staff, Branch, Client, and SQL Developer evidence.

## Vercel deployment

This is a standard Next.js App Router project; Vercel detects the framework and
uses the existing `npm run build` script. No `vercel.json` is required.

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New Project**, import the repository, and keep the
   detected Next.js framework and default build settings.
3. Add the following Environment Variables in the Vercel project settings for
   **Preview** and **Production**:

   ```text
   DATA_SOURCE=oracle
   ORACLE_USER=your_username
   ORACLE_PASSWORD=your_password
   ORACLE_CONNECT_STRING=your_working_oracle_connect_string
   ORACLE_POOL_MIN=1
   ORACLE_POOL_MAX=4
   ORACLE_POOL_INCREMENT=1
   ```

4. Deploy, open `/api/health`, and confirm `dataSource` is `oracle` and
   `connected` is `true` before demonstrating writes.

The Oracle host must allow connections from the deployed Vercel function. If
the course database is restricted to the campus network, use the local
production demo (`npm run build && npm start`) or obtain an instructor-approved
hosted database instead of exposing credentials or bypassing the firewall.

## Repository layout

```text
app/                    pages and API route handlers
components/             reusable layout, forms, tables, and feedback UI
lib/                    types, validation, API client, and data sources
database/               Oracle procedures and repeatable demo scripts
docs/                   API contract, decisions, and QA checklist
```

The browser never connects directly to Oracle. Only server route handlers import
the Oracle adapter, and all writes use bind variables and controlled PL/SQL
procedures.
