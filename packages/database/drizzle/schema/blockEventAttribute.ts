import {
  pgTable,
  uuid,
  varchar,
  integer,
  index,
  text,
} from "drizzle-orm/pg-core";
import { blockEvent } from "./blockEvent";
import { relations } from "drizzle-orm";

export const blockEventAttribute = pgTable(
  "block_event_attribute",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    blockEventId: uuid("block_event_id")
      .notNull()
      .references(() => blockEvent.id),
    index: integer("index").notNull(),
    key: varchar("key", { length: 255 }).notNull(),
    value: text("value"),
  },
  (table) => ({
    blockEventIdIndex: index("block_event_attribute_block_event_id_index").on(
      table.blockEventId
    ),
  })
);

export const blockEventAttributeRelations = relations(
  blockEventAttribute,
  ({ one }) => ({
    blockEvent: one(blockEvent, {
      references: [blockEvent.id],
      fields: [blockEventAttribute.blockEventId],
    }),
  })
);

export type BlockEventAttribute = typeof blockEventAttribute.$inferSelect;
export type BlockEventAttributeInsert = typeof blockEventAttribute.$inferInsert;
