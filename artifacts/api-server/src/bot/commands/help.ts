import type { Context } from "telegraf";

export async function handleHelp(ctx: Context) {
  const msg = `🌌 *Astralis Commands*

🧙 *Character*
/start — Welcome screen
/create — Create your character
/profile — View your stats
/heal — Heal injuries (${50_000..toLocaleString()} $MAGIC)

⚔️ *Combat*
/arena — Browse PvP opponents
/battle <userId> — Challenge a player

🗺️ *Missions*
/mission — View & start missions
/mission <type> — Start: quick/normal/hard/epic
/collect — Collect mission reward

🎒 *Inventory*
/inv — View inventory
/equip <id> — Equip an item
/upgrade <id> — Upgrade an item

🏪 *Market*
/market — Browse listings
/sell <id> <price> — List an item
/buy <id> — Purchase an item

🏰 *Guilds*
/guild — Guild info / list
/guild create <name> — Create a guild
/guild join <id> — Join a guild
/guild leave — Leave your guild

📊 *Info*
/daily — Daily quests
/burnreport — Token burn stats

💡 Cost: 100K $MAGIC per mission burn`;

  await ctx.reply(msg, { parse_mode: "Markdown" });
}
