  -- Dream Home Real Estate
  -- DB-4: compile every project procedure and report invalid objects.
  -- This script changes procedure metadata only; it does not insert, update, or
  -- delete any table rows.
  
  SET SERVEROUTPUT ON;
  
  BEGIN
    FOR object_row IN (
      SELECT object_name
      FROM user_objects
      WHERE object_type = 'PROCEDURE'
        AND object_name IN (
          'STAFF_HIRE_SP',
          'STAFF_UPDATE_SP',
          'NEW_BRANCH',
          'BRANCH_ADDRESS_SP',
          'BRANCH_UPDATE_SP',
          'CLIENT_CREATE_SP',
          'CLIENT_UPDATE_SP'
        )
      ORDER BY object_name
    ) LOOP
      BEGIN
        EXECUTE IMMEDIATE
          'ALTER PROCEDURE ' || object_row.object_name || ' COMPILE';
        DBMS_OUTPUT.PUT_LINE(object_row.object_name || ' compiled');
      EXCEPTION
        WHEN OTHERS THEN
          DBMS_OUTPUT.PUT_LINE(
            object_row.object_name || ' compile command failed: ' || SQLERRM
          );
      END;
    END LOOP;
  END;
  /
  
  PROMPT === Object status ===
  SELECT object_name,
         object_type,
         status
  FROM user_objects
  WHERE object_name IN (
    'STAFF_HIRE_SP',
    'STAFF_UPDATE_SP',
    'NEW_BRANCH',
    'BRANCH_ADDRESS_SP',
    'BRANCH_UPDATE_SP',
    'CLIENT_CREATE_SP',
    'CLIENT_UPDATE_SP'
  )
  ORDER BY object_type, object_name;
  
  PROMPT === Compiler errors (zero rows required) ===
  SELECT name,
         type,
         line,
         position,
         text
  FROM user_errors
  WHERE name IN (
    'STAFF_HIRE_SP',
    'STAFF_UPDATE_SP',
    'NEW_BRANCH',
    'BRANCH_ADDRESS_SP',
    'BRANCH_UPDATE_SP',
    'CLIENT_CREATE_SP',
    'CLIENT_UPDATE_SP'
  )
  ORDER BY name, sequence;
  
