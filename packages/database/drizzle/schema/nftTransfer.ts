import { relations } from "drizzle-orm";
import { pgTable, varchar, integer, uuid } from "drizzle-orm/pg-core";
import { nft } from "./nft";
import { block } from "./block";

export const nftTransfer = pgTable(
  "nft_transfer",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    fromOwner: varchar("from_owner", { length: 255 }).notNull(),
    toOwner: varchar("to_owner", { length: 255 }).notNull(),
    transferredOnBlockHeight: integer("transferred_on_block_height").notNull(),
    nftId: uuid("nft_id")
      .references(() => nft.id)
      .notNull(),
  },
  (table) => {
    return {};
  }
);

export const nftTransferRelations = relations(nftTransfer, ({ one }) => ({
  nft: one(nft, {
    fields: [nftTransfer.nftId],
    references: [nft.id],
  }),
  block: one(block, {
    fields: [nftTransfer.transferredOnBlockHeight],
    references: [block.height],
  }),
}));

export type NftTransfer = typeof nftTransfer.$inferSelect;
export type NftTransferInsert = typeof nftTransfer.$inferInsert;
