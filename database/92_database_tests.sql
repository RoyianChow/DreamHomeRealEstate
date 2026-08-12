SET SERVEROUTPUT ON;
SET DEFINE OFF;


PROMPT Clean old reserved demo rows
DELETE FROM DH_STAFF WHERE LOWER(EMAIL) = 'member2.demo@dreamhome.test';
DELETE FROM DH_CLIENT WHERE FNAME = 'Member2Demo' AND LNAME = 'Client';
DELETE FROM DH_BRANCH WHERE BRANCHNO = 'B900';
COMMIT;

PROMPT DB-1 Staff hire positive test
VARIABLE v_staffno VARCHAR2(50);
BEGIN Staff_hire_sp('Member2Demo','Staff','Assistant','B002',DATE '2000-01-15',25000,'5559000','07955590000','member2.demo@dreamhome.test',:v_staffno); DBMS_OUTPUT.PUT_LINE('PASS staff hire, STAFFNO=' || :v_staffno); END;
/
PRINT v_staffno;

PROMPT Staff update positive test
BEGIN staff_update_sp(:v_staffno,26000,'5559002','member2.demo@dreamhome.test'); DBMS_OUTPUT.PUT_LINE('PASS staff update'); END;
/
SELECT STAFFNO, SALARY, TELEPHONE, EMAIL FROM DH_STAFF WHERE STAFFNO = :v_staffno;

PROMPT DB-2 Known branch lookup B002
SELECT get_branch_address('B002') AS B002_ADDRESS FROM dual;

PROMPT Unknown branch negative test
BEGIN BEGIN DBMS_OUTPUT.PUT_LINE(get_branch_address('B_DOES_NOT_EXIST')); DBMS_OUTPUT.PUT_LINE('FAIL unknown branch unexpectedly returned a value'); EXCEPTION WHEN NO_DATA_FOUND THEN DBMS_OUTPUT.PUT_LINE('PASS unknown branch produced NO_DATA_FOUND'); END; END;
/

PROMPT Branch insert/update positive test
BEGIN new_branch('B900','900 Demo Street','London','DE9 0MO'); DBMS_OUTPUT.PUT_LINE('PASS branch insert'); END;
/
BEGIN branch_update_sp('B900','901 Demo Street',NULL,NULL); DBMS_OUTPUT.PUT_LINE('PASS branch update'); END;
/
SELECT BRANCHNO, STREET, CITY, POSTCODE FROM DH_BRANCH WHERE BRANCHNO = 'B900';

PROMPT Duplicate branch negative test
BEGIN BEGIN new_branch('B900','Duplicate','London','X'); DBMS_OUTPUT.PUT_LINE('FAIL duplicate branch was accepted'); EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('PASS duplicate rejected: ' || SQLERRM); END; END;
/

PROMPT DB-3 Client create/update positive test
VARIABLE v_clientno VARCHAR2(50);
BEGIN client_create_sp('Member2Demo','Client','5559001','House',900,:v_clientno); DBMS_OUTPUT.PUT_LINE('PASS client create, CLIENTNO=' || :v_clientno); END;
/
PRINT v_clientno;
BEGIN client_update_sp(:v_clientno,'Member2Demo','Client','5559003','Flat',950); DBMS_OUTPUT.PUT_LINE('PASS client update'); END;
/
SELECT CLIENTNO, FNAME, LNAME, TELNO, PREFTYPE, MAXRENT FROM DH_CLIENT WHERE CLIENTNO = :v_clientno;

PROMPT Update-not-found negative tests
BEGIN BEGIN staff_update_sp('NO_SUCH_STAFF',1,NULL,NULL); DBMS_OUTPUT.PUT_LINE('FAIL missing staff update succeeded'); EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('PASS staff missing: ' || SQLERRM); END; END;
/
BEGIN BEGIN branch_update_sp('NO_SUCH_BRANCH',NULL,'Nowhere',NULL); DBMS_OUTPUT.PUT_LINE('FAIL missing branch update succeeded'); EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('PASS branch missing: ' || SQLERRM); END; END;
/
BEGIN BEGIN client_update_sp('NO_SUCH_CLIENT',NULL,NULL,NULL,NULL,1); DBMS_OUTPUT.PUT_LINE('FAIL missing client update succeeded'); EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('PASS client missing: ' || SQLERRM); END; END;
/

PROMPT Final cleanup
DELETE FROM DH_STAFF WHERE LOWER(EMAIL) = 'member2.demo@dreamhome.test';
DELETE FROM DH_CLIENT WHERE FNAME = 'Member2Demo' AND LNAME = 'Client';
DELETE FROM DH_BRANCH WHERE BRANCHNO = 'B900';
COMMIT;

PROMPT Remaining reserved demo rows (all counts should be 0)
SELECT COUNT(*) AS DEMO_STAFF_LEFT FROM DH_STAFF WHERE LOWER(EMAIL) = 'member2.demo@dreamhome.test';
SELECT COUNT(*) AS DEMO_CLIENT_LEFT FROM DH_CLIENT WHERE FNAME = 'Member2Demo' AND LNAME = 'Client';
SELECT COUNT(*) AS DEMO_BRANCH_LEFT FROM DH_BRANCH WHERE BRANCHNO = 'B900';

PROMPT Database tests finished
