import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable, guildsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetPlayerParams } from "@workspace/api-zod";
import { RANK_LABELS } from "@workspace/shared";

const router = Router();

router.get("/:userId", async (req, res) => {
  const parsed = GetPlayerParams.safeParse({ userId: Number(req.params["userId"]) });
  if (!parsed.success) {
    res.status(400).json({ error: "invalid userId" });
    return;
  }
  const { userId } = parsed.data;

  try {
    const [char] = await db
      .select()
      .from(charactersTable)
      .where(eq(charactersTable.user_id, userId));

    if (!char) {
      res.status(404).json({ error: "not found" });
      return;
    }

    let guildName: string | null = null;
    if (char.guild_id) {
      const [g] = await db
        .select({ name: guildsTable.name })
        .from(guildsTable)
        .where(eq(guildsTable.id, char.guild_id));
      guildName = g?.name ?? null;
    }

    res.json({
      user_id: char.user_id,
      username: char.username,
      class: char.class,
      player_rank: RANK_LABELS[char.rank as keyof typeof RANK_LABELS] ?? char.rank,
      level: char.level,
      xp: char.xp,
      hp: char.hp,
      max_hp: char.max_hp,
      attack: char.attack,
      defense: char.defense,
      magic: char.magic,
      speed: char.speed,
      crit: char.crit,
      magic_balance: char.magic_balance,
      pvp_wins: char.pvp_wins,
      pvp_losses: char.pvp_losses,
      guild_id: char.guild_id ?? null,
      guild_name: guildName,
      created_at: char.created_at.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "player error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
