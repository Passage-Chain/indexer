import { relations } from "drizzle-orm";
import {
  pgTable,
  uniqueIndex,
  uuid,
  integer,
  boolean,
  doublePrecision,
  date,
} from "drizzle-orm/pg-core";
import { block } from "./block";

export const day = pgTable(
  "day",
  {
    id: uuid("id").primaryKey().notNull(),
    date: date("date", { mode: "date" }).notNull(),
    tokenPrice: doublePrecision("token_price"),
    firstBlockHeight: integer("first_block_height").notNull(),
    lastBlockHeight: integer("last_block_height"),
    lastBlockHeightYet: integer("last_block_height_yet").notNull(),
    tokenPriceChanged: boolean("token_price_changed").default(false).notNull(),
  },
  (table) => {
    return {
      date: uniqueIndex("day_date").on(table.date),
      first_block_height: uniqueIndex("day_first_block_height").on(
        table.firstBlockHeight
      ),
      last_block_height: uniqueIndex("day_last_block_height").on(
        table.lastBlockHeight
      ),
    };
  }
);

export const dayRelations = relations(day, ({ many, one }) => ({
  blocks: many(block),
  firstBlock: one(block, {
    fields: [day.firstBlockHeight],
    references: [block.height],
  }),
  lastBlock: one(block, {
    fields: [day.lastBlockHeight],
    references: [block.height],
  }),
  lastBlockYet: one(block, {
    fields: [day.lastBlockHeightYet],
    references: [block.height],
  }),
}));

export type Day = typeof day.$inferSelect;
