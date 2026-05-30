import type { Context } from "telegraf";
import { getCharacter, getInventory, equipItem, upgradeItem } from "../services/db.js";
import { ITEMS_PER_PAGE, SLOT_EMOJI } from "@workspace/shared";

export async function handleInventory(ctx: Context, page = 0) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  const { items, total } = await getInventory(userId, page);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (items.length === 0 && page === 0) {
    await ctx.reply("🎒 Your inventory is empty. Complete missions to earn items!");
    return;
  }

  const equipped = {
    weapon: char.weapon_slot,
    helmet: char.helmet_slot,
    armor: char.armor_slot,
  };

  let msg = `🎒 *Inventory* (${total} items) — Page ${page + 1}/${Math.max(1, totalPages)}\n\n`;

  for (const item of items) {
    const isEquipped = Object.values(equipped).includes(item.id);
    msg += `[${item.id}] ${item.emoji} *${item.item_name}* ${isEquipped ? "✅" : ""}\n`;
    msg += `  ${item.rarity} ${item.item_type} — Lv${item.level} — +${item.stat_value} ${item.stat_type}\n`;
  }

  msg += `\n💡 /equip <id> | /upgrade <id> | /sell <id> <price>`;
  if (page > 0) msg += ` | /inv ${page - 1} (prev)`;
  if (page + 1 < totalPages) msg += ` | /inv ${page + 1} (next)`;

  await ctx.reply(msg, { parse_mode: "Markdown" });
}

export async function handleEquip(ctx: Context, itemId: number) {
  const userId = ctx.from?.id;
  if (!userId) return;

  try {
    const slotType = await equipItem(userId, itemId);
    await ctx.reply(`✅ Equipped item in ${SLOT_EMOJI[slotType] ?? ""} ${slotType} slot!`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "not_owned") await ctx.reply("❌ You don't own that item.");
    else await ctx.reply("❌ Could not equip item.");
  }
}

export async function handleUpgrade(ctx: Context, itemId: number) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  try {
    const updated = await upgradeItem(userId, itemId, char);
    await ctx.reply(
      `⬆️ *Item Upgraded!*\n\n${updated.emoji} ${updated.item_name} → Level ${updated.level}\n+${updated.stat_value} ${updated.stat_type}`,
      { parse_mode: "Markdown" }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "insufficient_magic") await ctx.reply("❌ Not enough $MAGIC to upgrade!");
    else if (message === "not_owned") await ctx.reply("❌ You don't own that item.");
    else await ctx.reply("❌ Could not upgrade item.");
  }
}
