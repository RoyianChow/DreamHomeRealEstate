-- Dream Home Real Estate
-- DB-3: permitted client updates.
--
-- CLIENTNO is used only to locate the row. The procedure can update only:
--   FNAME, LNAME, TELNO, PREFTYPE, MAXRENT
-- NULL parameters mean "leave this field unchanged".

SET DEFINE OFF;

CREATE OR REPLACE PROCEDURE client_update_sp (
  p_clientno    IN DH_CLIENT.CLIENTNO%TYPE,
  p_fname       IN DH_CLIENT.FNAME%TYPE DEFAULT NULL,
  p_lname       IN DH_CLIENT.LNAME%TYPE DEFAULT NULL,
  p_telno       IN DH_CLIENT.TELNO%TYPE DEFAULT NULL,
  p_preftype    IN DH_CLIENT.PREFTYPE%TYPE DEFAULT NULL,
  p_maxrent     IN DH_CLIENT.MAXRENT%TYPE DEFAULT NULL
) IS
BEGIN
  IF p_fname IS NULL
     AND p_lname IS NULL
     AND p_telno IS NULL
     AND p_preftype IS NULL
     AND p_maxrent IS NULL
  THEN
    RAISE_APPLICATION_ERROR(
      -20006,
      'At least one client field is required'
    );
  END IF;

  UPDATE DH_CLIENT
  SET FNAME = CASE
                WHEN p_fname IS NOT NULL THEN p_fname
                ELSE FNAME
              END,
      LNAME = CASE
                WHEN p_lname IS NOT NULL THEN p_lname
                ELSE LNAME
              END,
      TELNO = CASE
                WHEN p_telno IS NOT NULL THEN p_telno
                ELSE TELNO
              END,
      PREFTYPE = CASE
                   WHEN p_preftype IS NOT NULL THEN p_preftype
                   ELSE PREFTYPE
                 END,
      MAXRENT = CASE
                  WHEN p_maxrent IS NOT NULL THEN p_maxrent
                  ELSE MAXRENT
                END
  WHERE CLIENTNO = p_clientno;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20007, 'Client was not found');
  END IF;

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END client_update_sp;
/

-- Compilation check:
-- SHOW ERRORS PROCEDURE CLIENT_UPDATE_SP;

