/**
 * The server-side contract every data source must satisfy.
 *
 * ROLE BOUNDARY (see docs/api-contract.md): the route handlers depend only on
 * this interface. The Oracle-backed implementation uses node-oracledb
 * pool, bind variables, commit/rollback - and returns it from `getDataSource()`
 * in data-source.ts. Nothing in app/ or components/ changes when that happens.
 */

import type {
  ApiErrorCode,
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

export interface DreamHomeDataSource {
  health(): Promise<HealthStatus>;

  listStaff(): Promise<Staff[]>;
  /** Calls Staff_hire_sp and returns the row including the generated STAFFNO. */
  hireStaff(input: StaffHireInput): Promise<Staff>;
  /** Allowlist enforced by the caller: salary, telephone, email. */
  updateStaff(staffNo: string, input: StaffUpdateInput): Promise<Staff>;

  listBranches(): Promise<Branch[]>;
  /** The required BRANCHNO -> street + city lookup against DH_BRANCH. */
  getBranchAddress(branchNo: string): Promise<BranchAddress>;
  /** Calls new_branch. */
  createBranch(input: BranchCreateInput): Promise<Branch>;
  updateBranch(branchNo: string, input: BranchUpdateInput): Promise<Branch>;

  listClients(): Promise<Client[]>;
  createClient(input: ClientCreateInput): Promise<Client>;
  updateClient(clientNo: string, input: ClientUpdateInput): Promise<Client>;
}

/**
 * Error type a data source throws. The route handlers turn it into the agreed
 * status code and a safe message - an Oracle error text never reaches the
 * browser unless the implementation deliberately puts it in `message`.
 */
export class DataError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "DataError";
    this.code = code;
  }
}
