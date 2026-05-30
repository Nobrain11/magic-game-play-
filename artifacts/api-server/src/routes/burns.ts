import { Router } from "express";
import { db } from "@workspace/db";
import { burnsTable, charactersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { GetRecentBurnsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [agg] = await db.select({
      total_burned: sql<number>`coalesce(sum(burned), 0)::int`,
      total_to_marketing: sql<number>`coalesce(sum(marketing), 0)::int`,
      total_to_buyback: sql<number>`coalesce(sum(buyback), 0)::int`,
      total_to_rewards: sql<number>`coalesce(sum(rewards), 0)::int`,
      burn_count: sql<number>`count(*)::int`,
    }).from(burnsTable);

    const [lastBurn] = await db
      .select({ burned_at: burnsTable.burned_at })
      .from(burnsTable)
      .orderBy(desc(burnsTable.burned_at))
      .limit(1);

    res.json({
      total_burned: agg?.total_burned ?? 0,
      total_to_marketing: agg?.total_to_marketing ?? 0,
      total_to_buyback: agg?.total_to_buyback ?? 0,
      total_to_rewards: agg?.total_to_rewards ?? 0,
      burn_count: agg?.burn_count ?? 0,
      last_burn_at: lastBurn?.burned_at?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "burn report error");
    res.status(500).json({ error: "internal" });
  }
});

router.get("/recent", async (req, res) => {
  const parsed = GetRecentBurnsQueryParams.safeParse(req.query);
  const limit = Math.min(Number(parsed.data?.limit ?? 20), 100);

  try {
    const rows = await db
      .select({
        id: burnsTable.id,
        user_id: burnsTable.user_id,
        username: charactersTable.username,
        total_amount: burnsTable.total_amount,
        burned: burnsTable.burned,
        tx_signature: burnsTable.tx_signature,
        burned_at: burnsTable.burned_at,
      })
      .from(burnsTable)
      .innerJoin(charactersTable, eq(burnsTable.user_id, charactersTable.user_id))
      .orderBy(desc(burnsTable.burned_at))
      .limit(limit);

    res.json({
      burns: rows.map(r => ({
        ...r,
        burned_at: r.burned_at.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "recent burns error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
