SET SERVEROUTPUT ON;

CREATE OR REPLACE FUNCTION get_branch_address (
    p_branchno IN DH_BRANCH.BRANCHNO%TYPE
)
RETURN VARCHAR2
IS
    v_street DH_BRANCH.STREET%TYPE;
    v_city   DH_BRANCH.CITY%TYPE;
BEGIN
    SELECT STREET, CITY
      INTO v_street, v_city
      FROM DH_BRANCH
     WHERE BRANCHNO = p_branchno;

    RETURN v_street || ', ' || v_city;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE;
END get_branch_address;
/

SHOW ERRORS FUNCTION get_branch_address;

CREATE OR REPLACE PROCEDURE get_branch_address_sp (
    p_branchno IN  DH_BRANCH.BRANCHNO%TYPE,
    p_street   OUT DH_BRANCH.STREET%TYPE,
    p_city     OUT DH_BRANCH.CITY%TYPE
)
IS
BEGIN
    SELECT STREET, CITY
      INTO p_street, p_city
      FROM DH_BRANCH
     WHERE BRANCHNO = p_branchno;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE;
END get_branch_address_sp;
/

SHOW ERRORS PROCEDURE get_branch_address_sp;
