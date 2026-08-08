import { getDataSource } from "@/lib/server/data-source";
import { created, fail, handleUnexpected, ok, readJson } from "@/lib/server/http";
import { clientCreateSchema, validate } from "@/lib/validation";
import type { ClientCreateInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/clients - every DH_CLIENT row. */
export async function GET() {
  try {
    const dataSource = await getDataSource();
    return ok(await dataSource.listClients());
  } catch (error) {
    return handleUnexpected(error, "GET /api/clients");
  }
}

/** POST /api/clients - registers a client; CLIENTNO is generated server side. */
export async function POST(request: Request) {
  try {
    const parsed = validate(clientCreateSchema, await readJson(request));
    if (!parsed.ok) {
      return fail("VALIDATION_ERROR", parsed.message, parsed.fieldErrors);
    }

    const dataSource = await getDataSource();
    return created(await dataSource.createClient(parsed.value as ClientCreateInput));
  } catch (error) {
    return handleUnexpected(error, "POST /api/clients");
  }
}
