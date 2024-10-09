import {
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const monitoredValue = pgTable(
  "monitored_value",
  {
    id: uuid("id").primaryKey().notNull(),
    tracker: varchar("tracker", { length: 255 }).notNull(),
    target: varchar("target", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }),
    lastUpdateDate: timestamp("last_update_date", {
      mode: "date",
    }),
  },
  (table) => {
    return {
      monitored_value_tracker_target: uniqueIndex(
        "monitored_value_tracker_target"
      ).on(table.tracker, table.target),
    };
  }
);

export type MonitoredValue = typeof monitoredValue.$inferSelect;
