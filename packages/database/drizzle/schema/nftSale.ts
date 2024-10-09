import { relations } from "drizzle-orm";
import { pgTable, varchar, integer, uuid, numeric } from "drizzle-orm/pg-core";
import { nft } from "./nft";
import { block } from "./block";

export const nftSale = pgTable("nft_sale", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  previousOwner: varchar("previous_owner", { length: 255 }).notNull(),
  newOwner: varchar("new_owner", { length: 255 }).notNull(),
  nft: uuid("nft")
    .references(() => nft.id)
    .notNull(),
  salePrice: numeric("sale_price").notNull(),
  saleDenom: varchar("sale_denom", { length: 255 }).notNull(),
  saleBlockHeight: integer("sale_block_height")
    .references(() => block.height)
    .notNull(),
  marketFee: numeric("market_fee").notNull(),
  marketFeeDenom: varchar("market_fee_denom").notNull(),
  royaltyFee: numeric("royalty_fee").notNull(),
  royaltyFeeDenom: varchar("royalty_fee_denom").notNull(),
  royaltyFeeAddress: varchar("royalty_fee_address").notNull(),
});

export const nftSaleRelations = relations(nftSale, ({ one }) => ({
  nft: one(nft, {
    fields: [nftSale.nft],
    references: [nft.id],
  }),
  block: one(block, {
    fields: [nftSale.saleBlockHeight],
    references: [block.height],
  }),
}));

export type NftSale = typeof nftSale.$inferSelect;
export type NftSaleInsert = typeof nftSale.$inferInsert;
