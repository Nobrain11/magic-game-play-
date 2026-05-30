import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable, guildsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";
import { RANK_LABELS } from "@workspace/shared";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid params" });
    return;
  }
  const { by = "level", limit = 10 } = parsed.data;

  const safeLimit = Math.min(Number(limit), 100);
  const col = by === "magic_balance"
    ? desc(charactersTable.magic_balance)
    : by === "pvp_wins"
      ? desc(charactersTable.pvp_wins)
      : desc(charactersTable.level);

  try {
    const rows = await db
      .select()
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
      player_rank: RANK_LABELS[c.rank as keyof typeof RANK_LABELS] ?? c.rank,
    }));

    res.json({ entries, by });
  } catch (err) {
    req.log.error({ err }, "leaderboard error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
