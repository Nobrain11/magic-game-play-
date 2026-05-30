import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable, missionsTable, burnsTable, pvpLogTable, guildsTable, marketTable, rewardsPoolTable } from "@workspace/db";
import { sql, eq, gt } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [totalPlayers] = await db.select({ count: sql<number>`count(*)::int` }).from(charactersTable);
    const [totalMissions] = await db.select({ count: sql<number>`count(*)::int` }).from(missionsTable).where(eq(missionsTable.collected, 1));
    const [burnAgg] = await db.select({ total: sql<number>`coalesce(sum(burned), 0)::int` }).from(burnsTable);
    const [totalPvp] = await db.select({ count: sql<number>`count(*)::int` }).from(pvpLogTable);
    const [totalGuilds] = await db.select({ count: sql<number>`count(*)::int` }).from(guildsTable);
    const [marketVol] = await db.select({ total: sql<number>`coalesce(sum(price), 0)::int` }).from(marketTable);
    const [activeMissions] = await db.select({ count: sql<number>`count(*)::int` }).from(missionsTable).where(eq(missionsTable.collected, 0));
    const [pool] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)::int` }).from(rewardsPoolTable);

    // New: avg level and top class
    const [avgLevelRow] = await db.select({ avg: sql<number>`round(coalesce(avg(level), 1))::int` }).from(charactersTable);
    const topClassRows = await db
      .select({ class: charactersTable.class, count: sql<number>`count(*)::int` })
      .from(charactersTable)
      .groupBy(charactersTable.class)
      .orderBy(sql`count(*) desc`)
      .limit(1);

    // Active in last 24h (players who started a mission or fought in pvp)
    const yesterday = new Date(Date.now() - 86400 * 1000);
    const [active24h] = await db
      .select({ count: sql<number>`count(distinct user_id)::int` })
      .from(missionsTable)
      .where(gt(missionsTable.started_at, yesterday));

    res.json({
      total_players: totalPlayers?.count ?? 0,
      total_missions_completed: totalMissions?.count ?? 0,
      total_magic_burned: burnAgg?.total ?? 0,
      total_pvp_battles: totalPvp?.count ?? 0,
      total_guilds: totalGuilds?.count ?? 0,
      total_market_volume: marketVol?.total ?? 0,
      active_missions: activeMissions?.count ?? 0,
      rewards_pool: pool?.total ?? 0,
      avg_level: avgLevelRow?.avg ?? 1,
      top_class: topClassRows[0]?.class ?? "warrior",
      active_24h: active24h?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "stats error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
