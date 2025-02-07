import { block, db, desc, eq } from "database";

export async function getLastProcessedISODate() {
  const lastProcessedBlock = await db.query.block.findFirst({ where: eq(block.isProcessed, true), orderBy: desc(block.height) });
  return lastProcessedBlock.datetime.toISOString();
}
