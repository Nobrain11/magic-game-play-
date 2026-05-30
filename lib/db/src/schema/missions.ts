import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const missionsTable = pgTable("missions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  difficulty: text("difficulty").notNull(),
  started_at: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  ends_at: timestamp("ends_at", { withTimezone: true }).notNull(),
  collected: integer("collected").notNull().default(0),
});

export const insertMissionSchema = createInsertSchema(missionsTable).omit({ id: true });
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missionsTable.$inferSelect;
