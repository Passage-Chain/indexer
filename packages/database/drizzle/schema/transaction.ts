import {
  pgTable,
  uuid,
  varchar,
  index,
  integer,
  boolean,
  bigint,
  text,
} from "drizzle-orm/pg-core";
import { block } from "./block";
import { relations } from "drizzle-orm";
import { message } from "./message";
import { transactionEvent } from "./transactionEvent";

export const transaction = pgTable(
  "transaction",
  {
    id: uuid("id").primaryKey().notNull(),
    hash: varchar("hash", { length: 255 }).notNull(),
    index: integer("index").notNull(),
    height: integer("height")
      .notNull()
      .references(() => block.height, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    msgCount: integer("msg_count").notNull(),
    multisigThreshold: integer("multisig_threshold"),
    gasUsed: integer("gas_used").notNull(),
    gasWanted: integer("gas_wanted").notNull(),
    fee: bigint("fee", { mode: "number" }).notNull(),
    memo: text("memo").notNull(),
    isProcessed: boolean("is_processed").default(false).notNull(),
    hasProcessingError: boolean("has_processing_error").default(false).notNull(),
    log: text("log"),
  },
  (table) => {
    return {
      height: index("transaction_height").on(table.height),
      height_is_processed_has_processing_error: index(
        "transaction_height_is_processed_has_processing_error"
      ).on(table.height, table.isProcessed, table.hasProcessingError),
      hash: index("transaction_hash").on(table.hash),
      id_has_procesing_error_false: index(
        "transaction_id_has_procesing_error_false"
      ).on(table.id),
    };
  }
);

export const transactionRelations = relations(transaction, ({ many, one }) => ({
  messages: many(message),
  block: one(block, {
    fields: [transaction.height],
    references: [block.height],
  }),
  events: many(transactionEvent),
}));

export type Transaction = typeof transaction.$inferSelect;
export type TransactionInsert = typeof transaction.$inferInsert;
