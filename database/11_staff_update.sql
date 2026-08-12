SET SERVEROUTPUT ON;

CREATE OR REPLACE PROCEDURE staff_update_sp (
    p_staffno   IN DH_STAFF.STAFFNO%TYPE,
    p_salary    IN DH_STAFF.SALARY%TYPE DEFAULT NULL,
    p_telephone IN DH_STAFF.TELEPHONE%TYPE DEFAULT NULL,
    p_email     IN DH_STAFF.EMAIL%TYPE DEFAULT NULL
)
IS
BEGIN
    IF p_salary IS NULL
       AND p_telephone IS NULL
       AND p_email IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'At least one staff field must be changed.');
    END IF;

    UPDATE DH_STAFF
       SET SALARY    = COALESCE(p_salary, SALARY),
           TELEPHONE = COALESCE(p_telephone, TELEPHONE),
           EMAIL     = COALESCE(p_email, EMAIL)
     WHERE STAFFNO = p_staffno;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'Staff record not found.');
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END staff_update_sp;
/

SHOW ERRORS PROCEDURE staff_update_sp;
