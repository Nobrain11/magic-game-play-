import type { Context } from "telegraf";
import { getCharacter, healCharacter } from "../services/db.js";
import { formatMagic } from "../utils/format.js";
import { HEAL_COST } from "@workspace/shared";

export async function handleHeal(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  if (!char.injured) {
    await ctx.reply("✅ You are not injured! No healing needed.");
    return;
  }

  if (char.magic_balance < HEAL_COST) {
    await ctx.reply(`❌ Not enough $MAGIC. Healing costs ${formatMagic(HEAL_COST)} $MAGIC.`);
    return;
  }

  try {
    await healCharacter(userId, char);
    await ctx.reply(
      `✨ *Healed!*\n\nHP fully restored.\nCost: ${formatMagic(HEAL_COST)} $MAGIC`,
      { parse_mode: "Markdown" }
    );
  } catch (err: unknown) {
    await ctx.reply("❌ Could not heal.");
  }
}
