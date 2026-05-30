import { pgTable, serial, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pvpLogTable = pgTable("pvp_log", {
  id: serial("id").primaryKey(),
  attacker_id: integer("attacker_id").notNull(),
  defender_id: integer("defender_id").notNull(),
  winner_id: integer("winner_id").notNull(),
  magic_won: integer("magic_won").notNull().default(0),
  fought_at: timestamp("fought_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("pvp_log_attacker_idx").on(table.attacker_id),
  index("pvp_log_defender_idx").on(table.defender_id),
]);

export const insertPvpLogSchema = createInsertSchema(pvpLogTable).omit({ id: true, fought_at: true });
export type InsertPvpLog = z.infer<typeof insertPvpLogSchema>;
export type PvpLog = typeof pvpLogTable.$inferSelect;
