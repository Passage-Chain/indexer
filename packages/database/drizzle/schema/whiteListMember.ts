import { relations } from "drizzle-orm";
import { index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { whitelist } from "./whiteList";

export const whitelistMember = pgTable(
  "whitelist_member",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    whitelist: uuid("whitelist")
      .notNull()
      .references(() => whitelist.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
  },
  (table) => {
    return {
      address: index("whitelist_member_address").on(table.address),
    };
  }
);

export const whitelistMemberRelations = relations(
  whitelistMember,
  ({ one }) => ({
    whitelist: one(whitelist, {
      fields: [whitelistMember.whitelist],
      references: [whitelist.id],
    }),
  })
);

export type WhitelistMember = typeof whitelistMember.$inferSelect;
export type WhitelistMemberInsert = typeof whitelistMember.$inferInsert;
