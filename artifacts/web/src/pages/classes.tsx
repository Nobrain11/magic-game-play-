import { useState } from "react";
import { Sparkles } from "lucide-react";

type ClassKey =
  | "warrior"
  | "archer"
  | "mage"
  | "healer"
  | "tank"
  | "rogue"
  | "chrono"
  | "draconid"
  | "crystalforged";

type ClassDef = {
  key: ClassKey;
  emoji: string;
  label: string;
  rank: string;
  archetype: string;
  desc: string;
  lore: string;
  tags: string[];
  gradient: string;
  stats: { hp: number; attack: number; defense: number; magic: number; speed: number };
  abilities: { name: string; desc: string }[];
};

const CLASSES: ClassDef[] = [
  {
    key: "warrior",
    emoji: "⚔️",
    label: "Warrior",
    rank: "D",
    archetype: "FRONTLINER / BRUISER",
    desc: "Frontline bruiser. High HP & Attack.",
    lore: "Forged in the fires of a hundred battles, the Warrior is the backbone of any fighting force.",
    tags: ["Strength", "Endurance", "Melee Combat", "Battle Cry", "Shield"],
    gradient: "linear-gradient(135deg, #7f1d1d 0%, #1c0a0a 100%)",
    stats: { hp: 140, attack: 18, defense: 10, magic: 3, speed: 8 },
    abilities: [
      { name: "Cleave", desc: "Unleash a wide arc attack hitting all nearby enemies for 150% weapon damage." },
      { name: "Shield Bash", desc: "Slam your shield into an enemy, stunning them for 2 seconds." },
      { name: "Battle Cry", desc: "Rally nearby allies, granting +20% Attack for 5 seconds." },
    ],
  },
  {
    key: "archer",
    emoji: "🏹",
    label: "Archer",
    rank: "D",
    archetype: "RANGER / BURST DPS",
    desc: "Ranged precision. High Speed & Crit.",
    lore: "Swift and deadly, the Archer strikes from the shadows before the enemy knows they are there.",
    tags: ["Precision", "Speed", "Ranged", "Critical Strike", "Evasion"],
    gradient: "linear-gradient(135deg, #14532d 0%, #0a1a0f 100%)",
    stats: { hp: 95, attack: 14, defense: 6, magic: 5, speed: 18 },
    abilities: [
      { name: "Precise Shot", desc: "A perfectly aimed shot that always lands a critical hit." },
      { name: "Rain of Arrows", desc: "Fire a volley of arrows in a wide area, hitting multiple targets." },
      { name: "Evasive Roll", desc: "Quickly roll to dodge incoming attacks, gaining brief invincibility." },
    ],
  },
  {
    key: "mage",
    emoji: "🔮",
    label: "Arcane Mage",
    rank: "C",
    archetype: "MAGE / BURST DPS",
    desc: "Burst damage specialist. High Magic.",
    lore: "Channeling arcane energies beyond mortal comprehension, the Mage reshapes reality itself.",
    tags: ["Arcane Power", "Burst Damage", "Spellcasting", "Area of Effect", "Intelligence"],
    gradient: "linear-gradient(135deg, #3b0764 0%, #0f0320 100%)",
    stats: { hp: 80, attack: 8, defense: 4, magic: 22, speed: 12 },
    abilities: [
      { name: "Fireball", desc: "Hurl an explosive ball of fire dealing 300% magic damage in an area." },
      { name: "Arcane Surge", desc: "Temporarily boost your magic power by 50% for 4 seconds." },
      { name: "Blink", desc: "Teleport instantly to a targeted location, leaving a decoy behind." },
    ],
  },
  {
    key: "healer",
    emoji: "✨",
    label: "Healer",
    rank: "C",
    archetype: "SUPPORT / HEALER",
    desc: "Divine support. Heals & buffs allies.",
    lore: "Blessed by celestial forces, the Healer keeps their allies standing through the direst of battles.",
    tags: ["Holy Light", "Support", "Restoration", "Divine Protection", "Blessings"],
    gradient: "linear-gradient(135deg, #713f12 0%, #1c0f00 100%)",
    stats: { hp: 100, attack: 7, defense: 8, magic: 18, speed: 11 },
    abilities: [
      { name: "Holy Light", desc: "Flood an ally with divine energy, restoring 60% of their max HP." },
      { name: "Divine Shield", desc: "Encase an ally in a protective barrier that absorbs all damage for 3 seconds." },
      { name: "Resurrection", desc: "Bring a fallen ally back from death with 50% of their HP." },
    ],
  },
  {
    key: "tank",
    emoji: "🛡️",
    label: "Tank",
    rank: "C",
    archetype: "TANK / DEFENSE",
    desc: "Unbreakable wall. Absorbs all damage.",
    lore: "A living fortress. The Tank has never taken a step backward and never will.",
    tags: ["Iron Defense", "Endurance", "Taunt", "Fortress Stance", "Shield Wall"],
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #0a1520 100%)",
    stats: { hp: 180, attack: 10, defense: 20, magic: 2, speed: 5 },
    abilities: [
      { name: "Iron Wall", desc: "Harden your defenses, reducing all incoming damage by 60% for 5 seconds." },
      { name: "Taunt", desc: "Force all nearby enemies to focus their attacks on you alone." },
      { name: "Fortress Stance", desc: "Plant your feet and become immovable, greatly boosting Defense." },
    ],
  },
  {
    key: "rogue",
    emoji: "🌑",
    label: "Shadow Rogue",
    rank: "B",
    archetype: "ASSASSIN / BURST DPS",
    desc: "Master of stealth, poison & critical strikes.",
    lore: "Born from the void between stars, the Shadow Rogue strikes where it hurts most.",
    tags: ["Stealth", "Speed", "Poison", "Shadow Magic", "Critical Strike"],
    gradient: "linear-gradient(135deg, #1a0533 0%, #080010 100%)",
    stats: { hp: 90, attack: 16, defense: 5, magic: 8, speed: 22 },
    abilities: [
      { name: "Shadow Strike", desc: "Strike from the shadows for 400% weapon damage. Always crits from stealth." },
      { name: "Poison Blade", desc: "Coat your blade in deadly toxin, dealing damage over time." },
      { name: "Vanish", desc: "Fade into the shadows, becoming untargetable for 3 seconds." },
    ],
  },
  {
    key: "chrono",
    emoji: "⏳",
    label: "Chronomancer",
    rank: "B",
    archetype: "MAGE / CONTROLLER",
    desc: "Bends time itself. Heals & controls the field.",
    lore: "Time is a river. The Chronomancer is the dam.",
    tags: ["Time Magic", "Control", "Temporal Shift", "Haste", "Rewind"],
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #01111e 100%)",
    stats: { hp: 105, attack: 6, defense: 9, magic: 20, speed: 13 },
    abilities: [
      { name: "Time Stop", desc: "Freeze all enemies in place for 2 seconds — time itself obeys you." },
      { name: "Rewind", desc: "Reverse your position in time, healing to your HP from 3 seconds ago." },
      { name: "Haste", desc: "Accelerate your actions, granting +100% Speed and double attacks." },
    ],
  },
  {
    key: "draconid",
    emoji: "🐉",
    label: "Draconid Warlord",
    rank: "A",
    archetype: "WARRIOR / DESTROYER",
    desc: "Born of Dragons. Devastating power & presence.",
    lore: "Half dragon, half warrior, entirely unstoppable. The Draconid Warlord commands fear from birth.",
    tags: ["Dragon Fire", "Draconic Power", "Terror", "Scales", "Dominance"],
    gradient: "linear-gradient(135deg, #7c2d12 0%, #200800 100%)",
    stats: { hp: 160, attack: 22, defense: 12, magic: 5, speed: 10 },
    abilities: [
      { name: "Dragon Breath", desc: "Exhale a cone of dragonfire, burning all enemies for massive damage." },
      { name: "Dragon Scales", desc: "Manifest draconic armor, adding 40% physical resistance." },
      { name: "Draconic Roar", desc: "Let out a terrifying roar, reducing all enemy attack by 30%." },
    ],
  },
  {
    key: "crystalforged",
    emoji: "💎",
    label: "Crystalforged",
    rank: "S",
    archetype: "TANK / COLOSSUS",
    desc: "Living crystal construct. Truly unbreakable.",
    lore: "Created in the heart of a dying star, the Crystalforged is the pinnacle of magical engineering.",
    tags: ["Crystal Armor", "Colossus", "Shard Magic", "Immunity", "Crystallize"],
    gradient: "linear-gradient(135deg, #164e63 0%, #010f14 100%)",
    stats: { hp: 220, attack: 12, defense: 25, magic: 3, speed: 4 },
    abilities: [
      { name: "Crystal Barrier", desc: "Erect a crystalline shield that absorbs 500% of your Defense." },
      { name: "Shard Burst", desc: "Explode crystal shards in all directions, hitting every nearby enemy." },
      { name: "Crystallize", desc: "Encase an enemy in crystal, rooting them in place for 4 seconds." },
    ],
  },
];

