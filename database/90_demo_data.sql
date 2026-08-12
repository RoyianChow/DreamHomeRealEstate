SET SERVEROUTPUT ON;

PROMPT Removes only this project's reserved demo rows, then recreates them.

DELETE FROM DH_STAFF
 WHERE LOWER(EMAIL) = 'member2.demo@dreamhome.test';

DELETE FROM DH_CLIENT
 WHERE FNAME = 'Member2Demo'
   AND LNAME = 'Client';

DELETE FROM DH_BRANCH
 WHERE BRANCHNO = 'B900';

COMMIT;

BEGIN
    new_branch(
        p_branchno => 'B900',
        p_street   => '900 Demo Street',
        p_city     => 'London',
        p_postcode => 'DE9 0MO'
    );
END;
/

DECLARE
    v_staffno DH_STAFF.STAFFNO%TYPE;
BEGIN
    Staff_hire_sp(
        p_first_name => 'Member2Demo',
        p_last_name  => 'Staff',
        p_position   => 'Assistant',
        p_branchno   => 'B900',
        p_dob        => DATE '2000-01-15',
        p_salary     => 25000,
        p_telephone  => '5559000',
        p_mobile     => '07955590000',
        p_email      => 'member2.demo@dreamhome.test',
        p_staffno    => v_staffno
    );
    DBMS_OUTPUT.PUT_LINE('Demo staff created: ' || v_staffno);
END;
/

DECLARE
    v_clientno DH_CLIENT.CLIENTNO%TYPE;
BEGIN
    client_create_sp(
        p_first_name => 'Member2Demo',
        p_last_name  => 'Client',
        p_telephone  => '5559001',
        p_preftype   => 'House',
        p_maxrent    => 900,
        p_clientno   => v_clientno
    );
    DBMS_OUTPUT.PUT_LINE('Demo client created: ' || v_clientno);
END;
/

PROMPT Demo rows:
SELECT STAFFNO, FNAME, LNAME, BRANCHNO, SALARY, TELEPHONE, EMAIL
  FROM DH_STAFF
 WHERE LOWER(EMAIL) = 'member2.demo@dreamhome.test';

SELECT BRANCHNO, STREET, CITY, POSTCODE
  FROM DH_BRANCH
 WHERE BRANCHNO = 'B900';

SELECT CLIENTNO, FNAME, LNAME, TELNO, PREFTYPE, MAXRENT
  FROM DH_CLIENT
 WHERE FNAME = 'Member2Demo'
   AND LNAME = 'Client';
