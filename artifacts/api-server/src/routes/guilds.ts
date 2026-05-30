import { Router } from "express";
import { db } from "@workspace/db";
import { guildsTable, charactersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { GetGuildParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: guildsTable.id,
        name: guildsTable.name,
        leader_id: guildsTable.leader_id,
        leader_username: charactersTable.username,
        level: guildsTable.level,
        xp: guildsTable.xp,
        raid_boss: guildsTable.raid_boss,
        created_at: guildsTable.created_at,
        member_count: sql<number>`(select count(*)::int from characters where guild_id = guilds.id)`,
      })
      .from(guildsTable)
      .innerJoin(charactersTable, eq(guildsTable.leader_id, charactersTable.user_id))
      .orderBy(desc(guildsTable.level));

    res.json({
      guilds: rows.map(r => ({
        ...r,
        created_at: r.created_at.toISOString(),
        raid_boss: r.raid_boss ?? null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "guilds error");
    res.status(500).json({ error: "internal" });
  }
});

router.get("/:id", async (req, res) => {
  const parsed = GetGuildParams.safeParse({ id: Number(req.params["id"]) });
  if (!parsed.success) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const { id } = parsed.data;

  try {
    const [guild] = await db
      .select({
        id: guildsTable.id,
        name: guildsTable.name,
        leader_id: guildsTable.leader_id,
        leader_username: charactersTable.username,
        level: guildsTable.level,
        xp: guildsTable.xp,
        raid_boss: guildsTable.raid_boss,
        raid_hp: guildsTable.raid_hp,
        raid_max_hp: guildsTable.raid_max_hp,
        created_at: guildsTable.created_at,
      })
      .from(guildsTable)
      .innerJoin(charactersTable, eq(guildsTable.leader_id, charactersTable.user_id))
      .where(eq(guildsTable.id, id));

    if (!guild) {
      res.status(404).json({ error: "not found" });
      return;
    }

    const members = await db
      .select({
        user_id: charactersTable.user_id,
        username: charactersTable.username,
        class: charactersTable.class,
        level: charactersTable.level,
        player_rank: charactersTable.rank,
      })
      .from(charactersTable)
      .where(eq(charactersTable.guild_id, id));

    res.json({
      ...guild,
      raid_boss: guild.raid_boss ?? null,
      created_at: guild.created_at.toISOString(),
      members,
    });
  } catch (err) {
    req.log.error({ err }, "guild detail error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
