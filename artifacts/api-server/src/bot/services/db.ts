import { db } from "@workspace/db";
import {
  charactersTable,
  walletsTable,
  missionsTable,
  inventoryTable,
  burnsTable,
  rewardsPoolTable,
  guildsTable,
  pvpLogTable,
  marketTable,
} from "@workspace/db";
import type {
  Character,
  InventoryItem,
  Mission,
  Guild,
  MarketListing,
} from "@workspace/db";
import { eq, and, desc, sql, ne } from "drizzle-orm";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import {
  applyXp,
  applyLevelUpStats,
  resolveBattle,
  resolveMission,
  rollItem,
  upgradeStatValue,
  calculateBurnSplit,
} from "@workspace/game-engine";
import {
  CLASSES,
  MISSIONS,
  MAGIC_BURN_AMOUNT,
  GUILD_CREATE_COST,
  HEAL_COST,
  MIN_SELL_PRICE,
  MAX_SELL_PRICE,
  DAILY_QUESTS_POOL,
  ITEMS_PER_PAGE,
  RANK_LABELS,
} from "@workspace/shared";
import type { ClassKey, MissionDifficulty } from "@workspace/shared";

export { db };

// ─────────────────── character ───────────────────

export async function getCharacter(userId: number): Promise<Character | null> {
  const [c] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.user_id, userId));
  return c ?? null;
}

export async function createCharacter(
  userId: number,
  username: string,
  classKey: ClassKey
): Promise<Character> {
  const cls = CLASSES[classKey];
  const [c] = await db
    .insert(charactersTable)
    .values({
      user_id: userId,
      username,
      class: classKey,
      rank: cls.rank,
      ...cls.stats,
      magic_balance: cls.startMagic,
    })
    .returning();
  return c!;
}

export async function updateCharacter(
  userId: number,
  data: Partial<typeof charactersTable.$inferInsert>
): Promise<void> {
  await db
    .update(charactersTable)
    .set(data)
    .where(eq(charactersTable.user_id, userId));
}

// ─────────────────── missions ───────────────────

export async function getActiveMission(userId: number): Promise<Mission | null> {
  const [m] = await db
    .select()
    .from(missionsTable)
    .where(and(eq(missionsTable.user_id, userId), eq(missionsTable.collected, 0)))
    .orderBy(desc(missionsTable.started_at))
    .limit(1);
  return m ?? null;
}

export async function startMission(
  userId: number,
  difficulty: MissionDifficulty
): Promise<Mission> {
  const def = MISSIONS[difficulty];
  const endsAt = new Date(Date.now() + def.duration * 1000);
  const [m] = await db
    .insert(missionsTable)
    .values({ user_id: userId, difficulty, ends_at: endsAt })
    .returning();
  return m!;
}

export async function collectMission(
  userId: number,
  char: Character
): Promise<{ mission: Mission; xpGained: number; magicEarned: number; item: ReturnType<typeof rollItem> | null; levelsGained: number; newLevel: number }> {
  const mission = await getActiveMission(userId);
  if (!mission) throw new Error("no_active_mission");
  if (new Date() < mission.ends_at) throw new Error("not_ready");

  const reward = resolveMission(mission.difficulty as MissionDifficulty);
  const { newLevel, overflow, levelsGained } = applyXp(char.level, char.xp, reward.xpGained);
  const newStats = applyLevelUpStats(char, char.class as ClassKey, levelsGained);
  const newRank = newLevel >= 80 ? "S" : newLevel >= 60 ? "A" : newLevel >= 40 ? "B" : newLevel >= 20 ? "C" : "D";

  let droppedItem: ReturnType<typeof rollItem> | null = null;

  await db.transaction(async (tx) => {
    // Mark collected first — atomic guard against double-claim
    const [marked] = await tx
      .update(missionsTable)
      .set({ collected: 1 })
      .where(and(eq(missionsTable.id, mission.id), eq(missionsTable.collected, 0)))
      .returning();
    if (!marked) throw new Error("already_collected");

    // Insert item drop inside transaction so it's all-or-nothing
    if (reward.item) {
      droppedItem = reward.item;
      await tx
        .insert(inventoryTable)
        .values({ user_id: userId, ...reward.item, item_img: reward.item.item_img ?? undefined });
    }

    // Update character stats
    await tx.update(charactersTable).set({
      level: newLevel,
      xp: overflow,
      rank: levelsGained > 0 ? newRank : char.rank,
      hp: newStats.hp,
      max_hp: newStats.max_hp,
      attack: newStats.attack,
      defense: newStats.defense,
      magic: newStats.magic,
      speed: newStats.speed,
      crit: newStats.crit,
      magic_balance: char.magic_balance + reward.magicEarned,
    }).where(eq(charactersTable.user_id, userId));
  });

  return {
    mission,
    xpGained: reward.xpGained,
    magicEarned: reward.magicEarned,
    item: droppedItem,
    levelsGained,
    newLevel,
  };
}

