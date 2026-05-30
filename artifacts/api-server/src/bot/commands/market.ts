import type { Context } from "telegraf";
import { getCharacter, listItem, buyItem, db } from "../services/db.js";
import { marketTable, inventoryTable, charactersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { formatMagic } from "../utils/format.js";
import { MIN_SELL_PRICE, MAX_SELL_PRICE } from "@workspace/shared";

export async function handleMarket(ctx: Context, page = 0) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const limit = 5;
  const offset = page * limit;

  const listings = await db
    .select({
      id: marketTable.id,
      item_name: inventoryTable.item_name,
      item_type: inventoryTable.item_type,
      rarity: inventoryTable.rarity,
      stat_value: inventoryTable.stat_value,
      stat_type: inventoryTable.stat_type,
      emoji: inventoryTable.emoji,
      level: inventoryTable.level,
      price: marketTable.price,
      seller: charactersTable.username,
    })
    .from(marketTable)
    .innerJoin(inventoryTable, eq(marketTable.item_id, inventoryTable.id))
    .innerJoin(charactersTable, eq(marketTable.seller_id, charactersTable.user_id))
    .orderBy(desc(marketTable.listed_at))
    .limit(limit)
    .offset(offset);

  if (listings.length === 0 && page === 0) {
    await ctx.reply("🏪 The market is empty! List items with /sell <id> <price>");
    return;
  }

  let msg = `🏪 *Market* — Page ${page + 1}\n\n`;
  for (const l of listings) {
    msg += `[${l.id}] ${l.emoji} *${l.item_name}* Lv${l.level}\n`;
    msg += `  ${l.rarity} | +${l.stat_value} ${l.stat_type}\n`;
    msg += `  💎 ${formatMagic(l.price)} — Seller: ${l.seller}\n\n`;
  }
  msg += `\n/buy <id> to purchase`;
  if (page > 0) msg += ` | /market ${page - 1} (prev)`;
  if (listings.length === limit) msg += ` | /market ${page + 1} (next)`;

  await ctx.reply(msg, { parse_mode: "Markdown" });
}

export async function handleSell(ctx: Context, itemId: number, price: number) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  if (isNaN(price) || price < MIN_SELL_PRICE) {
    await ctx.reply(`❌ Minimum price is ${formatMagic(MIN_SELL_PRICE)} $MAGIC.`);
    return;
  }
  if (price > MAX_SELL_PRICE) {
    await ctx.reply(`❌ Maximum price is ${formatMagic(MAX_SELL_PRICE)} $MAGIC.`);
    return;
  }

  try {
    const listing = await listItem(userId, itemId, price, char);
    await ctx.reply(
      `✅ Item listed on the market for ${formatMagic(price)} $MAGIC!\nListing ID: #${listing.id}`,
      { parse_mode: "Markdown" }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "not_owned") await ctx.reply("❌ You don't own that item.");
    else if (message === "already_listed") await ctx.reply("❌ Item is already listed.");
    else if (message === "price_too_low") await ctx.reply(`❌ Minimum price: ${formatMagic(MIN_SELL_PRICE)} $MAGIC.`);
    else if (message === "price_too_high") await ctx.reply(`❌ Maximum price: ${formatMagic(MAX_SELL_PRICE)} $MAGIC.`);
    else await ctx.reply("❌ Could not list item.");
  }
}

export async function handleBuy(ctx: Context, listingId: number) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const char = await getCharacter(userId);
  if (!char) {
    await ctx.reply("❌ Use /create first!");
    return;
  }

  try {
    const item = await buyItem(userId, listingId, char);
    await ctx.reply(
      `✅ Purchased *${item.item_name}*!\n💎 Paid: ${formatMagic(item.price || 0)} $MAGIC`,
      { parse_mode: "Markdown" }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "listing_not_found") await ctx.reply("❌ Listing not found.");
    else if (message === "cant_buy_own") await ctx.reply("❌ Can't buy your own listing.");
    else if (message === "insufficient_magic") await ctx.reply("❌ Not enough $MAGIC.");
    else await ctx.reply("❌ Purchase failed.");
  }
}
