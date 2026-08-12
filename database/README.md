# Member 2 Database

## Files
- `00_schema_notes.md` - table and update notes
- `10_staff_hire_sp.sql` - staff hire
- `11_staff_update.sql` - staff update
- `20_new_branch.sql` - branch creation
- `21_branch_address.sql` - branch address lookup
- `22_branch_update.sql` - branch update
- `30_client_create.sql` - client creation
- `31_client_update.sql` - client update
- `90_demo_data.sql` - demo data
- `91_reset.sql` - demo data cleanup
- `92_database_tests.sql` - database tests
- `99_compile_all.sql` - compiles and checks database objects

## Run Order
1. Run `99_compile_all.sql`.
2. Make sure all objects are VALID and there are no compiler errors.
3. Run `92_database_tests.sql`.
4. Use `91_reset.sql` to remove the demo records when needed.
