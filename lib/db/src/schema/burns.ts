import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const burnsTable = pgTable("burns", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  total_amount: integer("total_amount").notNull(),
  burned: integer("burned").notNull(),
  marketing: integer("marketing").notNull(),
  buyback: integer("buyback").notNull(),
  rewards: integer("rewards").notNull(),
  tx_signature: text("tx_signature").notNull(),
  mission_id: integer("mission_id"),
  burned_at: timestamp("burned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBurnSchema = createInsertSchema(burnsTable).omit({ id: true, burned_at: true });
export type InsertBurn = z.infer<typeof insertBurnSchema>;
export type Burn = typeof burnsTable.$inferSelect;
