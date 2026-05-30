import { Router } from "express";
import { db } from "@workspace/db";
import { pvpLogTable, burnsTable, missionsTable, charactersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { GetActivityQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = GetActivityQueryParams.safeParse(req.query);
  const limit = Math.min(Number(parsed.data?.limit ?? 20), 50);

  try {
    // Fetch recent pvp battles
    const pvpRows = await db
      .select({
        id: pvpLogTable.id,
        winner_id: pvpLogTable.winner_id,
        attacker_id: pvpLogTable.attacker_id,
        magic_won: pvpLogTable.magic_won,
        fought_at: pvpLogTable.fought_at,
      })
      .from(pvpLogTable)
      .orderBy(desc(pvpLogTable.fought_at))
      .limit(limit);

    // Fetch recent burns
    const burnRows = await db
      .select({
        id: burnsTable.id,
        user_id: burnsTable.user_id,
        burned: burnsTable.burned,
        burned_at: burnsTable.burned_at,
      })
      .from(burnsTable)
      .orderBy(desc(burnsTable.burned_at))
      .limit(limit);

    // Fetch recent missions
    const missionRows = await db
      .select({
        id: missionsTable.id,
        user_id: missionsTable.user_id,
        difficulty: missionsTable.difficulty,
        started_at: missionsTable.started_at,
      })
      .from(missionsTable)
      .where(eq(missionsTable.collected, 1))
      .orderBy(desc(missionsTable.started_at))
      .limit(limit);

    // Gather user ids to fetch usernames
    const allUserIds = new Set<number>([
      ...pvpRows.map(r => r.winner_id),
      ...pvpRows.map(r => r.attacker_id),
      ...burnRows.map(r => r.user_id),
      ...missionRows.map(r => r.user_id),
    ]);

    const chars = allUserIds.size > 0
      ? await db.select({ user_id: charactersTable.user_id, username: charactersTable.username }).from(charactersTable)
      : [];
    const nameMap = new Map(chars.map(c => [c.user_id, c.username]));
    const name = (id: number) => nameMap.get(id) ?? `Player#${id}`;

    type ActivityItem = {
      id: number;
      type: "pvp" | "burn" | "mission" | "guild_raid";
      description: string;
      timestamp: string;
      magic_amount?: number;
    };

    const items: ActivityItem[] = [
      ...pvpRows.map(r => ({
        id: r.id,
        type: "pvp" as const,
        description: `${name(r.winner_id)} defeated ${name(r.attacker_id === r.winner_id ? r.winner_id : r.attacker_id)} in PvP`,
        timestamp: r.fought_at.toISOString(),
        magic_amount: r.magic_won,
      })),
      ...burnRows.map(r => ({
        id: r.id + 10000,
        type: "burn" as const,
        description: `${name(r.user_id)} burned ${r.burned.toLocaleString()} $MAGIC`,
        timestamp: r.burned_at.toISOString(),
        magic_amount: r.burned,
      })),
      ...missionRows.map(r => ({
        id: r.id + 20000,
        type: "mission" as const,
        description: `${name(r.user_id)} completed a ${r.difficulty} mission`,
        timestamp: r.started_at.toISOString(),
      })),
    ];

    // Sort by timestamp descending
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ items: items.slice(0, limit) });
  } catch (err) {
    req.log.error({ err }, "activity error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
