SET SERVEROUTPUT ON;

PROMPT Deletes only rows reserved by this project. Seed/course rows are untouched.

DELETE FROM DH_STAFF
 WHERE LOWER(EMAIL) = 'member2.demo@dreamhome.test';

DELETE FROM DH_CLIENT
 WHERE FNAME = 'Member2Demo'
   AND LNAME = 'Client';

DELETE FROM DH_BRANCH
 WHERE BRANCHNO = 'B900';

COMMIT;

PROMPT Reset complete.
