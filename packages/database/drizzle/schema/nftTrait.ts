import { relations } from "drizzle-orm";
import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";
import { nft } from "./nft";

export const nftTrait = pgTable("nft_trait", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  nftId: uuid("nft_id").references(() => nft.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  displayType: varchar("display_type", { length: 255 }),
  traitType: varchar("trait_type", { length: 255 }),
  traitValue: varchar("trait_value", { length: 255 }),
});

export const nftTraitRelations = relations(nftTrait, ({ one, many }) => ({
  nft: one(nft, {
    fields: [nftTrait.nftId],
    references: [nft.id],
  }),
}));

export type NftTrait = typeof nftTrait.$inferSelect;
export type NftTraitInsert = typeof nftTrait.$inferInsert;
