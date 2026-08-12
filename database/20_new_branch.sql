SET SERVEROUTPUT ON;

CREATE OR REPLACE PROCEDURE new_branch (
    p_branchno IN DH_BRANCH.BRANCHNO%TYPE,
    p_street   IN DH_BRANCH.STREET%TYPE,
    p_city     IN DH_BRANCH.CITY%TYPE,
    p_postcode IN DH_BRANCH.POSTCODE%TYPE
)
IS
BEGIN
    INSERT INTO DH_BRANCH (BRANCHNO, STREET, CITY, POSTCODE)
    VALUES (p_branchno, p_street, p_city, p_postcode);

    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20009, 'Branch number already exists.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END new_branch;
/

SHOW ERRORS PROCEDURE new_branch;
