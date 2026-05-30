import { Router } from "express";
import { db } from "@workspace/db";
import { marketTable, inventoryTable, charactersTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { GetMarketListingsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = GetMarketListingsQueryParams.safeParse(req.query);
  const limit = Math.min(Number(parsed.data?.limit ?? 20), 100);
  const offset = Number(parsed.data?.offset ?? 0);
  const rarity = parsed.data?.rarity;
  const item_type = parsed.data?.item_type;

  try {
    const conditions = [];
    if (rarity) {
      conditions.push(eq(inventoryTable.rarity, rarity));
    }
    if (item_type) {
      conditions.push(eq(inventoryTable.item_type, item_type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        listing_id: marketTable.id,
        item_id: inventoryTable.id,
        item_name: inventoryTable.item_name,
        item_type: inventoryTable.item_type,
        rarity: inventoryTable.rarity,
        stat_type: inventoryTable.stat_type,
        stat_value: inventoryTable.stat_value,
        emoji: inventoryTable.emoji,
        level: inventoryTable.level,
        price: marketTable.price,
        seller_id: marketTable.seller_id,
        seller_username: charactersTable.username,
        listed_at: marketTable.listed_at,
      })
      .from(marketTable)
      .innerJoin(inventoryTable, eq(marketTable.item_id, inventoryTable.id))
      .innerJoin(charactersTable, eq(marketTable.seller_id, charactersTable.user_id))
      .where(whereClause)
      .orderBy(desc(marketTable.listed_at))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketTable)
      .innerJoin(inventoryTable, eq(marketTable.item_id, inventoryTable.id))
      .where(whereClause);

    res.json({
      listings: rows.map(r => ({
        ...r,
        listed_at: r.listed_at.toISOString(),
      })),
      total: totalRow?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "market error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
