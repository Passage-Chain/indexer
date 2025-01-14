import {
  pgTable,
  uuid,
  varchar,
  integer,
  index,
  text,
} from "drizzle-orm/pg-core";
import { transactionEvent } from "./transactionEvent";
import { relations } from "drizzle-orm";

export const transactionEventAttribute = pgTable(
  "transaction_event_attribute",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    transactionEventId: uuid("transaction_event_id")
      .notNull()
      .references(() => transactionEvent.id),
    index: integer("index").notNull(),
    key: varchar("key", { length: 255 }).notNull(),
    value: text("value"),
  },
  (table) => ({
    transactionEventIdIndex: index(
      "transaction_event_attribute_transaction_event_id_index"
    ).on(table.transactionEventId, table.index),
  })
);

export const transactionEventAttributeRelations = relations(
  transactionEventAttribute,
  ({ one }) => ({
    transactionEvent: one(transactionEvent, {
      references: [transactionEvent.id],
      fields: [transactionEventAttribute.transactionEventId],
    }),
  })
);

export type TransactionEventAttribute =
  typeof transactionEventAttribute.$inferSelect;
export type TransactionEventAttributeInsert =
  typeof transactionEventAttribute.$inferInsert;
