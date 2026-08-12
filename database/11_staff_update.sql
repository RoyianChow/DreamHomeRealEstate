-- Dream Home Real Estate
-- DB-1: permitted staff updates.
--
-- STAFFNO is used only to locate the row. The procedure can update only:
--   SALARY, TELEPHONE, EMAIL
-- NULL parameters mean "leave this field unchanged". The web application
-- validates that at least one field is supplied before calling this object.

SET DEFINE OFF;

CREATE OR REPLACE PROCEDURE Staff_update_sp (
  p_staffno    IN DH_STAFF.STAFFNO%TYPE,
  p_salary     IN DH_STAFF.SALARY%TYPE DEFAULT NULL,
  p_telephone  IN DH_STAFF.TELEPHONE%TYPE DEFAULT NULL,
  p_email      IN DH_STAFF.EMAIL%TYPE DEFAULT NULL
) IS
BEGIN
  IF p_salary IS NULL
     AND p_telephone IS NULL
     AND p_email IS NULL
  THEN
    RAISE_APPLICATION_ERROR(
      -20001,
      'At least one of salary, telephone, or email is required'
    );
  END IF;

  UPDATE DH_STAFF
  SET SALARY = CASE
                 WHEN p_salary IS NOT NULL THEN p_salary
                 ELSE SALARY
               END,
      TELEPHONE = CASE
                    WHEN p_telephone IS NOT NULL THEN p_telephone
                    ELSE TELEPHONE
                  END,
      EMAIL = CASE
                WHEN p_email IS NOT NULL THEN p_email
                ELSE EMAIL
              END
  WHERE STAFFNO = p_staffno;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20002, 'Staff member was not found');
  END IF;

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END Staff_update_sp;
/

-- Compilation check:
-- SHOW ERRORS PROCEDURE STAFF_UPDATE_SP;

