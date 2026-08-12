# Front-end test checklist (QA-2, Royian)

Run the whole list before the demo, first against `DATA_SOURCE=mock`, then
against the real Oracle connection.
Record the date and the result; screenshots of the failures are the useful ones.

Legend: ✅ passing on the mock data source · ☐ still to run or record against
Oracle.

Latest automated smoke check (2026-08-12): `/api/health`, `/api/staff`,
`/api/branches`, and `/api/clients` returned 200 from the live Oracle mode;
`/api/branches/B999/address` returned the expected 404. The full browser flow
and SQL Developer procedure evidence still need one manual rehearsal.

## Global

| # | Check | Mock | Oracle |
| --- | --- | --- | --- |
| G1 | Header shows the connection badge; ⟳ re-checks it | ✅ | ☐ |
| G2 | Badge is amber for mock, green for Oracle, red when unreachable | ✅ | ☐ |
| G3 | All four menu links work and the current page is highlighted | ✅ | ☐ |
| G4 | "Skip to main content" appears on the first Tab press | ✅ | ☐ |
| G5 | Every form control has a visible label and a focus ring | ✅ | ☐ |
| G6 | No horizontal page scroll at 375 px width | ✅ | ☐ |
| G7 | Wide tables scroll inside their own container, not the page | ✅ | ☐ |
| G8 | No errors in the browser console during a full demo run | ✅ | ☐ |

## Staff

| # | Check | Mock | Oracle |
| --- | --- | --- | --- |
| S1 | Submitting the empty hire form shows a message on all nine fields | ✅ | ☐ |
| S2 | A valid hire returns the generated staff number in the banner | ✅ | ☐ |
| S3 | The new row appears in View & update without a manual refresh | ✅ | ☐ |
| S4 | Salary accepts `27,500` and stores `27500` | ✅ | ☐ |
| S5 | A future or impossible date of birth is rejected | ✅ | ☐ |
| S6 | Only salary, telephone and email become inputs when editing a row | ✅ | ☐ |
| S7 | Saving with nothing changed says "Change at least one field" | ✅ | ☐ |
| S8 | The confirm dialog lists old → new for each changed field | ✅ | ☐ |
| S9 | An invalid email on save shows the error on that cell, row stays open | ✅ | ☐ |
| S10 | The saved value survives a full page reload | ✅ | ☐ |
| S11 | Hiring into a branch number that does not exist is refused | ✅ | ☐ |

## Branches

| # | Check | Mock | Oracle |
| --- | --- | --- | --- |
| B1 | A known branch number returns street and city | ✅ | ☐ |
| B2 | A lower-case entry (`b007`) still works | ✅ | ☐ |
| B3 | An unknown branch number shows a clear "no branch found" message | ✅ | ☐ |
| B4 | A blank branch number is caught before any request is sent | ✅ | ☐ |
| B5 | Opening a branch adds it to the list and to the lookup hint | ✅ | ☐ |
| B6 | Opening a branch with an existing number is refused (409) | ✅ | ☐ |
| B7 | The branch number is not editable anywhere in the table | ✅ | ☐ |
| B8 | Street, city and postcode can be changed and persist | ✅ | ☐ |

## Clients

| # | Check | Mock | Oracle |
| --- | --- | --- | --- |
| C1 | Registration validates all five fields | ✅ | ☐ |
| C2 | A registered client appears in the list with a client number | ✅ | ☐ |
| C3 | One field alone can be updated | ✅ | ☐ |
| C4 | Several fields can be updated in one save | ✅ | ☐ |
| C5 | Preferred property type edits through a dropdown, not free text | ✅ | ☐ |
| C6 | The client number is never editable | ✅ | ☐ |
| C7 | Maximum rent redisplays as formatted currency after saving | ✅ | ☐ |

## Failure paths worth demonstrating

| # | Check | Mock | Oracle |
| --- | --- | --- | --- |
| F1 | Stop the server mid-session: lists show "Could not reach the server" with a Try again button | ✅ | ☐ |
| F2 | `DATA_SOURCE=oracle` with no Oracle module: badge turns red and explains why | ✅ | ☐ |
| F3 | Error responses never show SQL text or a stack trace | ✅ | ☐ |

## API status codes (verified from the browser console)

`200` list/update · `201` insert · `400` validation and empty update ·
`404` unknown staff number and unknown branch number · `409` duplicate branch.
