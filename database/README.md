# Oracle database scripts

These scripts are the Oracle/PL-SQL part of the Dream Home Real Estate demo,
prepared by Royian. Run them as the schema owner in SQL Developer.

## Run order

```text
10_staff_hire_sp.sql    Staff_hire_sp and STAFFNO sequence
11_staff_update.sql     salary / telephone / email update logic
20_new_branch.sql       new_branch against DH_BRANCH
21_branch_address.sql   BRANCHNO -> street + city lookup
22_branch_update.sql    street / city / postcode update logic
30_client_create.sql    client_create_sp and CLIENTNO sequence
31_client_update.sql    five permitted client fields
90_demo_data.sql        reserved repeatable rows for a presentation
99_compile_all.sql      compile objects and report USER_ERRORS
```

Run `91_reset.sql` when you want to remove only the reserved presentation rows.
It deletes `B900`, `ST9000`, and `CR9000`; it does not touch shared course data.

After running the scripts, `99_compile_all.sql` should report every procedure as
`VALID` and return no rows from `USER_ERRORS`. Keep that result as submission
evidence.

## Application contract

The Next.js server calls these procedures through
`../lib/server/oracle-data-source.ts`:

- Staff hire returns the generated `STAFFNO` through an OUT parameter.
- Staff updates allow salary, telephone, and email only.
- Branch address lookup returns street and city and raises a not-found error for
  an unknown branch.
- Branch updates allow street, city, and postcode only.
- Client registration returns the generated `CLIENTNO` through an OUT parameter.
- Client updates allow first name, last name, telephone, preferred property type,
  and maximum rent only.

All user values are bound parameters. Procedures commit a successful write and
roll back on failure; the API maps expected Oracle errors to safe HTTP responses.
