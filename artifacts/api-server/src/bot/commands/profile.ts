import type { Context } from "telegraf";
import { getCharacter } from "../services/db.js";
import { profileCard } from "../utils/format.js";
import { db } from "@workspace/db";
import { guildsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function handleProfile(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ No character found. Use /create to start your journey!");
    return;
  }

  let guildInfo = "";
  if (char.guild_id) {
    const [guild] = await db.select({ name: guildsTable.name }).from(guildsTable).where(eq(guildsTable.id, char.guild_id));
    guildInfo = guild ? `\n🏰 Guild: *${guild.name}*` : "";
  }

  await ctx.reply(
    `\`\`\`\n${profileCard(char)}\n\`\`\`` + guildInfo,
    { parse_mode: "Markdown" }
  );
}
