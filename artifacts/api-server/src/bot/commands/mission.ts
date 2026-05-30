import type { Context } from "telegraf";
import { getCharacter, getActiveMission, startMission, collectMission } from "../services/db.js";
import { MISSIONS } from "@workspace/shared";
import type { MissionDifficulty } from "@workspace/shared";
import { formatMagic, classEmoji } from "../utils/format.js";

function timeLeft(endsAt: Date): string {
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return "Ready!";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export async function handleMission(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }
  if (char.injured) {
    await ctx.reply("🩸 You are injured! Use /heal before going on a mission.");
    return;
  }

  const active = await getActiveMission(userId);
  if (active) {
    const ready = new Date() >= active.ends_at;
    await ctx.reply(
      `⏳ *Active Mission: ${MISSIONS[active.difficulty as MissionDifficulty].emoji} ${MISSIONS[active.difficulty as MissionDifficulty].label}*\n\n` +
      `Status: ${ready ? "✅ **Ready to collect!** Use /collect" : `⏳ ${timeLeft(active.ends_at)}`}`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  const missionList = Object.entries(MISSIONS)
    .map(([key, def]) => {
      const hours = def.duration >= 3600 ? `${def.duration / 3600}h` : `${def.duration / 60}m`;
      return `${def.emoji} *${def.label}* — ${hours} — Type \`/mission ${key}\``;
    })
    .join("\n");

  await ctx.reply(
    `🗺️ *Choose a Mission*\n\nAll missions burn ${(100_000).toLocaleString()} $MAGIC\n\n${missionList}`,
    { parse_mode: "Markdown" }
  );
}

export async function handleMissionStart(ctx: Context, difficulty: string) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }
  if (char.injured) {
    await ctx.reply("🩸 You are injured! Use /heal first.");
    return;
  }

  const diff = difficulty.toLowerCase().trim() as MissionDifficulty;
  if (!MISSIONS[diff]) {
    await ctx.reply("❌ Invalid difficulty. Choose: quick, normal, hard, epic");
    return;
  }

  const active = await getActiveMission(userId);
  if (active) {
    await ctx.reply("⚠️ You already have an active mission! Use /collect when it's done.");
    return;
  }

  if (char.magic_balance < 100_000) {
    await ctx.reply("❌ Not enough $MAGIC! You need 100,000 $MAGIC to start a mission.");
    return;
  }

  const def = MISSIONS[diff];
  const hours = def.duration >= 3600 ? `${def.duration / 3600}h` : `${def.duration / 60}m`;
  await startMission(userId, diff);

  await ctx.reply(
    `${def.emoji} *Mission Started: ${def.label}*\n\n` +
    `⏳ Duration: ${hours}\n` +
    `💎 Cost: 100,000 $MAGIC burned\n\n` +
    `Use /collect when your mission is complete!`,
    { parse_mode: "Markdown" }
  );
}

export async function handleCollect(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  const active = await getActiveMission(userId);
  if (!active) {
    await ctx.reply("❌ No active mission. Start one with /mission!");
    return;
  }

  if (new Date() < active.ends_at) {
    await ctx.reply(`⏳ Mission not complete yet! Time left: ${timeLeft(active.ends_at)}`);
    return;
  }

  try {
    const result = await collectMission(userId, char);
    const def = MISSIONS[active.difficulty as MissionDifficulty];

    let msg = `${def.emoji} *Mission Complete!*\n\n`;
    msg += `✨ XP Gained: +${result.xpGained}\n`;
    msg += `💎 $MAGIC Earned: +${formatMagic(result.magicEarned)}\n`;

    if (result.item) {
      msg += `\n🎁 *Item Drop!*\n${result.item.emoji} ${result.item.rarity} ${result.item.item_name} (${result.item.item_type})\n+${result.item.stat_value} ${result.item.stat_type}\n`;
    }

    if (result.levelsGained > 0) {
      msg += `\n🆙 *LEVEL UP!* → Level ${result.newLevel}`;
    }

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "no_active_mission") {
      await ctx.reply("❌ No active mission.");
    } else if (message === "not_ready") {
      await ctx.reply("⏳ Mission not complete yet!");
    } else {
      await ctx.reply("❌ Something went wrong.");
    }
  }
}
