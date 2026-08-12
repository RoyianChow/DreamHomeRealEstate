-- Dream Home Real Estate
-- DB-2: BRANCHNO -> street and city lookup.

SET DEFINE OFF;

CREATE OR REPLACE PROCEDURE branch_address_sp (
  p_branchno  IN  DH_BRANCH.BRANCHNO%TYPE,
  p_street    OUT DH_BRANCH.STREET%TYPE,
  p_city      OUT DH_BRANCH.CITY%TYPE
) IS
BEGIN
  SELECT STREET, CITY
  INTO p_street, p_city
  FROM DH_BRANCH
  WHERE BRANCHNO = p_branchno;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20003, 'Branch was not found');
END branch_address_sp;
/

-- Compilation check:
-- SHOW ERRORS PROCEDURE BRANCH_ADDRESS_SP;

