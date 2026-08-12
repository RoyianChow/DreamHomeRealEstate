-- Dream Home Real Estate
-- DB-2: insert a branch into DH_BRANCH.
--
-- BRANCHNO is supplied by the caller and remains immutable after insert.
-- Duplicate branch numbers are allowed to raise the database unique-key error;
-- the API layer will translate that into its 409 DUPLICATE response.

SET DEFINE OFF;

CREATE OR REPLACE PROCEDURE new_branch (
  p_branchno  IN DH_BRANCH.BRANCHNO%TYPE,
  p_street    IN DH_BRANCH.STREET%TYPE,
  p_city      IN DH_BRANCH.CITY%TYPE,
  p_postcode  IN DH_BRANCH.POSTCODE%TYPE
) IS
BEGIN
  INSERT INTO DH_BRANCH (
    BRANCHNO,
    STREET,
    CITY,
    POSTCODE
  )
  VALUES (
    p_branchno,
    p_street,
    p_city,
    p_postcode
  );

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END new_branch;
/

-- Compilation check:
-- SHOW ERRORS PROCEDURE NEW_BRANCH;

