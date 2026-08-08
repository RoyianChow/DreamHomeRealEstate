/**
 * In-memory stand-in for the Oracle schema.
 *
 * WHY THIS EXISTS: the delivery plan freezes the API contract in Week 1 so the
 * website can be built against mock responses while the PL/SQL and the Oracle
 * endpoints are still in progress. This file is the mock. It is never used
 * when DATA_SOURCE=oracle, and it contains no database code of any kind.
 *
 * It deliberately reproduces the rules the database will enforce - duplicate
 * keys, unknown branch numbers, immutable primary keys - so the UI error paths
 * are exercised before the real database is connected.
 */

import "server-only";

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

type Store = {
  staff: Staff[];
  branches: Branch[];
  clients: Client[];
  staffSequence: number;
  clientSequence: number;
};

/** Kept on globalThis so the data survives Fast Refresh during development. */
const globalStore = globalThis as unknown as { __dreamHomeStore?: Store };

function seed(): Store {
  return {
    staff: [
      {
        staffNo: "SG5",
        firstName: "Susan",
        lastName: "Brand",
        position: "Manager",
        branchNo: "B003",
        dob: "1960-06-03",
        salary: 24000,
        telephone: "0141 339 2178",
        mobile: "07771 900 512",
        email: "susan.brand@dreamhome.example",
      },
      {
        staffNo: "SG14",
        firstName: "David",
        lastName: "Ford",
        position: "Supervisor",
        branchNo: "B003",
        dob: "1978-03-24",
        salary: 18000,
        telephone: "0141 339 2178",
        mobile: "07771 900 513",
        email: "david.ford@dreamhome.example",
      },
      {
        staffNo: "SL21",
        firstName: "John",
        lastName: "White",
        position: "Manager",
        branchNo: "B005",
        dob: "1975-10-01",
        salary: 30000,
        telephone: "0171 886 1212",
        mobile: "07771 900 514",
        email: "john.white@dreamhome.example",
      },
      {
        staffNo: "SA9",
        firstName: "Mary",
        lastName: "Howe",
        position: "Assistant",
        branchNo: "B007",
        dob: "1990-02-19",
        salary: 21000,
        telephone: "01224 67125",
        mobile: "07771 900 515",
        email: "mary.howe@dreamhome.example",
      },
    ],
    branches: [
      { branchNo: "B003", street: "163 Main St", city: "Glasgow", postcode: "G11 9QX" },
      { branchNo: "B005", street: "22 Deer Rd", city: "London", postcode: "SW1 4EH" },
      { branchNo: "B007", street: "16 Argyll St", city: "Aberdeen", postcode: "AB2 3SU" },
    ],
    clients: [
      {
        clientNo: "CR76",
        firstName: "John",
        lastName: "Kay",
        telephone: "0207 774 5632",
        preferredPropertyType: "Flat",
        maxRent: 425,
      },
      {
        clientNo: "CR56",
        firstName: "Aline",
        lastName: "Stewart",
        telephone: "0141 848 1825",
        preferredPropertyType: "Flat",
        maxRent: 350,
      },
      {
        clientNo: "CR74",
        firstName: "Mike",
        lastName: "Ritchie",
        telephone: "01475 392 178",
        preferredPropertyType: "House",
        maxRent: 750,
      },
    ],
    staffSequence: 100,
    clientSequence: 100,
  };
}

function store(): Store {
  globalStore.__dreamHomeStore ??= seed();
  return globalStore.__dreamHomeStore;
}

/** Small delay so loading states are visible while developing the UI. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 180));

const key = (value: string) => value.trim().toUpperCase();

/**
 * Mock STAFFNO generator. The real generator is Member 2's decision (sequence,
 * trigger, or a MAX+1 lookup inside Staff_hire_sp) - the UI only requires that
 * the value comes back in the insert response, never that it has a shape.
 */
function nextStaffNo(): string {
  const data = store();
  data.staffSequence += 1;
  return `SN${data.staffSequence}`;
}

function nextClientNo(): string {
  const data = store();
  data.clientSequence += 1;
  return `CN${data.clientSequence}`;
}

