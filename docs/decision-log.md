# Decision log

One line per decision, so nothing important lives only in chat. Add new rows at
the bottom. `FE-` = front end (Royian), `DB-` = database (Member 2), `API-` =
integration (Member 3).

## Confirmed instructor decisions (from the project plan)

| ID | Decision |
| --- | --- |
| INS-1 | `Staff_hire_sp` takes nine inputs: first name, last name, position, BRANCHNO, DOB, salary, telephone, mobile, email. `SEX` is not collected. |
| INS-2 | `STAFFNO` needs an explicit, documented generator. Nothing assumes Oracle produces it automatically. |
| INS-3 | The staff INSERT must satisfy every `DH_STAFF` constraint; uncollected columns must be nullable, defaulted, database-generated, or given a value inside the procedure. |
| INS-4 | Branch-address lookup takes `BRANCHNO`, queries `DH_BRANCH`, returns street plus city. `new_branch` also targets `DH_BRANCH`. |
| INS-5 | Client update uses `CLIENTNO` only to locate the row. First name, last name, telephone, preferred property type and maximum rent may be changed together or individually. `CLIENTNO` is immutable. |
| INS-6 | Staff termination is not required. Production-grade login/authentication is not required. |

## Front-end decisions

| ID | Decision | Reason |
| --- | --- | --- |
| FE-01 | Staff positions are a fixed dropdown (`Manager`, `Supervisor`, `Assistant`, `Deputy`) in `lib/constants.ts`. | A free-text position would fail a check constraint at insert time. **Open: Member 2 to confirm the real allowed values.** |
| FE-02 | One route per domain (`/staff`, `/branches`, `/clients`), each with tabs, rather than a page per action. | Matches the recommended page design in the plan and keeps the demo to four screens. |
| FE-03 | The interface is locked to a light theme (`color-scheme: light`). | The demo runs on an unknown machine and projector; an automatic dark-mode flip is a risk with no upside for marking. |
| FE-04 | Money and dates are formatted for display only (`lib/format.ts`); the raw number and `yyyy-mm-dd` string are what get sent. | Avoids locale parsing problems on the way into Oracle. |
| FE-05 | Currency is `en-GB` / GBP, because Dream Home is the UK case study. Two constants in `lib/format.ts` change it. | Consistency between the salary and rent fields. |
| FE-06 | Update allowlists are expressed as `editable: true` on table columns and as the shape of the update schemas. | The UI cannot offer an edit the server would reject; the allowlist is visible in one place per feature. |
| FE-07 | Every write is confirmed through `ConfirmDialog`, showing old → new values. | Prevents an accidental save during the live demo and gives the marker something to see. |
| FE-08 | The front end ships with a mock data source (`DATA_SOURCE=mock`) behind the same interface Oracle will use. | Week 1 exit gate: the UI is buildable and demonstrable before the database is connected, exactly as the plan requires. |
| FE-09 | No authentication, no user accounts. | INS-6. |

## Open questions

| ID | Question | Who | Needed by |
| --- | --- | --- | --- |
| Q-1 | Exact `DH_STAFF` column names, nullability and check constraints (especially `POSITION`). | Member 2 | Before the staff slice is called done |
| Q-2 | Which `STAFFNO` generator was chosen, and how collisions are prevented. | Member 2 | Week 2 |
| Q-3 | Does `DH_BRANCH` hold a postcode column? The form and table assume `street`, `city`, `postcode`. | Member 2 | Week 3 |
| Q-4 | Does `new_branch` take the branch number as an input, or generate one? The form currently asks the user for it. | Member 2 | Week 3 |
| Q-5 | Is `DH_CLIENT.PREFTYPE` limited to `House` / `Flat`, or are there more values? | Member 2 | Week 3 |
| Q-6 | Does the client table hold an email column that registration should collect? | Member 2 | Week 3 |

Each of these is a one-file change on the front end: Q-1/Q-5 in
`lib/constants.ts`, Q-3/Q-4/Q-6 in `lib/types.ts` plus the matching form.
