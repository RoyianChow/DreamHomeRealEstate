/**
 * Typed API client (deliverable P0-3 / UI-1).
 *
 * Page components call these functions and never touch `fetch` directly, so
 * request shape, error handling and status-code mapping live in one place.
 * Nothing here throws for an expected failure - every call resolves to an
 * `ApiResult` that the UI can render.
 */

import type {
  ApiEnvelope,
  ApiResult,
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

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
      message:
        "Could not reach the server. Check that the application is running and try again.",
    };
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (response.ok && payload?.success) {
    return { ok: true, data: payload.data };
  }

  if (payload && payload.success === false) {
    return {
      ok: false,
      status: response.status,
      code: payload.error.code,
      message: payload.error.message,
      fieldErrors: payload.error.fieldErrors,
    };
  }

  return {
    ok: false,
    status: response.status,
    code: "SERVER_ERROR",
    message: `The server returned an unexpected response (${response.status}).`,
  };
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });
const key = (value: string) => encodeURIComponent(value.trim().toUpperCase());

/* ---------------------------------------------------------------- health */

export const health = {
  check: () => request<HealthStatus>("/api/health"),
};

/* ----------------------------------------------------------------- staff */

export const staffApi = {
  list: () => request<Staff[]>("/api/staff"),

  /** POST /api/staff -> Staff_hire_sp. STAFFNO comes back in the response. */
  hire: (input: StaffHireInput) =>
    request<Staff>("/api/staff", { method: "POST", ...json(input) }),

  /** PATCH accepts salary, telephone and email only. */
  update: (staffNo: string, input: StaffUpdateInput) =>
    request<Staff>(`/api/staff/${key(staffNo)}`, { method: "PATCH", ...json(input) }),
};

/* ---------------------------------------------------------------- branch */

export const branchApi = {
  list: () => request<Branch[]>("/api/branches"),

  /** The required street + city lookup by BRANCHNO. */
  address: (branchNo: string) =>
    request<BranchAddress>(`/api/branches/${key(branchNo)}/address`),

  /** POST /api/branches -> new_branch. */
  create: (input: BranchCreateInput) =>
    request<Branch>("/api/branches", { method: "POST", ...json(input) }),

  /** BRANCHNO is never part of the payload. */
  update: (branchNo: string, input: BranchUpdateInput) =>
    request<Branch>(`/api/branches/${key(branchNo)}`, { method: "PATCH", ...json(input) }),
};

/* ---------------------------------------------------------------- client */

export const clientApi = {
  list: () => request<Client[]>("/api/clients"),

  create: (input: ClientCreateInput) =>
    request<Client>("/api/clients", { method: "POST", ...json(input) }),

  /** CLIENTNO locates the row and is never part of the payload. */
  update: (clientNo: string, input: ClientUpdateInput) =>
    request<Client>(`/api/clients/${key(clientNo)}`, { method: "PATCH", ...json(input) }),
};
