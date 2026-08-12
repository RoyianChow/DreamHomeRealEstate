/**
 * Response envelope and error mapping for every route handler.
 *
 * Contract (docs/api-contract.md):
 *   success -> { success: true, data }
 *   failure -> { success: false, error: { message, code, fieldErrors? } }
 * Status codes: 200/201 success, 400 validation, 404 missing, 409 duplicate,
 * 500 safe server error. Raw SQL, credentials and stack traces never appear.
 */

import "server-only";

import { NextResponse } from "next/server";
import { DataError } from "@/lib/server/contracts";
import type { ApiErrorCode, ApiFailure, ApiSuccess, FieldErrors } from "@/lib/types";

const STATUS_FOR: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  DUPLICATE: 409,
  DATABASE_ERROR: 500,
  NETWORK_ERROR: 503,
  SERVER_ERROR: 500,
};

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data } as ApiSuccess<T>, { status });
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, 201);
}

export function fail(
  code: ApiErrorCode,
  message: string,
  fieldErrors?: FieldErrors,
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, error: { code, message, fieldErrors } } as ApiFailure,
    { status: STATUS_FOR[code] },
  );
}

/** Reads and parses a JSON body without throwing on malformed input. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Last line of defence. A DataError carries a message that was written for the
 * user; anything else is logged on the server and replaced with a generic text.
 */
export function handleUnexpected(error: unknown, context: string): NextResponse<ApiFailure> {
  if (error instanceof DataError) {
    return fail(error.code, error.message);
  }

  console.error(`[${context}]`, error);
  return fail(
    "SERVER_ERROR",
    "The request could not be completed. Please try again, and report it if it keeps happening.",
  );
}
