SET SERVEROUTPUT ON;

CREATE OR REPLACE PROCEDURE client_update_sp (
    p_clientno  IN DH_CLIENT.CLIENTNO%TYPE,
    p_first_name IN DH_CLIENT.FNAME%TYPE DEFAULT NULL,
    p_last_name  IN DH_CLIENT.LNAME%TYPE DEFAULT NULL,
    p_telephone  IN DH_CLIENT.TELNO%TYPE DEFAULT NULL,
    p_preftype   IN DH_CLIENT.PREFTYPE%TYPE DEFAULT NULL,
    p_maxrent    IN DH_CLIENT.MAXRENT%TYPE DEFAULT NULL
)
IS
BEGIN
    IF p_first_name IS NULL
       AND p_last_name IS NULL
       AND p_telephone IS NULL
       AND p_preftype IS NULL
       AND p_maxrent IS NULL THEN
        RAISE_APPLICATION_ERROR(-20021, 'At least one client field must be changed.');
    END IF;

    UPDATE DH_CLIENT
       SET FNAME    = COALESCE(p_first_name, FNAME),
           LNAME    = COALESCE(p_last_name, LNAME),
           TELNO    = COALESCE(p_telephone, TELNO),
           PREFTYPE = COALESCE(p_preftype, PREFTYPE),
           MAXRENT  = COALESCE(p_maxrent, MAXRENT)
     WHERE CLIENTNO = p_clientno;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20024, 'Client record not found.');
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END client_update_sp;
/

SHOW ERRORS PROCEDURE client_update_sp;
