import { getDataSource } from "@/lib/server/data-source";
import { fail, handleUnexpected, ok, readJson } from "@/lib/server/http";
import { clientUpdateSchema, validate } from "@/lib/validation";
import type { ClientUpdateInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/clients/[clientNo] - first name, last name, telephone, preferred
 * property type and maximum rent, together or as selected fields.
 *
 * CLIENTNO comes from the URL and is used only to locate the record.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ clientNo: string }> },
) {
  try {
    const { clientNo } = await params;
    const parsed = validate(clientUpdateSchema, await readJson(request));
    if (!parsed.ok) {
      return fail("VALIDATION_ERROR", parsed.message, parsed.fieldErrors);
    }

    const dataSource = await getDataSource();
    return ok(await dataSource.updateClient(clientNo, parsed.value as ClientUpdateInput));
  } catch (error) {
    return handleUnexpected(error, "PATCH /api/clients/[clientNo]");
  }
}
