import type { Context } from "telegraf";
import { getCharacter, getGuild, createGuild, joinGuild, leaveGuild, db } from "../services/db.js";
import { guildsTable, charactersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { GUILD_CREATE_COST, MAX_GUILD_NAME_LENGTH } from "@workspace/shared";
import { formatMagic } from "../utils/format.js";

export async function handleGuild(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  if (!char.guild_id) {
    // Show available guilds
    const guilds = await db
      .select({
        id: guildsTable.id,
        name: guildsTable.name,
        level: guildsTable.level,
        raid_boss: guildsTable.raid_boss,
        member_count: sql<number>`(select count(*)::int from characters where guild_id = guilds.id)`,
      })
      .from(guildsTable)
      .orderBy(sql`level desc`)
      .limit(10);

    if (guilds.length === 0) {
      await ctx.reply(
        `🏰 *Guild Hall*\n\nNo guilds exist yet!\n\n` +
        `Create one with /guild create <name>\nCost: ${formatMagic(GUILD_CREATE_COST)} $MAGIC`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    let msg = `🏰 *Guild Hall*\n\n`;
    for (const g of guilds) {
      msg += `[${g.id}] *${g.name}* — Lv${g.level} — ${g.member_count} members`;
      if (g.raid_boss) msg += ` — 🐲 Raiding: ${g.raid_boss}`;
      msg += "\n";
    }
    msg += `\n/guild join <id> — Join a guild\n/guild create <name> — Create a guild (${formatMagic(GUILD_CREATE_COST)} $MAGIC)`;

    await ctx.reply(msg, { parse_mode: "Markdown" });
    return;
  }

  // Show current guild
  const guild = await getGuild(char.guild_id);
  if (!guild) {
    await ctx.reply("⚠️ Guild not found. You may have been removed.");
    return;
  }

  const members = await db
    .select({ username: charactersTable.username, level: charactersTable.level })
    .from(charactersTable)
    .where(eq(charactersTable.guild_id, guild.id));

  const isLeader = guild.leader_id === userId;
  let msg = `🏰 *${guild.name}*\n`;
  msg += `Level: ${guild.level} | XP: ${guild.xp}\n`;
  if (guild.raid_boss) {
    msg += `🐲 Raiding: ${guild.raid_boss} — HP: ${guild.raid_hp}/${guild.raid_max_hp}\n`;
  }
  msg += `\n👥 *Members (${members.length})*\n`;
  for (const m of members.slice(0, 10)) {
    msg += `• ${m.username} Lv${m.level}\n`;
  }
  if (isLeader) {
    msg += `\n👑 You are the leader!`;
  } else {
    msg += `\n/guild leave — Leave this guild`;
  }

  await ctx.reply(msg, { parse_mode: "Markdown" });
}

export async function handleGuildCreate(ctx: Context, name: string) {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (!name || name.length < 2 || name.length > MAX_GUILD_NAME_LENGTH) {
    await ctx.reply(`❌ Guild name must be 2-${MAX_GUILD_NAME_LENGTH} characters.`);
    return;
  }

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  try {
    const guild = await createGuild(userId, name, char);
    await ctx.reply(
      `🏰 *Guild Created: ${guild.name}*\n\nCost: ${formatMagic(GUILD_CREATE_COST)} $MAGIC\n\nInvite others to join with /guild join ${guild.id}!`,
      { parse_mode: "Markdown" }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "insufficient_magic") await ctx.reply(`❌ Need ${formatMagic(GUILD_CREATE_COST)} $MAGIC.`);
    else if (message === "already_in_guild") await ctx.reply("❌ Leave your current guild first.");
    else if (message === "name_taken") await ctx.reply("❌ Guild name already taken.");
    else await ctx.reply("❌ Could not create guild.");
  }
}

export async function handleGuildJoin(ctx: Context, guildId: number) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  try {
    await joinGuild(userId, guildId, char);
    const guild = await getGuild(guildId);
    await ctx.reply(`✅ Joined guild *${guild?.name ?? guildId}*!`, { parse_mode: "Markdown" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "already_in_guild") await ctx.reply("❌ Already in a guild. Leave first.");
    else if (message === "guild_not_found") await ctx.reply("❌ Guild not found.");
    else await ctx.reply("❌ Could not join guild.");
  }
}

export async function handleGuildLeave(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  try {
    await leaveGuild(userId, char);
    await ctx.reply("👋 You have left your guild.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "not_in_guild") await ctx.reply("❌ You are not in a guild.");
    else await ctx.reply("❌ Could not leave guild.");
  }
}
