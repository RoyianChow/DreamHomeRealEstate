SET SERVEROUTPUT ON;

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
      INTO v_count
      FROM user_sequences
     WHERE sequence_name = 'DH_STAFFNO_SEQ';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE
            'CREATE SEQUENCE DH_STAFFNO_SEQ START WITH 1000 INCREMENT BY 1 NOCACHE NOCYCLE';
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE Staff_hire_sp (
    p_first_name IN  DH_STAFF.FNAME%TYPE,
    p_last_name  IN  DH_STAFF.LNAME%TYPE,
    p_position   IN  DH_STAFF.POSITION%TYPE,
    p_branchno   IN  DH_STAFF.BRANCHNO%TYPE,
    p_dob        IN  DH_STAFF.DOB%TYPE,
    p_salary     IN  DH_STAFF.SALARY%TYPE,
    p_telephone  IN  DH_STAFF.TELEPHONE%TYPE,
    p_mobile     IN  DH_STAFF.MOBILE%TYPE,
    p_email      IN  DH_STAFF.EMAIL%TYPE,
    p_staffno    OUT DH_STAFF.STAFFNO%TYPE
)
IS
    v_exists NUMBER;
BEGIN
    LOOP
        p_staffno := 'ST' || TO_CHAR(DH_STAFFNO_SEQ.NEXTVAL);

        SELECT COUNT(*)
          INTO v_exists
          FROM DH_STAFF
         WHERE STAFFNO = p_staffno;

        EXIT WHEN v_exists = 0;
    END LOOP;

    INSERT INTO DH_STAFF (
        STAFFNO, FNAME, LNAME, POSITION, DOB, SALARY,
        BRANCHNO, TELEPHONE, MOBILE, EMAIL
    )
    VALUES (
        p_staffno, p_first_name, p_last_name, p_position, p_dob, p_salary,
        p_branchno, p_telephone, p_mobile, p_email
    );

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END Staff_hire_sp;
/

SHOW ERRORS PROCEDURE Staff_hire_sp;
