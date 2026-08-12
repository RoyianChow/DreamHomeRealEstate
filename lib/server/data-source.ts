/**
 * Chooses the data source for this process.
 *
 * DATA_SOURCE=mock   -> in-memory sample data (front-end development, no Oracle)
 * DATA_SOURCE=oracle -> the server-only node-oracledb implementation
 */

import "server-only";

import { DataError, type DreamHomeDataSource } from "@/lib/server/contracts";
import { mockDataSource } from "@/lib/server/mock-data-source";

export type { DreamHomeDataSource };
export { DataError };

export async function getDataSource(): Promise<DreamHomeDataSource> {
  if (process.env.DATA_SOURCE === "oracle") {
    const { oracleDataSource } = await import("@/lib/server/oracle-data-source");
    return oracleDataSource;
  }

  return mockDataSource;
}
