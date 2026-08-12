# Database Notes

## DH_BRANCH
- BRANCHNO VARCHAR2(50), primary key
- STREET VARCHAR2(50)
- CITY VARCHAR2(50)
- POSTCODE VARCHAR2(50)

## DH_STAFF
- STAFFNO VARCHAR2(50), primary key
- FNAME VARCHAR2(50)
- LNAME VARCHAR2(50)
- POSITION VARCHAR2(50)
- SEX VARCHAR2(50)
- DOB DATE
- SALARY NUMBER(7)
- BRANCHNO VARCHAR2(50), foreign key to DH_BRANCH
- TELEPHONE VARCHAR2(16)
- MOBILE VARCHAR2(16)
- EMAIL VARCHAR2(50)

STAFFNO is generated with DH_STAFFNO_SEQ and an ST prefix.

## DH_CLIENT
- CLIENTNO VARCHAR2(50), primary key
- FNAME VARCHAR2(30)
- LNAME VARCHAR2(30)
- TELNO CHAR(20)
- STREET VARCHAR2(30)
- CITY VARCHAR2(30)
- EMAIL VARCHAR2(40)
- PREFTYPE VARCHAR2(5)
- MAXRENT NUMERIC

CLIENTNO is generated with DH_CLIENTNO_SEQ and a CR prefix.

## Update Rules
- Staff: salary, telephone, email
- Branch: street, city, postcode
- Client: first name, last name, telephone, preferred property type, max rent
- STAFFNO, BRANCHNO, and CLIENTNO are not changed during updates.
