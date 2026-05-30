import type { Context } from "telegraf";
import { getCharacter, getDailyQuests } from "../services/db.js";
import { formatMagic } from "../utils/format.js";

export async function handleDaily(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  const quests = await getDailyQuests(char);

  const today = new Date().toISOString().slice(0, 10);

  let msg = `📋 *Daily Quests* — ${today}\n\n`;
  for (const q of quests) {
    msg += `• ${q.desc}\n  Reward: 💎 ${formatMagic(q.reward)}\n`;
  }
  msg += `\nQuests refresh daily at midnight UTC.`;

  await ctx.reply(msg, { parse_mode: "Markdown" });
}
