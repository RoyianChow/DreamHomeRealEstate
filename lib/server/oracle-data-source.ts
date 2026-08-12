/**
 * Oracle-backed implementation of the Dream Home data-source contract.
 *
 * This module is server-only. It owns the connection pool, uses bind
 * variables for every user value, calls the PL/SQL write procedures, and maps
 * Oracle rows into the JSON field names used by the frontend.
 */

import "server-only";

import oracledb from "oracledb";
import { DataError, type DreamHomeDataSource } from "@/lib/server/contracts";
import type {
  Branch,
  BranchAddress,
  BranchCreateInput,
  BranchUpdateInput,
  Client,
  ClientCreateInput,
  ClientUpdateInput,
  HealthStatus,
  Staff,
  StaffHireInput,
  StaffUpdateInput,
} from "@/lib/types";

type OracleRow = Record<string, unknown>;

type StaffOutBinds = {
  p_staffno?: string;
};

const queryOptions: oracledb.ExecuteOptions = {
  outFormat: oracledb.OUT_FORMAT_OBJECT,
};

const STAFF_SELECT = `
  SELECT STAFFNO,
         FNAME,
         LNAME,
         POSITION,
         BRANCHNO,
         TO_CHAR(DOB, 'YYYY-MM-DD') AS DOB,
         SALARY,
         TELEPHONE,
         MOBILE,
         EMAIL
  FROM DH_STAFF
`;

const BRANCH_SELECT = `
  SELECT BRANCHNO, STREET, CITY, POSTCODE
  FROM DH_BRANCH
`;

const CLIENT_SELECT = `
  SELECT CLIENTNO, FNAME, LNAME, TELNO, PREFTYPE, MAXRENT
  FROM DH_CLIENT
`;

let poolPromise: Promise<oracledb.Pool> | undefined;
let thickModeInitialized = false;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new DataError(
      "DATABASE_ERROR",
      "Oracle configuration is incomplete. Set ORACLE_USER, ORACLE_PASSWORD, and ORACLE_CONNECT_STRING in .env.local.",
    );
  }
  return value;
}

function poolNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

