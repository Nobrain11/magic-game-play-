import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rewardsPoolTable = pgTable("rewards_pool", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull().default(0),
  added_at: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRewardsPoolSchema = createInsertSchema(rewardsPoolTable).omit({ id: true, added_at: true });
export type InsertRewardsPool = z.infer<typeof insertRewardsPoolSchema>;
export type RewardsPool = typeof rewardsPoolTable.$inferSelect;
