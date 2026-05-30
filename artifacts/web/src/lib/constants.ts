export const CLASSES: Record<string, { emoji: string; color: string }> = {
  warrior: { emoji: '⚔️', color: 'text-red-400' },
  archer: { emoji: '🏹', color: 'text-green-400' },
  mage: { emoji: '🔮', color: 'text-purple-400' },
  healer: { emoji: '✨', color: 'text-yellow-200' },
  tank: { emoji: '🛡️', color: 'text-slate-400' },
  rogue: { emoji: '🌑', color: 'text-zinc-600' },
  chrono: { emoji: '⏳', color: 'text-blue-300' },
  draconid: { emoji: '🐉', color: 'text-orange-500' },
  crystalforged: { emoji: '💎', color: 'text-cyan-400' }
};

export const RANKS: Record<string, { emoji: string; color: string }> = {
  'D': { emoji: '⚪', color: 'text-gray-300' },
  'C': { emoji: '🔵', color: 'text-blue-400' },
  'B': { emoji: '🟣', color: 'text-purple-400' },
  'A': { emoji: '🔴', color: 'text-red-500' },
  'S': { emoji: '💠', color: 'text-cyan-400' }
};

export const RARITIES: Record<string, { emoji: string; color: string; bg: string }> = {
  'Common': { emoji: '⚪', color: 'text-gray-300', bg: 'bg-gray-500/10 border-gray-500/30' },
  'Uncommon': { emoji: '🟢', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  'Rare': { emoji: '🔵', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  'Epic': { emoji: '🟣', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  'Legendary': { emoji: '🟡', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' }
};

export const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
