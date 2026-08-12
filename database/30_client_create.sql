-- Dream Home Real Estate
-- DB-3: collision-safe CLIENTNO generation and client registration.
--
-- The current application contract collects five fields:
--   FNAME, LNAME, TELNO, PREFTYPE, MAXRENT
-- The other DH_CLIENT columns are nullable and are intentionally left NULL.
-- New IDs use the CR1000, CR1001, ... format, distinct from existing CR34,
-- CR45, ... sample IDs.

SET DEFINE OFF;

-------------------------------------------------------------------------------
-- Create the generator once. Re-running this file leaves the sequence in
-- place and continues from its current value.
-------------------------------------------------------------------------------
BEGIN
  EXECUTE IMMEDIATE q'[
    CREATE SEQUENCE DH_CLIENTNO_SEQ
      START WITH 1000
      INCREMENT BY 1
      NOCACHE
      NOCYCLE
  ]';
EXCEPTION
  WHEN OTHERS THEN
    -- ORA-00955: name is already used by an existing object.
    IF SQLCODE != -955 THEN
      RAISE;
    END IF;
END;
/

-------------------------------------------------------------------------------
-- Register a client and return the generated CLIENTNO.
-------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE client_create_sp (
  p_fname       IN  DH_CLIENT.FNAME%TYPE,
  p_lname       IN  DH_CLIENT.LNAME%TYPE,
  p_telno       IN  DH_CLIENT.TELNO%TYPE,
  p_preftype    IN  DH_CLIENT.PREFTYPE%TYPE,
  p_maxrent     IN  DH_CLIENT.MAXRENT%TYPE,
  p_clientno    OUT DH_CLIENT.CLIENTNO%TYPE
) IS
  v_exists PLS_INTEGER;
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
    CLIENTNO,
    FNAME,
    LNAME,
    TELNO,
    PREFTYPE,
    MAXRENT
  )
  VALUES (
    p_clientno,
    p_fname,
    p_lname,
    p_telno,
    p_preftype,
    p_maxrent
  );

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END client_create_sp;
/

-- Compilation check:
-- SHOW ERRORS PROCEDURE CLIENT_CREATE_SP;