const MAX_STATS = { hp: 220, attack: 22, defense: 25, magic: 22, speed: 22 };

const RankBadge = ({ rank }: { rank: string }) => {
  const colors: Record<string, { color: string; bg: string }> = {
    S: { color: "#2dd4bf", bg: "rgba(45,212,191,0.15)" },
    A: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    B: { color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
    C: { color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
    D: { color: "#9ca3af", bg: "rgba(156,163,175,0.15)" },
  };
  const c = colors[rank] ?? colors.D;
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded"
      style={{ color: c.color, background: c.bg }}
    >
      Rank {rank}
    </span>
  );
};

const StatBar = ({ label, value, max }: { label: string; value: number; max: number }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: "#9ca3af" }}>
          {label}
        </span>
        <span className="text-xs font-mono text-white">{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "#7c6ff7" }}
        />
      </div>
    </div>
  );
};

export const Classes = () => {
  const [selected, setSelected] = useState<ClassKey>("rogue");
  const cls = CLASSES.find((c) => c.key === selected) ?? CLASSES[0];

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: "#7c6ff7" }} />
          <h1 className="text-xl font-bold text-white">Character Classes</h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          9 unique classes — each with distinct stats and abilities
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {CLASSES.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelected(c.key)}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5"
            style={
              selected === c.key
                ? { background: "#7c6ff7", color: "#ffffff" }
                : {
                    background: "#141927",
                    color: "#6b7280",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }
            }
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div
            className="rounded-lg overflow-hidden"
            style={{ background: "#141927", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-40 flex items-end p-5"
              style={{ background: cls.gradient }}
            >
              <div>
                <div className="text-4xl mb-2">{cls.emoji}</div>
                <div className="text-2xl font-bold text-white">{cls.label}</div>
                <div className="flex items-center gap-2 mt-1">
                  <RankBadge rank={cls.rank} />
                  <span className="text-xs tracking-widest" style={{ color: "#9ca3af" }}>
                    {cls.archetype}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {cls.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      color: "#9ca3af",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
                {cls.lore}
              </p>

              <div>
                <div
                  className="text-xs font-semibold tracking-wider uppercase mb-3"
                  style={{ color: "#6b7280" }}
                >
                  Attributes
                </div>
                <div className="space-y-2.5">
                  <StatBar label="HP" value={cls.stats.hp} max={MAX_STATS.hp} />
                  <StatBar label="Attack" value={cls.stats.attack} max={MAX_STATS.attack} />
                  <StatBar label="Defense" value={cls.stats.defense} max={MAX_STATS.defense} />
                  <StatBar label="Magic" value={cls.stats.magic} max={MAX_STATS.magic} />
                  <StatBar label="Speed" value={cls.stats.speed} max={MAX_STATS.speed} />
                </div>
              </div>

              <div>
                <div
                  className="text-xs font-semibold tracking-wider uppercase mb-3"
                  style={{ color: "#6b7280" }}
                >
                  Abilities
                </div>
                <div className="space-y-3">
                  {cls.abilities.map((ability) => (
                    <div
                      key={ability.name}
                      className="rounded p-3"
                      style={{
                        background: "rgba(124,111,247,0.07)",
                        border: "1px solid rgba(124,111,247,0.15)",
                      }}
                    >
                      <div className="text-sm font-semibold text-white mb-0.5">
                        {ability.name}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
                        {ability.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {CLASSES.filter((c) => c.key !== selected).map((c) => (
            <button
              key={c.key}
              onClick={() => setSelected(c.key)}
              className="w-full text-left rounded-lg p-3 transition-colors"
              style={{
                background: "#141927",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,111,247,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,111,247,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#141927";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-white">{c.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                    Rank {c.rank} · {c.desc}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
