import {
  pgTable,
  uuid,
  varchar,
  index,
  integer,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";
import { transaction } from "./transaction";
import { block } from "./block";
import { bytea } from "../customTypes";
import { relations } from "drizzle-orm";

export const message = pgTable(
  "message",
  {
    id: uuid("id").primaryKey().notNull(),
    txId: uuid("tx_id")
      .notNull()
      .references(() => transaction.id, { onUpdate: "cascade" }),
    height: integer("height")
      .notNull()
      .references(() => block.height, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    type: varchar("type", { length: 255 }).notNull(),
    typeCategory: varchar("type_category", { length: 255 }).notNull(),
    index: integer("index").notNull(),
    indexInBlock: integer("index_in_block").notNull(),
    isProcessed: boolean("is_processed").default(false).notNull(),
    isNotificationProcessed: boolean("is_notification_processed")
      .default(false)
      .notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amount: numeric("amount"),
    data: bytea("data").notNull(),
  },
  (table) => {
    return {
      tx_id: index("message_tx_id").on(table.txId),
      height: index("message_height").on(table.height),
      tx_id_is_processed: index("message_tx_id_is_processed").on(
        table.txId,
        table.isProcessed
      ),
      height_is_notification_processed: index(
        "message_height_is_notification_processed"
      ).on(table.height, table.isNotificationProcessed),
      height_is_notification_processed_false: index(
        "message_height_is_notification_processed_false"
      ).on(table.height),
      height_is_notification_processed_true: index(
        "message_height_is_notification_processed_true"
      ).on(table.height),
    };
  }
);

export const messageRelations = relations(message, ({ one }) => ({
  transaction: one(transaction, {
    references: [transaction.id],
    fields: [message.txId],
  }),
  block: one(block, {
    references: [block.height],
    fields: [message.height],
  }),
}));

export type Message = typeof message.$inferSelect;
export type MessageInsert = typeof message.$inferInsert;
