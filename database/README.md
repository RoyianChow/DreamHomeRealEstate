# database/ - Member 2 (Oracle / PL-SQL Lead)

This folder is reserved for the database work (DB-1 … DB-4 in the plan). It is
empty apart from this note so the repository structure agreed in the plan exists
from day one.

Suggested layout, numbered so the whole schema can be rebuilt in order:

```
database/
  00_schema_notes.md      column map, constraints, nullability (P0-1)
  10_staff_hire_sp.sql    Staff_hire_sp + the STAFFNO generator
  11_staff_update.sql     salary / telephone / email update logic
  20_new_branch.sql       new_branch against DH_BRANCH
  21_branch_address.sql   BRANCHNO -> street + city lookup
  22_branch_update.sql
  30_client_create.sql
  31_client_update.sql    the five permitted fields
  90_demo_data.sql        repeatable demo rows using reserved IDs
  91_reset.sql            safe cleanup that leaves shared course data alone
  99_compile_all.sql      runs every object and reports invalid ones
```

What the front end needs back from these objects:

* **Staff hire** - the generated `STAFFNO` must be returned to the caller (OUT
  parameter or a following SELECT). The success banner prints it as evidence of
  the insert.
* **Branch address** - street and city for one branch number; an unknown number
  must be distinguishable from a blank result so the API can answer 404.
* **Updates** - the caller passes only the permitted columns. `STAFFNO`,
  `BRANCHNO` and `CLIENTNO` are never sent in an update payload.

The JSON field names the application uses, and the columns they are expected to
map to, are in [`../docs/api-contract.md`](../docs/api-contract.md) section 3.
Open questions waiting on this folder are listed in
[`../docs/decision-log.md`](../docs/decision-log.md).
