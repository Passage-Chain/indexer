import {
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
  bigint,
  text,
  numeric,
} from "drizzle-orm/pg-core";

export const validator = pgTable(
  "validator",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    operatorAddress: varchar("operator_address", { length: 255 }).notNull(),
    accountAddress: varchar("account_address", { length: 255 }).notNull(),
    hexAddress: varchar("hex_address", { length: 255 }).notNull(),
    createdMsgId: uuid("created_msg_id"),
    moniker: varchar("moniker", { length: 255 }).notNull(),
    identity: varchar("identity", { length: 255 }),
    website: varchar("website", { length: 255 }),
    description: text("description"),
    securityContact: varchar("security_contact", { length: 255 }),
    rate: numeric("rate").notNull(),
    maxRate: numeric("max_rate").notNull(),
    maxChangeRate: numeric("max_change_rate").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    minSelfDelegation: bigint("min_self_delegation", {
      mode: "number",
    }).notNull(),
    keybaseUsername: varchar("keybase_username", { length: 255 }),
    keybaseAvatarUrl: varchar("keybase_avatar_url", { length: 255 }),
  },
  (table) => {
    return {
      id: uniqueIndex("validator_id").on(table.id),
      operator_address: uniqueIndex("validator_operator_address").on(
        table.operatorAddress
      ),
      account_address: uniqueIndex("validator_account_address").on(
        table.accountAddress
      ),
      hex_address: uniqueIndex("validator_hex_address").on(table.hexAddress),
    };
  }
);

export type Validator = typeof validator.$inferSelect;
export type ValidatorInsert = typeof validator.$inferInsert;
