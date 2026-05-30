import type { Character } from "@workspace/db";
import { CLASSES, RANK_LABELS, RANK_STARS, BAR_LENGTH } from "@workspace/shared";

export function hpBar(hp: number, maxHp: number): string {
  const filled = Math.round((hp / maxHp) * BAR_LENGTH);
  const empty = BAR_LENGTH - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

export function classEmoji(classKey: string): string {
  const cls = CLASSES[classKey as keyof typeof CLASSES];
  return cls?.emoji ?? "❓";
}

export function rankLabel(rank: string): string {
  return RANK_LABELS[rank as keyof typeof RANK_LABELS] ?? rank;
}

export function rankStars(rank: string): string {
  return RANK_STARS[rank as keyof typeof RANK_STARS] ?? "";
}

export function formatMagic(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

export function profileCard(char: Character): string {
  const cls = CLASSES[char.class as keyof typeof CLASSES];
  const hpStr = `${char.hp}/${char.max_hp}`;
  return [
    `╔══════════════════════════╗`,
    `║  ${classEmoji(char.class)} ${char.username.padEnd(20)} ║`,
    `║  ${cls?.label ?? char.class} • ${rankLabel(char.rank)}`,
    `╠══════════════════════════╣`,
    `║  Level: ${char.level}   XP: ${char.xp}`,
    `║  HP: [${hpBar(char.hp, char.max_hp)}] ${hpStr}`,
    `╠══════════════════════════╣`,
    `║  ⚔️  ATK: ${char.attack}   🛡️  DEF: ${char.defense}`,
    `║  🔮 MAG: ${char.magic}   ⚡ SPD: ${char.speed}`,
    `║  🎯 CRIT: ${char.crit}%`,
    `╠══════════════════════════╣`,
    `║  💎 $MAGIC: ${formatMagic(char.magic_balance)}`,
    `║  ⚔️  PvP: ${char.pvp_wins}W / ${char.pvp_losses}L`,
    char.injured ? `║  🩸 INJURED — use /heal` : `║  ✅ Healthy`,
    `╚══════════════════════════╝`,
  ].join("\n");
}
