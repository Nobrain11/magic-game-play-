import type { Context } from "telegraf";
import { db } from "../services/db.js";
import { burnsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { formatMagic } from "../utils/format.js";
import { TOKEN_SPLIT } from "@workspace/shared";

export async function handleBurnReport(ctx: Context) {
  const [agg] = await db.select({
    total_burned: sql<number>`coalesce(sum(burned), 0)::int`,
    total_marketing: sql<number>`coalesce(sum(marketing), 0)::int`,
    total_buyback: sql<number>`coalesce(sum(buyback), 0)::int`,
    total_rewards: sql<number>`coalesce(sum(rewards), 0)::int`,
    burn_count: sql<number>`count(*)::int`,
  }).from(burnsTable);

  const [lastBurn] = await db
    .select({ burned_at: burnsTable.burned_at })
    .from(burnsTable)
    .orderBy(desc(burnsTable.burned_at))
    .limit(1);

  const msg = [
    `🔥 *$MAGIC Burn Report*`,
    ``,
    `Total Burned: ${formatMagic(agg?.total_burned ?? 0)}`,
    `  🔥 Destroyed: ${Math.round(TOKEN_SPLIT.burn * 100)}%`,
    `  📢 Marketing: ${Math.round(TOKEN_SPLIT.marketing * 100)}%`,
    `  💰 Buyback: ${Math.round(TOKEN_SPLIT.buyback * 100)}%`,
    `  🏆 Rewards Pool: ${Math.round(TOKEN_SPLIT.rewards * 100)}%`,
    ``,
    `Total Events: ${agg?.burn_count ?? 0}`,
    lastBurn ? `Last Burn: ${lastBurn.burned_at.toLocaleString()}` : `No burns yet.`,
  ].join("\n");

  await ctx.reply(msg, { parse_mode: "Markdown" });
}