// ─────────────────── inventory ───────────────────

export async function getInventory(userId: number, page = 0): Promise<{ items: InventoryItem[]; total: number }> {
  const total = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(inventoryTable)
    .where(and(eq(inventoryTable.user_id, userId), eq(inventoryTable.for_sale, 0)));

  const items = await db
    .select()
    .from(inventoryTable)
    .where(and(eq(inventoryTable.user_id, userId), eq(inventoryTable.for_sale, 0)))
    .orderBy(desc(inventoryTable.obtained_at))
    .limit(ITEMS_PER_PAGE)
    .offset(page * ITEMS_PER_PAGE);

  return { items, total: total[0]?.count ?? 0 };
}

export async function getItem(itemId: number): Promise<InventoryItem | null> {
  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, itemId));
  return item ?? null;
}

export async function equipItem(userId: number, itemId: number): Promise<string> {
  const item = await getItem(itemId);
  if (!item || item.user_id !== userId) throw new Error("not_owned");

  const slotMap: Record<string, "weapon_slot" | "helmet_slot" | "armor_slot"> = {
    weapon: "weapon_slot",
    helmet: "helmet_slot",
    armor: "armor_slot",
  };
  const slot = slotMap[item.item_type];
  if (!slot) throw new Error("unknown_type");

  await db.update(charactersTable).set({ [slot]: itemId }).where(eq(charactersTable.user_id, userId));
  return item.item_type;
}

export async function upgradeItem(userId: number, itemId: number, char: Character): Promise<InventoryItem> {
  const item = await getItem(itemId);
  if (!item || item.user_id !== userId) throw new Error("not_owned");

  const upgradeCost = item.level * 25_000;
  if (char.magic_balance < upgradeCost) throw new Error("insufficient_magic");

  const newStatValue = upgradeStatValue(item.stat_value);
  const [updated] = await db
    .update(inventoryTable)
    .set({ stat_value: newStatValue, level: item.level + 1 })
    .where(eq(inventoryTable.id, itemId))
    .returning();

  await db.update(charactersTable).set({ magic_balance: char.magic_balance - upgradeCost }).where(eq(charactersTable.user_id, userId));

  return updated!;
}

// ─────────────────── pvp ───────────────────

export async function doBattle(attackerId: number, defenderId: number): Promise<ReturnType<typeof resolveBattle> & { attacker: Character; defender: Character }> {
  const attacker = await getCharacter(attackerId);
  const defender = await getCharacter(defenderId);
  if (!attacker || !defender) throw new Error("player_not_found");
  if (attacker.injured) throw new Error("attacker_injured");
  if (defender.injured) throw new Error("defender_injured");

  const result = resolveBattle(attacker as unknown as import("@workspace/shared").Character, defender as unknown as import("@workspace/shared").Character);

  const winner = result.attackerWon ? attacker : defender;
  const loser = result.attackerWon ? defender : attacker;

  // Update stats
  await db.update(charactersTable).set({
    pvp_wins: winner.pvp_wins + 1,
    magic_balance: winner.magic_balance + result.magicPrize,
  }).where(eq(charactersTable.user_id, winner.user_id));

  await db.update(charactersTable).set({
    pvp_losses: loser.pvp_losses + 1,
    magic_balance: Math.max(0, loser.magic_balance - result.magicPrize),
    injured: result.loserNowInjured ? 1 : loser.injured,
  }).where(eq(charactersTable.user_id, loser.user_id));

  // Log pvp
  await db.insert(pvpLogTable).values({
    attacker_id: attackerId,
    defender_id: defenderId,
    winner_id: result.winnerId,
    magic_won: result.magicPrize,
  });

  return { ...result, attacker, defender };
}

// ─────────────────── guilds ───────────────────

export async function getGuild(guildId: number): Promise<Guild | null> {
  const [g] = await db.select().from(guildsTable).where(eq(guildsTable.id, guildId));
  return g ?? null;
}

export async function createGuild(userId: number, name: string, char: Character): Promise<Guild> {
  if (char.magic_balance < GUILD_CREATE_COST) throw new Error("insufficient_magic");
  if (char.guild_id) throw new Error("already_in_guild");

  const [existing] = await db.select().from(guildsTable).where(eq(guildsTable.name, name));
  if (existing) throw new Error("name_taken");

  return await db.transaction(async (tx) => {
    const [guild] = await tx.insert(guildsTable).values({ name, leader_id: userId }).returning();
    await tx.update(charactersTable).set({
      guild_id: guild!.id,
      magic_balance: char.magic_balance - GUILD_CREATE_COST,
    }).where(eq(charactersTable.user_id, userId));
    return guild!;
  });
}

