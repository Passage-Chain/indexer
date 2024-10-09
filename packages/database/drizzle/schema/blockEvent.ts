import {
  pgTable,
  uuid,
  varchar,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { block } from "./block";
import { relations } from "drizzle-orm";
import {
  BlockEventAttribute,
  blockEventAttribute,
} from "./blockEventAttribute";

export const blockEventSource = pgEnum("block_event_source", [
  "begin_block_events",
  "end_block_events",
]);

export type BlockEventSource = (typeof blockEventSource.enumValues)[number];

export const blockEvent = pgTable(
  "block_event",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    height: integer("height")
      .notNull()
      .references(() => block.height),
    source: blockEventSource("source").notNull(),
    index: integer("index").notNull(),
    type: varchar("type", { length: 255 }).notNull(),
  },
  (table) => ({
    heightIndex: index("block_event_height_index").on(table.height),
  })
);

export const blockEventRelations = relations(blockEvent, ({ many, one }) => ({
  attributes: many(blockEventAttribute),
  block: one(block, {
    references: [block.height],
    fields: [blockEvent.height],
  }),
}));

export type BlockEvent = typeof blockEvent.$inferSelect;
export type BlockEventWithAttributes = BlockEvent & {
  attributes: BlockEventAttribute[];
};
export type BlockEventInsert = typeof blockEvent.$inferInsert;