export const mockDataSource: DreamHomeDataSource = {
  async health(): Promise<HealthStatus> {
    await settle();
    const data = store();
    return {
      dataSource: "mock",
      connected: true,
      detail: `In-memory sample data · ${data.staff.length} staff · ${data.branches.length} branches · ${data.clients.length} clients`,
      checkedAt: new Date().toISOString(),
    };
  },

  /* ------------------------------------------------------------- staff */

  async listStaff() {
    await settle();
    return [...store().staff].sort((a, b) => a.staffNo.localeCompare(b.staffNo));
  },

  async hireStaff(input: StaffHireInput) {
    await settle();
    const data = store();

    // Mirrors the DH_STAFF -> DH_BRANCH foreign key.
    if (!data.branches.some((branch) => branch.branchNo === key(input.branchNo))) {
      throw new DataError(
        "NOT_FOUND",
        `Branch ${key(input.branchNo)} does not exist. Open the branch first, then hire staff into it.`,
      );
    }

    if (data.staff.some((member) => member.email.toLowerCase() === input.email.toLowerCase())) {
      throw new DataError("DUPLICATE", `A staff member already uses ${input.email}.`);
    }

    const created: Staff = {
      ...input,
      branchNo: key(input.branchNo),
      staffNo: nextStaffNo(),
    };
    data.staff.push(created);
    return created;
  },

  async updateStaff(staffNo: string, input: StaffUpdateInput) {
    await settle();
    const data = store();
    const existing = data.staff.find((member) => member.staffNo === key(staffNo));

    if (!existing) {
      throw new DataError("NOT_FOUND", `No staff member with number ${key(staffNo)}.`);
    }

    // STAFFNO and every other column outside the allowlist are untouched.
    Object.assign(existing, input);
    return existing;
  },

  /* ------------------------------------------------------------ branch */

  async listBranches() {
    await settle();
    return [...store().branches].sort((a, b) => a.branchNo.localeCompare(b.branchNo));
  },

  async getBranchAddress(branchNo: string): Promise<BranchAddress> {
    await settle();
    const found = store().branches.find((branch) => branch.branchNo === key(branchNo));

    if (!found) {
      throw new DataError("NOT_FOUND", `No branch found with number ${key(branchNo)}.`);
    }

    return { branchNo: found.branchNo, street: found.street, city: found.city };
  },

  async createBranch(input: BranchCreateInput) {
    await settle();
    const data = store();

    if (data.branches.some((branch) => branch.branchNo === key(input.branchNo))) {
      throw new DataError("DUPLICATE", `Branch ${key(input.branchNo)} already exists.`);
    }

    const created: Branch = { ...input, branchNo: key(input.branchNo) };
    data.branches.push(created);
    return created;
  },

  async updateBranch(branchNo: string, input: BranchUpdateInput) {
    await settle();
    const existing = store().branches.find((branch) => branch.branchNo === key(branchNo));

    if (!existing) {
      throw new DataError("NOT_FOUND", `No branch found with number ${key(branchNo)}.`);
    }

    // BRANCHNO is not in BranchUpdateInput, so it cannot be changed here.
    Object.assign(existing, input);
    return existing;
  },

  /* ------------------------------------------------------------ client */

  async listClients() {
    await settle();
    return [...store().clients].sort((a, b) => a.clientNo.localeCompare(b.clientNo));
  },

  async createClient(input: ClientCreateInput) {
    await settle();
    const data = store();
    const created: Client = { ...input, clientNo: nextClientNo() };
    data.clients.push(created);
    return created;
  },

  async updateClient(clientNo: string, input: ClientUpdateInput) {
    await settle();
    const existing = store().clients.find((client) => client.clientNo === key(clientNo));

    if (!existing) {
      throw new DataError("NOT_FOUND", `No client found with number ${key(clientNo)}.`);
    }

    // CLIENTNO is not in ClientUpdateInput, so it stays exactly as it was.
    Object.assign(existing, input);
    return existing;
  },
};
