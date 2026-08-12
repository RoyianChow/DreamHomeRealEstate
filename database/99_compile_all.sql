SET SERVEROUTPUT ON;
SET DEFINE OFF;

PROMPT Dream Home - Member 2 compile/build script

@@10_staff_hire_sp.sql
@@11_staff_update.sql
@@20_new_branch.sql
@@21_branch_address.sql
@@22_branch_update.sql
@@30_client_create.sql
@@31_client_update.sql

PROMPT

COLUMN object_name FORMAT A30
COLUMN object_type FORMAT A20
COLUMN status FORMAT A10

SELECT object_name, object_type, status
  FROM user_objects
 WHERE object_name IN (
       'STAFF_HIRE_SP',
       'STAFF_UPDATE_SP',
       'NEW_BRANCH',
       'GET_BRANCH_ADDRESS',
       'GET_BRANCH_ADDRESS_SP',
       'BRANCH_UPDATE_SP',
       'CLIENT_CREATE_SP',
       'CLIENT_UPDATE_SP',
       'DH_STAFFNO_SEQ',
       'DH_CLIENTNO_SEQ'
 )
 ORDER BY object_type, object_name;

PROMPT

SELECT object_name, object_type, status
  FROM user_objects
 WHERE object_name IN (
       'STAFF_HIRE_SP',
       'STAFF_UPDATE_SP',
       'NEW_BRANCH',
       'GET_BRANCH_ADDRESS',
       'GET_BRANCH_ADDRESS_SP',
       'BRANCH_UPDATE_SP',
       'CLIENT_CREATE_SP',
       'CLIENT_UPDATE_SP'
 )
   AND status <> 'VALID'
 ORDER BY object_type, object_name;

PROMPT

SELECT name, type, line, position, text
  FROM user_errors
 WHERE name IN (
       'STAFF_HIRE_SP',
       'STAFF_UPDATE_SP',
       'NEW_BRANCH',
       'GET_BRANCH_ADDRESS',
       'GET_BRANCH_ADDRESS_SP',
       'BRANCH_UPDATE_SP',
       'CLIENT_CREATE_SP',
       'CLIENT_UPDATE_SP'
 )
 ORDER BY name, sequence;

PROMPT Build finished.
