import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const guildsTable = pgTable("guilds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  leader_id: integer("leader_id").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  raid_boss: text("raid_boss"),
  raid_hp: integer("raid_hp").notNull().default(0),
  raid_max_hp: integer("raid_max_hp").notNull().default(0),
  raid_ends_at: timestamp("raid_ends_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGuildSchema = createInsertSchema(guildsTable).omit({ id: true, created_at: true });
export type InsertGuild = z.infer<typeof insertGuildSchema>;
export type Guild = typeof guildsTable.$inferSelect;
