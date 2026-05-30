import { pgTable, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const charactersTable = pgTable("characters", {
  user_id: integer("user_id").primaryKey(),
  username: text("username").notNull(),
  class: text("class").notNull(),
  rank: text("rank").notNull().default("D"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  hp: integer("hp").notNull().default(100),
  max_hp: integer("max_hp").notNull().default(100),
  attack: integer("attack").notNull().default(10),
  defense: integer("defense").notNull().default(5),
  magic: integer("magic").notNull().default(5),
  speed: integer("speed").notNull().default(10),
  crit: integer("crit").notNull().default(5),
  weapon_slot: integer("weapon_slot"),
  helmet_slot: integer("helmet_slot"),
  armor_slot: integer("armor_slot"),
  guild_id: integer("guild_id"),
  pvp_wins: integer("pvp_wins").notNull().default(0),
  pvp_losses: integer("pvp_losses").notNull().default(0),
  injured: integer("injured").notNull().default(0),
  daily_quests: text("daily_quests"),
  daily_date: text("daily_date"),
  magic_balance: integer("magic_balance").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("characters_guild_id_idx").on(table.guild_id),
  index("characters_rank_idx").on(table.rank),
]);

export const insertCharacterSchema = createInsertSchema(charactersTable).omit({ created_at: true });
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof charactersTable.$inferSelect;
