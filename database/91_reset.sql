-- Dream Home Real Estate - remove only the reserved demo rows.
-- Shared course data is intentionally untouched.
SET DEFINE OFF;
SET SERVEROUTPUT ON;

DELETE FROM DH_STAFF WHERE STAFFNO = 'ST9000';
DELETE FROM DH_CLIENT WHERE CLIENTNO = 'CR9000';
DELETE FROM DH_BRANCH WHERE BRANCHNO = 'B900';

COMMIT;

BEGIN
  DBMS_OUTPUT.PUT_LINE('Reserved demo rows removed: B900, ST9000 and CR9000');
END;
/