export async function joinGuild(userId: number, guildId: number, char: Character): Promise<void> {
  if (char.guild_id) throw new Error("already_in_guild");
  const guild = await getGuild(guildId);
  if (!guild) throw new Error("guild_not_found");

  await db.update(charactersTable).set({ guild_id: guildId }).where(eq(charactersTable.user_id, userId));
}

export async function leaveGuild(userId: number, char: Character): Promise<void> {
  if (!char.guild_id) throw new Error("not_in_guild");
  await db.update(charactersTable).set({ guild_id: null }).where(eq(charactersTable.user_id, userId));
}

// ─────────────────── market ───────────────────

export async function listItem(userId: number, itemId: number, price: number, char: Character): Promise<MarketListing> {
  if (price < MIN_SELL_PRICE) throw new Error("price_too_low");
  if (price > MAX_SELL_PRICE) throw new Error("price_too_high");
  const item = await getItem(itemId);
  if (!item || item.user_id !== userId) throw new Error("not_owned");
  if (item.for_sale) throw new Error("already_listed");

  await db.update(inventoryTable).set({ for_sale: 1, price }).where(eq(inventoryTable.id, itemId));
  const [listing] = await db.insert(marketTable).values({ seller_id: userId, item_id: itemId, price }).returning();
  return listing!;
}

export async function buyItem(buyerId: number, listingId: number, buyer: Character): Promise<InventoryItem> {
  return await db.transaction(async (tx) => {
    // Re-fetch listing inside transaction to prevent race conditions
    const [listing] = await tx.select().from(marketTable).where(eq(marketTable.id, listingId));
    if (!listing) throw new Error("listing_not_found");
    if (listing.seller_id === buyerId) throw new Error("cant_buy_own");
    if (buyer.magic_balance < listing.price) throw new Error("insufficient_magic");

    const [item] = await tx.select().from(inventoryTable).where(eq(inventoryTable.id, listing.item_id));
    if (!item) throw new Error("item_missing");

    // Atomic: transfer item, delete listing, debit buyer, credit seller
    await tx.update(inventoryTable).set({ user_id: buyerId, for_sale: 0, price: 0 }).where(eq(inventoryTable.id, listing.item_id));
    await tx.delete(marketTable).where(eq(marketTable.id, listingId));
    await tx.update(charactersTable).set({ magic_balance: buyer.magic_balance - listing.price }).where(eq(charactersTable.user_id, buyerId));
    await tx.update(charactersTable).set({ magic_balance: sql`magic_balance + ${listing.price}` }).where(eq(charactersTable.user_id, listing.seller_id));

    return { ...item, user_id: buyerId, for_sale: 0, price: 0 };
  });
}

// ─────────────────── daily quests ───────────────────

export async function getDailyQuests(char: Character): Promise<typeof DAILY_QUESTS_POOL> {
  const today = new Date().toISOString().slice(0, 10);
  if (char.daily_date === today && char.daily_quests) {
    return JSON.parse(char.daily_quests) as typeof DAILY_QUESTS_POOL;
  }
  // Assign 3 random quests for today
  const shuffled = [...DAILY_QUESTS_POOL].sort(() => Math.random() - 0.5);
  const quests = shuffled.slice(0, 3);
  await db.update(charactersTable).set({
    daily_quests: JSON.stringify(quests),
    daily_date: today,
  }).where(eq(charactersTable.user_id, char.user_id));
  return quests;
}

// ─────────────────── heal ───────────────────

export async function healCharacter(userId: number, char: Character): Promise<void> {
  if (!char.injured) throw new Error("not_injured");
  if (char.magic_balance < HEAL_COST) throw new Error("insufficient_magic");

  await db.update(charactersTable).set({
    injured: 0,
    hp: char.max_hp,
    magic_balance: char.magic_balance - HEAL_COST,
  }).where(eq(charactersTable.user_id, userId));
}

// ─────────────────── wallet ───────────────────

export async function getOrCreateWallet(userId: number): Promise<{ public_key: string }> {
  const [existing] = await db.select().from(walletsTable).where(eq(walletsTable.user_id, userId));
  if (existing) return existing;

  // Generate a real Solana keypair for the player
  const kp = Keypair.generate();
  const publicKey = kp.publicKey.toBase58();
  const privateKey = bs58.encode(kp.secretKey);

  const [created] = await db.insert(walletsTable).values({
    user_id: userId,
    public_key: publicKey,
    private_key: privateKey,
  }).returning();
  return created!;
}
