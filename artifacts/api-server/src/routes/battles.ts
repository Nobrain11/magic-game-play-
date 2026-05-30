import { Router } from "express";
import { db } from "@workspace/db";
import { pvpLogTable, charactersTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"] ?? 50), 100);
  const statusFilter = req.query["status"] as string | undefined;

  try {
    // Alias joins for attacker and defender
    const attackerChar = { ...charactersTable };

    const rows = await db
      .select({
        id: pvpLogTable.id,
        attacker_id: pvpLogTable.attacker_id,
        defender_id: pvpLogTable.defender_id,
        winner_id: pvpLogTable.winner_id,
        magic_won: pvpLogTable.magic_won,
        fought_at: pvpLogTable.fought_at,
      })
      .from(pvpLogTable)
      .orderBy(desc(pvpLogTable.fought_at))
      .limit(limit);

    if (rows.length === 0) {
      res.json({ battles: [] });
      return;
    }

    // Fetch all involved player names
    const userIds = [...new Set([...rows.map(r => r.attacker_id), ...rows.map(r => r.defender_id)])];
    const chars = await db
      .select({ user_id: charactersTable.user_id, username: charactersTable.username, class: charactersTable.class })
      .from(charactersTable)
      .where(sql`user_id = any(${userIds})`);

    const nameMap = new Map(chars.map(c => [c.user_id, { username: c.username, class: c.class }]));
    const info = (id: number) => nameMap.get(id) ?? { username: `Player#${id}`, class: "warrior" };

    const battles = rows.map(r => ({
      id: r.id,
      attacker_id: r.attacker_id,
      attacker_username: info(r.attacker_id).username,
      attacker_class: info(r.attacker_id).class,
      defender_id: r.defender_id,
      defender_username: info(r.defender_id).username,
      defender_class: info(r.defender_id).class,
      winner_id: r.winner_id,
      magic_won: r.magic_won,
      draw: r.attacker_id === r.defender_id,
      fought_at: r.fought_at.toISOString(),
    }));

    res.json({ battles });
  } catch (err) {
    req.log.error({ err }, "battles error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
