import { Telegraf } from "telegraf";
import type { Logger } from "pino";
import { handleStart } from "./commands/start.js";
import { handleCreate, handleClassSelection } from "./commands/create.js";
import { handleProfile } from "./commands/profile.js";
import { handleMission, handleMissionStart, handleCollect } from "./commands/mission.js";
import { handleInventory, handleEquip, handleUpgrade } from "./commands/inventory.js";
import { handleArena, handleBattle } from "./commands/arena.js";
import { handleGuild, handleGuildCreate, handleGuildJoin, handleGuildLeave } from "./commands/guild.js";
import { handleMarket, handleSell, handleBuy } from "./commands/market.js";
import { handleDaily } from "./commands/daily.js";
import { handleHeal } from "./commands/heal.js";
import { handleBurnReport } from "./commands/burns.js";
import { handleHelp } from "./commands/help.js";

const CLASS_KEYS = new Set([
  "warrior", "archer", "mage", "healer", "tank",
  "rogue", "chrono", "draconid", "crystalforged",
]);

export function createBot(token: string, log: Logger): Telegraf {
  const bot = new Telegraf(token);

  bot.command("start", ctx => handleStart(ctx).catch(e => log.error({ err: e }, "start error")));
  bot.command("help", ctx => handleHelp(ctx).catch(e => log.error({ err: e }, "help error")));
  bot.command("create", ctx => handleCreate(ctx).catch(e => log.error({ err: e }, "create error")));
  bot.command("profile", ctx => handleProfile(ctx).catch(e => log.error({ err: e }, "profile error")));
  bot.command("heal", ctx => handleHeal(ctx).catch(e => log.error({ err: e }, "heal error")));

  // Mission commands
  bot.command("mission", async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1);
    if (args.length > 0 && args[0]) {
      await handleMissionStart(ctx, args[0]).catch(e => log.error({ err: e }, "mission start error"));
    } else {
      await handleMission(ctx).catch(e => log.error({ err: e }, "mission error"));
    }
  });
  bot.command("collect", ctx => handleCollect(ctx).catch(e => log.error({ err: e }, "collect error")));

  // Inventory
  bot.command("inv", async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1);
    const page = parseInt(args[0] ?? "0") || 0;
    await handleInventory(ctx, page).catch(e => log.error({ err: e }, "inv error"));
  });
  bot.command("equip", async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1);
    const id = parseInt(args[0] ?? "");
    if (isNaN(id)) { await ctx.reply("Usage: /equip <item_id>"); return; }
    await handleEquip(ctx, id).catch(e => log.error({ err: e }, "equip error"));
  });
  bot.command("upgrade", async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1);
    const id = parseInt(args[0] ?? "");
    if (isNaN(id)) { await ctx.reply("Usage: /upgrade <item_id>"); return; }
    await handleUpgrade(ctx, id).catch(e => log.error({ err: e }, "upgrade error"));
  });

  // Arena
  bot.command("arena", ctx => handleArena(ctx).catch(e => log.error({ err: e }, "arena error")));
  bot.command("battle", async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1);
    const targetId = parseInt(args[0] ?? "");
    if (isNaN(targetId)) { await ctx.reply("Usage: /battle <userId>"); return; }
    await handleBattle(ctx, targetId).catch(e => log.error({ err: e }, "battle error"));
  });

  // Guild
  bot.command("guild", async (ctx) => {
    const parts = ctx.message.text.split(/\s+/).slice(1);
    const sub = parts[0]?.toLowerCase();
    if (sub === "create") {
      const name = parts.slice(1).join(" ");
      await handleGuildCreate(ctx, name).catch(e => log.error({ err: e }, "guild create error"));
    } else if (sub === "join") {
      const id = parseInt(parts[1] ?? "");
      if (isNaN(id)) { await ctx.reply("Usage: /guild join <id>"); return; }
      await handleGuildJoin(ctx, id).catch(e => log.error({ err: e }, "guild join error"));
    } else if (sub === "leave") {
      await handleGuildLeave(ctx).catch(e => log.error({ err: e }, "guild leave error"));
    } else {
      await handleGuild(ctx).catch(e => log.error({ err: e }, "guild error"));
    }
  });

  // Market
  bot.command("market", async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1);
    const page = parseInt(args[0] ?? "0") || 0;
    await handleMarket(ctx, page).catch(e => log.error({ err: e }, "market error"));
  });
  bot.command("sell", async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1);
    const id = parseInt(args[0] ?? "");
    const price = parseInt(args[1] ?? "");
    if (isNaN(id) || isNaN(price)) { await ctx.reply("Usage: /sell <item_id> <price>"); return; }
    await handleSell(ctx, id, price).catch(e => log.error({ err: e }, "sell error"));
  });
  bot.command("buy", async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1);
    const id = parseInt(args[0] ?? "");
    if (isNaN(id)) { await ctx.reply("Usage: /buy <listing_id>"); return; }
    await handleBuy(ctx, id).catch(e => log.error({ err: e }, "buy error"));
  });

  // Daily & burns
  bot.command("daily", ctx => handleDaily(ctx).catch(e => log.error({ err: e }, "daily error")));
  bot.command("burnreport", ctx => handleBurnReport(ctx).catch(e => log.error({ err: e }, "burnreport error")));

  // Handle plain text for class selection during /create flow
  bot.on("text", async (ctx) => {
    const text = ctx.message.text.trim().toLowerCase();
    if (!text.startsWith("/") && CLASS_KEYS.has(text)) {
      await handleClassSelection(ctx, text).catch(e => log.error({ err: e }, "class selection error"));
    }
  });

  bot.catch((err, ctx) => {
    log.error({ err, update: ctx.update }, "Bot error");
  });

  return bot;
}
