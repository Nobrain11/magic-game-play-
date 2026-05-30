import type { Context } from "telegraf";
import { getCharacter } from "../services/db.js";
import { classEmoji } from "../utils/format.js";
import { CLASSES } from "@workspace/shared";

export async function handleStart(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (char) {
    await ctx.reply(
      `🌌 *Welcome back, ${char.username}!*\n\n` +
      `You are a ${classEmoji(char.class)} *${CLASSES[char.class as keyof typeof CLASSES]?.label ?? char.class}* at Level *${char.level}*.\n\n` +
      `Use /profile to see your stats or /help for all commands.`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  await ctx.reply(
    `🌌 *Welcome to ASTRALIS* 🌌\n\n` +
    `An arcane RPG where your battles burn $MAGIC tokens on Solana.\n\n` +
    `⚔️ Complete missions\n🔮 Battle other players\n🏰 Join guilds\n💎 Trade items on the market\n\n` +
    `Use /create to begin your journey and choose your class!`,
    { parse_mode: "Markdown" }
  );
}
