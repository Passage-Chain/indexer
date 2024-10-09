import { pgTable, uuid, varchar, index, serial } from "drizzle-orm/pg-core";
import { transaction } from "./transaction";
import { message } from "./message";

export const addressReference = pgTable(
  "address_reference",
  {
    id: serial("id").primaryKey().notNull(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transaction.id, { onUpdate: "cascade" }),
    messageId: uuid("message_id").references(() => message.id, {
      onUpdate: "cascade",
    }),
    address: varchar("address", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
  },
  (table) => {
    return {
      address_reference_transaction_id: index(
        "address_reference_transaction_id"
      ).on(table.transactionId),
      address_reference_address: index("address_reference_address").on(
        table.address
      ),
    };
  }
);

export type AddressReference = typeof addressReference.$inferSelect;
