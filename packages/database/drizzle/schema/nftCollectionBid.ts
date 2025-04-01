import { isNull, relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  integer,
  uuid,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { block } from "./block";
import { collection } from "./collection";

export const nftCollectionBid = pgTable(
  "nft_collection_bid",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    owner: varchar("owner", { length: 255 }).notNull(),
    collection: varchar("collection", { length: 255 })
      .references(() => collection.address, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    units: integer("units"),
    fundsAmount: numeric("funds_amount"),
    fundsDenom: varchar("funds_denom", { length: 255 }),
    bidPrice: numeric("bid_price"),
    bidDenom: varchar("bid_denom", { length: 255 }),
    bidBlockHeight: integer("bid_block_height").references(() => block.height),
    removedBlockHeight: integer("removed_block_height").references(
      () => block.height
    ),
  },
  (table) => [
    uniqueIndex(
      "nft_collection_bid_owner_collection_where_removed_block_height_null"
    )
      .on(table.owner, table.collection)
      .where(isNull(table.removedBlockHeight)),
  ]
);

export const nftCollectionBidRelations = relations(
  nftCollectionBid,
  ({ one }) => ({
    collection: one(collection, {
      fields: [nftCollectionBid.collection],
      references: [collection.address],
    }),
    block: one(block, {
      fields: [nftCollectionBid.bidBlockHeight],
      references: [block.height],
    }),
    removedBlock: one(block, {
      fields: [nftCollectionBid.removedBlockHeight],
      references: [block.height],
    }),
  })
);

export type NftCollectionBid = typeof nftCollectionBid.$inferSelect;
export type NftCollectionBidInsert = typeof nftCollectionBid.$inferInsert;
