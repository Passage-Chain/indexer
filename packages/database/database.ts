import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./drizzle/schema";
import { PgInsertValue, PgTable, TableConfig } from "drizzle-orm/pg-core";

dotenv.config();

const connectionString = process.env.DB_URL || "";
const client = postgres(connectionString);

export const db = drizzle(client, { schema: schema });

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function bulkInsert<TTable extends PgTable>(
  dbTransaction: DbTransaction,
  table: PgTable<TableConfig>,
  values: PgInsertValue<TTable>[]
) {
  if (values.length === 0) return;

  const columnCount = Object.keys(table).length;
  const maxPgParameterCount = 65_534;
  const groupSize = Math.floor(maxPgParameterCount / columnCount);

  for (let i = 0; i < values.length; i += groupSize) {
    const group = values.slice(i, i + groupSize);
    await dbTransaction.insert(table).values(group);
  }
}
