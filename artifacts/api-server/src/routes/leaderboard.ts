import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable, pvpLogTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";
import { RANK_LABELS } from "@workspace/shared";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid params" });
    return;
  }
  const { by = "level", limit = 50 } = parsed.data;

  const safeLimit = Math.min(Number(limit), 100);
  const byStr = by as string;
  const col = byStr === "magic_balance"
    ? desc(charactersTable.magic_balance)
    : byStr === "pvp_wins"
      ? desc(charactersTable.pvp_wins)
      : byStr === "xp"
        ? desc(charactersTable.xp)
        : desc(charactersTable.level);

  try {
    const rows = await db
      .select({
        user_id: charactersTable.user_id,
        username: charactersTable.username,
        class: charactersTable.class,
        rank: charactersTable.rank,
        level: charactersTable.level,
        xp: charactersTable.xp,
        magic_balance: charactersTable.magic_balance,
        pvp_wins: charactersTable.pvp_wins,
        pvp_losses: charactersTable.pvp_losses,
        total_damage: sql<number>`coalesce((select sum(magic_won)::int from pvp_log where winner_id = characters.user_id), 0)`,
      })
      .from(charactersTable)
      .orderBy(col)
      .limit(safeLimit);

    const entries = rows.map((c, i) => ({
      rank: i + 1,
      user_id: c.user_id,
      username: c.username,
      class: c.class,
      level: c.level,
      xp: c.xp,
      magic_balance: c.magic_balance,
      pvp_wins: c.pvp_wins,
      pvp_losses: c.pvp_losses,
      total_damage: c.total_damage,
      player_rank: RANK_LABELS[c.rank as keyof typeof RANK_LABELS] ?? c.rank,
    }));

    res.json({ entries, by });
  } catch (err) {
    req.log.error({ err }, "leaderboard error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