async function getPool(): Promise<oracledb.Pool> {
  if (poolPromise) return poolPromise;

  const user = requiredEnv("ORACLE_USER");
  const password = requiredEnv("ORACLE_PASSWORD");
  const connectString = requiredEnv("ORACLE_CONNECT_STRING");

  if (!thickModeInitialized && process.env.ORACLE_CLIENT_LIB_DIR?.trim()) {
    oracledb.initOracleClient({
      libDir: process.env.ORACLE_CLIENT_LIB_DIR.trim(),
    });
    thickModeInitialized = true;
  }

  poolPromise = oracledb
    .createPool({
      user,
      password,
      connectString,
      poolMin: poolNumber("ORACLE_POOL_MIN", 1),
      poolMax: Math.max(poolNumber("ORACLE_POOL_MAX", 4), 1),
      poolIncrement: Math.max(poolNumber("ORACLE_POOL_INCREMENT", 1), 1),
    })
    .catch((error: unknown) => {
      poolPromise = undefined;
      throw error;
    });

  return poolPromise;
}

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function number(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapStaff(row: OracleRow): Staff {
  return {
    staffNo: text(row.STAFFNO),
    firstName: text(row.FNAME),
    lastName: text(row.LNAME),
    position: text(row.POSITION),
    branchNo: text(row.BRANCHNO),
    dob: text(row.DOB),
    salary: number(row.SALARY),
    telephone: text(row.TELEPHONE),
    mobile: text(row.MOBILE),
    email: text(row.EMAIL),
  };
}

function mapBranch(row: OracleRow): Branch {
  return {
    branchNo: text(row.BRANCHNO),
    street: text(row.STREET),
    city: text(row.CITY),
    postcode: text(row.POSTCODE),
  };
}

function mapClient(row: OracleRow): Client {
  return {
    clientNo: text(row.CLIENTNO),
    firstName: text(row.FNAME),
    lastName: text(row.LNAME),
    telephone: text(row.TELNO),
    preferredPropertyType: text(row.PREFTYPE) as Client["preferredPropertyType"],
    maxRent: number(row.MAXRENT),
  };
}

async function one<T extends OracleRow>(
  connection: oracledb.Connection,
  sql: string,
  binds: oracledb.BindParameters,
  notFoundMessage: string,
): Promise<T> {
  const result = await connection.execute<T>(sql, binds, queryOptions);
  const row = result.rows?.[0];
  if (!row) throw new DataError("NOT_FOUND", notFoundMessage);
  return row;
}

function mapOracleError(error: unknown): DataError {
  if (error instanceof DataError) return error;

  const errorNumber =
    typeof error === "object" && error !== null && "errorNum" in error
      ? Number((error as { errorNum?: unknown }).errorNum)
      : undefined;

  switch (errorNumber) {
    case 1:
      return new DataError("DUPLICATE", "That record already exists.");
    case 1400:
    case 2290:
    case 12899:
      return new DataError("VALIDATION_ERROR", "The submitted values are not valid for Oracle.");
    case 1403:
    case 2291:
    case 20002:
    case 20003:
    case 20005:
    case 20007:
      return new DataError("NOT_FOUND", "The requested record could not be found.");
    case 20001:
    case 20004:
    case 20006:
      return new DataError("VALIDATION_ERROR", "Provide at least one field to update.");
    default:
      return new DataError("DATABASE_ERROR", "The Oracle operation could not be completed.");
  }
}

async function withConnection<T>(
  work: (connection: oracledb.Connection) => Promise<T>,
): Promise<T> {
  let connection: oracledb.Connection | undefined;

  try {
    connection = await (await getPool()).getConnection();
    return await work(connection);
  } catch (error) {
    throw mapOracleError(error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch {
        // The original operation's result is more useful than a release error.
      }
    }
  }
}

async function staffByNo(connection: oracledb.Connection, staffNo: string): Promise<Staff> {
  const row = await one<OracleRow>(
    connection,
    `${STAFF_SELECT} WHERE STAFFNO = :staffNo`,
    { staffNo: staffNo.trim().toUpperCase() },
    `No staff member with number ${staffNo.trim().toUpperCase()}.`,
  );
  return mapStaff(row);
}

async function branchByNo(connection: oracledb.Connection, branchNo: string): Promise<Branch> {
  const normalized = branchNo.trim().toUpperCase();
  const row = await one<OracleRow>(
    connection,
    `${BRANCH_SELECT} WHERE BRANCHNO = :branchNo`,
    { branchNo: normalized },
    `No branch found with number ${normalized}.`,
  );
  return mapBranch(row);
}

async function clientByNo(connection: oracledb.Connection, clientNo: string): Promise<Client> {
  const normalized = clientNo.trim().toUpperCase();
  const row = await one<OracleRow>(
    connection,
    `${CLIENT_SELECT} WHERE CLIENTNO = :clientNo`,
    { clientNo: normalized },
    `No client with number ${normalized}.`,
  );
  return mapClient(row);
}

export const oracleDataSource: DreamHomeDataSource = {
  async health(): Promise<HealthStatus> {
    return withConnection(async (connection) => {
      await connection.execute("SELECT 1 AS OK FROM DUAL");
      return {
        dataSource: "oracle",
        connected: true,
        detail: "Oracle database connected",
        checkedAt: new Date().toISOString(),
      };
    });
  },

  async listStaff(): Promise<Staff[]> {
    return withConnection(async (connection) => {
      const result = await connection.execute<OracleRow>(
        `${STAFF_SELECT} ORDER BY STAFFNO`,
        {},
        queryOptions,
      );
      return (result.rows ?? []).map(mapStaff);
    });
  },

  async hireStaff(input: StaffHireInput): Promise<Staff> {
    return withConnection(async (connection) => {
      const result = await connection.execute<StaffOutBinds>(
        `BEGIN
           Staff_hire_sp(
             p_fname      => :p_fname,
             p_lname      => :p_lname,
             p_position   => :p_position,
             p_branchno   => :p_branchno,
             p_dob        => TO_DATE(:p_dob, 'YYYY-MM-DD'),
             p_salary     => :p_salary,
             p_telephone  => :p_telephone,
             p_mobile     => :p_mobile,
             p_email      => :p_email,
             p_staffno    => :p_staffno
           );
         END;`,
        {
          p_fname: input.firstName,
          p_lname: input.lastName,
          p_position: input.position,
          p_branchno: input.branchNo.trim().toUpperCase(),
          p_dob: input.dob,
          p_salary: input.salary,
          p_telephone: input.telephone,
          p_mobile: input.mobile,
          p_email: input.email,
          p_staffno: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
        },
      );
      const staffNo = text(result.outBinds?.p_staffno);
      if (!staffNo) {
        throw new DataError("DATABASE_ERROR", "Oracle did not return the new staff number.");
      }
      return staffByNo(connection, staffNo);
    });
  },

  async updateStaff(staffNo: string, input: StaffUpdateInput): Promise<Staff> {
    return withConnection(async (connection) => {
      await connection.execute(
        `BEGIN
           Staff_update_sp(
             p_staffno   => :p_staffno,
             p_salary    => :p_salary,
             p_telephone => :p_telephone,
             p_email     => :p_email
           );
         END;`,
        {
          p_staffno: staffNo.trim().toUpperCase(),
          p_salary: { val: input.salary ?? null, type: oracledb.NUMBER },
          p_telephone: { val: input.telephone ?? null, type: oracledb.STRING, maxSize: 20 },
          p_email: { val: input.email ?? null, type: oracledb.STRING, maxSize: 100 },
        },
      );
      return staffByNo(connection, staffNo);
    });
  },

  async listBranches(): Promise<Branch[]> {
    return withConnection(async (connection) => {
      const result = await connection.execute<OracleRow>(
        `${BRANCH_SELECT} ORDER BY BRANCHNO`,
        {},
        queryOptions,
      );
      return (result.rows ?? []).map(mapBranch);
    });
  },

  async getBranchAddress(branchNo: string): Promise<BranchAddress> {
    return withConnection(async (connection) => {
      const normalized = branchNo.trim().toUpperCase();
      const result = await connection.execute<{
        p_street?: string;
        p_city?: string;
      }>(
        `BEGIN
           branch_address_sp(
             p_branchno => :p_branchno,
             p_street   => :p_street,
             p_city     => :p_city
           );
         END;`,
        {
          p_branchno: normalized,
          p_street: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
          p_city: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
        },
      );
      return {
        branchNo: normalized,
        street: text(result.outBinds?.p_street),
        city: text(result.outBinds?.p_city),
      };
    });
  },

  async createBranch(input: BranchCreateInput): Promise<Branch> {
    return withConnection(async (connection) => {
      const branchNo = input.branchNo.trim().toUpperCase();
      await connection.execute(
        `BEGIN
           new_branch(
             p_branchno => :p_branchno,
             p_street   => :p_street,
             p_city     => :p_city,
             p_postcode => :p_postcode
           );
         END;`,
        {
          p_branchno: branchNo,
          p_street: input.street,
          p_city: input.city,
          p_postcode: input.postcode,
        },
      );
      return branchByNo(connection, branchNo);
    });
  },

  async updateBranch(branchNo: string, input: BranchUpdateInput): Promise<Branch> {
    return withConnection(async (connection) => {
      await connection.execute(
        `BEGIN
           branch_update_sp(
             p_branchno => :p_branchno,
             p_street   => :p_street,
             p_city     => :p_city,
             p_postcode => :p_postcode
           );
         END;`,
        {
          p_branchno: branchNo.trim().toUpperCase(),
          p_street: { val: input.street ?? null, type: oracledb.STRING, maxSize: 60 },
          p_city: { val: input.city ?? null, type: oracledb.STRING, maxSize: 40 },
          p_postcode: { val: input.postcode ?? null, type: oracledb.STRING, maxSize: 12 },
        },
      );
      return branchByNo(connection, branchNo);
    });
  },

  async listClients(): Promise<Client[]> {
    return withConnection(async (connection) => {
      const result = await connection.execute<OracleRow>(
        `${CLIENT_SELECT} ORDER BY CLIENTNO`,
        {},
        queryOptions,
      );
      return (result.rows ?? []).map(mapClient);
    });
  },

  async createClient(input: ClientCreateInput): Promise<Client> {
    return withConnection(async (connection) => {
      const result = await connection.execute<{ p_clientno?: string }>(
        `BEGIN
           client_create_sp(
             p_fname    => :p_fname,
             p_lname    => :p_lname,
             p_telno    => :p_telno,
             p_preftype => :p_preftype,
             p_maxrent  => :p_maxrent,
             p_clientno => :p_clientno
           );
         END;`,
        {
          p_fname: input.firstName,
          p_lname: input.lastName,
          p_telno: input.telephone,
          p_preftype: input.preferredPropertyType,
          p_maxrent: input.maxRent,
          p_clientno: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
        },
      );
      const clientNo = text(result.outBinds?.p_clientno);
      if (!clientNo) {
        throw new DataError("DATABASE_ERROR", "Oracle did not return the new client number.");
      }
      return clientByNo(connection, clientNo);
    });
  },

  async updateClient(clientNo: string, input: ClientUpdateInput): Promise<Client> {
    return withConnection(async (connection) => {
      await connection.execute(
        `BEGIN
           client_update_sp(
             p_clientno  => :p_clientno,
             p_fname     => :p_fname,
             p_lname     => :p_lname,
             p_telno     => :p_telno,
             p_preftype  => :p_preftype,
             p_maxrent   => :p_maxrent
           );
         END;`,
        {
          p_clientno: clientNo.trim().toUpperCase(),
          p_fname: { val: input.firstName ?? null, type: oracledb.STRING, maxSize: 50 },
          p_lname: { val: input.lastName ?? null, type: oracledb.STRING, maxSize: 50 },
          p_telno: { val: input.telephone ?? null, type: oracledb.STRING, maxSize: 20 },
          p_preftype: { val: input.preferredPropertyType ?? null, type: oracledb.STRING, maxSize: 50 },
          p_maxrent: { val: input.maxRent ?? null, type: oracledb.NUMBER },
        },
      );
      return clientByNo(connection, clientNo);
    });
  },
};

