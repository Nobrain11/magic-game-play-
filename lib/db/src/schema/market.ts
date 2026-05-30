import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const marketTable = pgTable("market", {
  id: serial("id").primaryKey(),
  seller_id: integer("seller_id").notNull(),
  item_id: integer("item_id").notNull(),
  price: integer("price").notNull(),
  listed_at: timestamp("listed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMarketSchema = createInsertSchema(marketTable).omit({ id: true, listed_at: true });
export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type MarketListing = typeof marketTable.$inferSelect;
