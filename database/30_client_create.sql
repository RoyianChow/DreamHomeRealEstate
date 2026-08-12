SET SERVEROUTPUT ON;

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
      INTO v_count
      FROM user_sequences
     WHERE sequence_name = 'DH_CLIENTNO_SEQ';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE
            'CREATE SEQUENCE DH_CLIENTNO_SEQ START WITH 1000 INCREMENT BY 1 NOCACHE NOCYCLE';
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE client_create_sp (
    p_first_name IN  DH_CLIENT.FNAME%TYPE,
    p_last_name  IN  DH_CLIENT.LNAME%TYPE,
    p_telephone  IN  DH_CLIENT.TELNO%TYPE,
    p_preftype   IN  DH_CLIENT.PREFTYPE%TYPE,
    p_maxrent    IN  DH_CLIENT.MAXRENT%TYPE,
    p_clientno   OUT DH_CLIENT.CLIENTNO%TYPE
)
IS
    v_exists NUMBER;
BEGIN
    LOOP
        p_clientno := 'CR' || TO_CHAR(DH_CLIENTNO_SEQ.NEXTVAL);

        SELECT COUNT(*)
          INTO v_exists
          FROM DH_CLIENT
         WHERE CLIENTNO = p_clientno;

        EXIT WHEN v_exists = 0;
    END LOOP;

    INSERT INTO DH_CLIENT (
        CLIENTNO, FNAME, LNAME, TELNO, PREFTYPE, MAXRENT
    )
    VALUES (
        p_clientno, p_first_name, p_last_name, p_telephone, p_preftype, p_maxrent
    );

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END client_create_sp;
/

SHOW ERRORS PROCEDURE client_create_sp;
