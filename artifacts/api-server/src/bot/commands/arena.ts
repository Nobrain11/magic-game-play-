import type { Context } from "telegraf";
import { getCharacter, doBattle } from "../services/db.js";
import { db } from "@workspace/db";
import { charactersTable } from "@workspace/db";
import { eq, ne, sql } from "drizzle-orm";
import { formatMagic } from "../utils/format.js";
import { PVP_PRIZE } from "@workspace/shared";

export async function handleArena(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }
  if (char.injured) {
    await ctx.reply("🩸 You are injured! Use /heal before entering the arena.");
    return;
  }

  // Find random opponents near your level
  const opponents = await db
    .select({
      user_id: charactersTable.user_id,
      username: charactersTable.username,
      level: charactersTable.level,
      class: charactersTable.class,
    })
    .from(charactersTable)
    .where(ne(charactersTable.user_id, userId))
    .orderBy(sql`random()`)
    .limit(5);

  if (opponents.length === 0) {
    await ctx.reply("😔 No other players found. Check back when more adventurers join!");
    return;
  }

  let msg = `⚔️ *PvP Arena*\n\nPrize: ${formatMagic(PVP_PRIZE)} $MAGIC\n\n`;
  msg += `*Available Opponents:*\n`;
  for (const opp of opponents) {
    msg += `• [${opp.user_id}] ${opp.username} — Level ${opp.level} ${opp.class}\n`;
  }
  msg += `\nUse /battle <userId> to challenge someone!`;

  await ctx.reply(msg, { parse_mode: "Markdown" });
}

export async function handleBattle(ctx: Context, targetId: number) {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (userId === targetId) {
    await ctx.reply("❌ You can't battle yourself!");
    return;
  }

  try {
    const result = await doBattle(userId, targetId);
    const won = result.winnerId === userId;
    const self = won ? result.attacker : result.defender;
    const opp = won ? result.defender : result.attacker;

    let msg = won
      ? `⚔️ *Victory!*\n\nYou defeated *${opp.username}*!\n💎 +${formatMagic(PVP_PRIZE)} $MAGIC`
      : `💀 *Defeated!*\n\n*${opp.username}* was stronger!\n💎 -${formatMagic(PVP_PRIZE)} $MAGIC`;

    if (result.loserNowInjured && !won) {
      msg += `\n\n🩸 You are now *INJURED*! Use /heal to recover.`;
    }

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "player_not_found") await ctx.reply("❌ Player not found.");
    else if (message === "attacker_injured") await ctx.reply("🩸 You are injured! Use /heal first.");
    else if (message === "defender_injured") await ctx.reply("❌ That player is injured and cannot fight.");
    else await ctx.reply("❌ Battle failed.");
  }
}
