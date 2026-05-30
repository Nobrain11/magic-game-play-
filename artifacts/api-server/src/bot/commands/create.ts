import type { Context } from "telegraf";
import { Markup } from "telegraf";
import { getCharacter, createCharacter } from "../services/db.js";
import { CLASSES } from "@workspace/shared";
import type { ClassKey } from "@workspace/shared";

export async function handleCreate(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const existing = await getCharacter(userId);
  if (existing) {
    await ctx.reply("⚠️ You already have a character! Use /profile to view it.");
    return;
  }

  const classList = Object.values(CLASSES)
    .map(c => `${c.emoji} *${c.label}* (${c.rank}-Rank) — ${c.desc}`)
    .join("\n");

  await ctx.reply(
    `✨ *Choose Your Class* ✨\n\n${classList}\n\nType the class name to select:`,
    { parse_mode: "Markdown" }
  );
}

export async function handleClassSelection(ctx: Context, classInput: string) {
  const userId = ctx.from?.id;
  const username = ctx.from?.username ?? ctx.from?.first_name ?? `Hero${ctx.from?.id}`;
  if (!userId) return;

  const existing = await getCharacter(userId);
  if (existing) {
    await ctx.reply("⚠️ You already have a character!");
    return;
  }

  const classKey = classInput.toLowerCase().trim() as ClassKey;
  if (!CLASSES[classKey]) {
    const names = Object.keys(CLASSES).join(", ");
    await ctx.reply(`❌ Unknown class. Valid choices: ${names}`);
    return;
  }

  const cls = CLASSES[classKey];
  const char = await createCharacter(userId, username, classKey);

  await ctx.reply(
    `🎉 *${char.username} has entered Astralis!*\n\n` +
    `${cls.emoji} You are a *${cls.label}* (${char.rank}-Rank)\n\n` +
    `${cls.lore}\n\n` +
    `💎 Starting $MAGIC: *${cls.startMagic.toLocaleString()}*\n\n` +
    `Use /profile to see your stats, /mission to begin your first mission!`,
    { parse_mode: "Markdown" }
  );
}
