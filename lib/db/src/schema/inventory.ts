import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  item_name: text("item_name").notNull(),
  item_type: text("item_type").notNull().default("weapon"),
  rarity: text("rarity").notNull(),
  stat_type: text("stat_type").notNull(),
  stat_value: integer("stat_value").notNull(),
  emoji: text("emoji").notNull(),
  item_img: text("item_img"),
  level: integer("level").notNull().default(1),
  for_sale: integer("for_sale").notNull().default(0),
  price: integer("price").notNull().default(0),
  obtained_at: timestamp("obtained_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({ id: true, obtained_at: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryItem = typeof inventoryTable.$inferSelect;
