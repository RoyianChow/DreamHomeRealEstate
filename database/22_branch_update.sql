SET SERVEROUTPUT ON;

CREATE OR REPLACE PROCEDURE branch_update_sp (
    p_branchno IN DH_BRANCH.BRANCHNO%TYPE,
    p_street   IN DH_BRANCH.STREET%TYPE DEFAULT NULL,
    p_city     IN DH_BRANCH.CITY%TYPE DEFAULT NULL,
    p_postcode IN DH_BRANCH.POSTCODE%TYPE DEFAULT NULL
)
IS
BEGIN
    IF p_street IS NULL
       AND p_city IS NULL
       AND p_postcode IS NULL THEN
        RAISE_APPLICATION_ERROR(-20011, 'At least one branch field must be changed.');
    END IF;

    UPDATE DH_BRANCH
       SET STREET   = COALESCE(p_street, STREET),
           CITY     = COALESCE(p_city, CITY),
           POSTCODE = COALESCE(p_postcode, POSTCODE)
     WHERE BRANCHNO = p_branchno;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20014, 'Branch record not found.');
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END branch_update_sp;
/

SHOW ERRORS PROCEDURE branch_update_sp;
