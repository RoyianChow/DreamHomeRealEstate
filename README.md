# Dream Home Real Estate

Next.js front end for the Dream Home Real Estate coursework application, over an
Oracle / PL-SQL backend. Three menus - **Staff**, **Branch**, **Client** - plus a
dashboard, all talking to the database through server-side route handlers.

> **Current state:** the website, the shared components, the API contract and
> the route handlers are finished and tested against an in-memory mock data
> source. The Oracle procedures (Member 2) and the node-oracledb data source
> (Member 3) are the remaining pieces. See
> [Where the other two members plug in](#where-the-other-two-members-plug-in).

---

## Getting started

```bash
npm install
```

```bash
copy .env.example .env.local
```

Then:

```bash
npm run dev
```

Open <http://localhost:3000>. It redirects to `/dashboard`.

With `DATA_SOURCE=mock` (the default in `.env.example`) the whole application
works with no database at all, so anyone can pull the repository and see every
screen. The badge in the header says *Mock data* in amber; it turns green and
says *Oracle connected* once the real data source is wired up.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with Fast Refresh |
| `npm run build` | Production build - also runs a full TypeScript check |
| `npm start` | Serves the production build (use this for the demo) |
| `npm run lint` | ESLint, including the React Compiler rules |
| `npx tsc --noEmit` | Types only, faster than a full build |

---

## What is in the repository

```
app/
  dashboard/            main menu, architecture summary, demo running order
  staff/                UI-2  hire + view & update
  branches/             UI-3  address lookup + open branch + view & update
  clients/              UI-4  register + view & update
  api/                  route handlers - the only place that touches data
components/
  layout/               AppShell, MainNavigation, ConnectionStatus, PageHeader
  form/                 FormField, SelectField, DateField, CurrencyField, FormActions
  data/                 EditableDataTable
  ui/                   StatusAlert, LoadingButton, EmptyState, ConfirmDialog,
                        TabPanels, SectionCard
  staff/ branches/ clients/   the per-domain forms, tables and workspaces
hooks/                  useRecords - list loading, error and refresh-after-save
lib/
  types.ts              shared domain + transport types (the contract)
  validation.ts         Zod schemas used by BOTH the browser and the server
  api-client.ts         typed fetch wrappers; pages never call fetch directly
  format.ts             currency / date display helpers
  constants.ts          dropdown values and business limits
  server/               contracts.ts, data-source.ts, mock-data-source.ts, http.ts
database/               Member 2's PL/SQL (see database/README.md)
docs/                   API contract, decision log, test checklist
```

### How a request travels

1. A form component validates with the shared Zod schema and shows field errors
   immediately.
2. It calls a typed function in `lib/api-client.ts`, which never throws - it
   resolves to `{ ok: true, data }` or `{ ok: false, message, code, fieldErrors }`.
3. The route handler in `app/api/...` runs the **same schema again** (the server
   is the final authority) and calls the data source.
4. The data source - mock today, Oracle next - performs the work and returns
   plain objects.
5. The page shows a success banner and refreshes its list, or renders the error
   on the exact field that caused it.

The browser never connects to Oracle. Credentials live only in `.env.local`,
which is git-ignored; `.env.example` holds the variable names.

---

## Where the other two members plug in

### Member 2 - Oracle / PL-SQL

Everything is in [`database/README.md`](database/README.md) and the column map
in [`docs/api-contract.md`](docs/api-contract.md) section 3. The open questions
that block front-end details are listed at the bottom of
[`docs/decision-log.md`](docs/decision-log.md) - answering them is a one-file
change here in each case.

### Member 3 - API integration

`lib/server/contracts.ts` defines `DreamHomeDataSource`, the twelve methods the
route handlers call. To connect Oracle:

1. Add `lib/server/oracle-data-source.ts` implementing that interface with a
   node-oracledb pool and bind variables.
2. Throw `new DataError("NOT_FOUND" | "DUPLICATE" | "DATABASE_ERROR", message)`
   for expected failures - the handlers already map those to 404 / 409 / 500.
3. In `lib/server/data-source.ts`, swap the placeholder `throw` for the import.
4. Set `DATA_SOURCE=oracle` in `.env.local`.

`oracledb` is already declared in `serverExternalPackages` in `next.config.ts`,
and every route sets `runtime = "nodejs"`.

No page or component changes when this happens - that was the point of freezing
the contract in Week 1.

---

## Demonstration route

The dashboard prints this list on screen so nobody has to remember it.

1. **Dashboard** - three menus, live record counts, connection badge.
2. **Staff** - hire a member using the nine `Staff_hire_sp` inputs; the banner
   shows the generated staff number; switch to *View & update* and change the
   salary; confirm the old → new dialog.
3. **Branch** - look up `B003` and read street plus city; try `B999` to show the
   error path; open a branch; edit its city.
4. **Client** - register a client; change the preferred property type and the
   maximum rent in one save.
5. **Evidence** - show the same rows in SQL Developer.

Run the demo from `npm run build && npm start`, not `npm run dev`.

---

## Accessibility and responsiveness

* Every input is labelled and wired to its error text with `aria-describedby`;
  invalid inputs carry `aria-invalid`.
* Errors use `role="alert"`, successes use `role="status"`.
* Tabs follow the WAI-ARIA pattern, including arrow-key navigation.
* The confirm dialog moves focus to the confirm button, closes on Escape, and
  returns focus to the trigger.
* Nothing depends on colour alone; a skip link is the first tab stop.
* Verified at 375 px: no horizontal page scroll - wide tables scroll inside
  their own container.

Test results are recorded in
[`docs/frontend-test-checklist.md`](docs/frontend-test-checklist.md); the Oracle
column of that table is filled in once the real connection exists.
