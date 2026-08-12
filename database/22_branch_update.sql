-- Dream Home Real Estate
-- DB-2: permitted branch updates.
--
-- BRANCHNO is used only to locate the row. The procedure can update only:
--   STREET, CITY, POSTCODE
-- NULL parameters mean "leave this field unchanged".

SET DEFINE OFF;

CREATE OR REPLACE PROCEDURE branch_update_sp (
  p_branchno  IN DH_BRANCH.BRANCHNO%TYPE,
  p_street    IN DH_BRANCH.STREET%TYPE DEFAULT NULL,
  p_city      IN DH_BRANCH.CITY%TYPE DEFAULT NULL,
  p_postcode  IN DH_BRANCH.POSTCODE%TYPE DEFAULT NULL
) IS
BEGIN
  IF p_street IS NULL
     AND p_city IS NULL
     AND p_postcode IS NULL
  THEN
    RAISE_APPLICATION_ERROR(
      -20004,
      'At least one of street, city, or postcode is required'
    );
  END IF;

  UPDATE DH_BRANCH
  SET STREET = CASE
                 WHEN p_street IS NOT NULL THEN p_street
                 ELSE STREET
               END,
      CITY = CASE
               WHEN p_city IS NOT NULL THEN p_city
               ELSE CITY
             END,
      POSTCODE = CASE
                   WHEN p_postcode IS NOT NULL THEN p_postcode
                   ELSE POSTCODE
                 END
  WHERE BRANCHNO = p_branchno;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20005, 'Branch was not found');
  END IF;

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END branch_update_sp;
/

-- Compilation check:
-- SHOW ERRORS PROCEDURE BRANCH_UPDATE_SP;

