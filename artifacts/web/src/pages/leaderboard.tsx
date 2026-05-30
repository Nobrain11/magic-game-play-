import { useState } from "react";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { formatNumber, CLASSES } from "@/lib/constants";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SortBy = "level" | "pvp_wins" | "xp" | "damage";

type LeaderboardEntry = {
  rank: number;
  user_id: number;
  username: string;
  class: string;
  level: number;
  xp: number;
  pvp_wins: number;
  pvp_losses: number;
  total_damage: number;
  player_rank: string;
};

const TABS: { key: SortBy; label: string }[] = [
  { key: "level", label: "Level" },
  { key: "pvp_wins", label: "Wins" },
  { key: "xp", label: "XP" },
  { key: "damage", label: "Total Damage" },
];

const rankBadgeStyle = (rank: string) => {
  const r = (rank ?? "").toLowerCase();
  if (r.includes("diamond"))
    return { color: "#2dd4bf", background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.3)" };
  if (r.includes("platinum"))
    return { color: "#60a5fa", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)" };
  if (r.includes("gold"))
    return { color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" };
  if (r.includes("silver"))
    return { color: "#cbd5e1", background: "rgba(203,213,225,0.1)", border: "1px solid rgba(203,213,225,0.3)" };
  if (r.includes("master") || r.includes("legend"))
    return { color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)" };
  return { color: "#9ca3af", background: "rgba(156,163,175,0.1)", border: "1px solid rgba(156,163,175,0.3)" };
};

export const Leaderboard = () => {
  const [sortBy, setSortBy] = useState<SortBy>("level");

  const { data, isLoading } = useGetLeaderboard({
    by: sortBy === "damage" ? "pvp_wins" : sortBy === "xp" ? "level" : sortBy as "level" | "pvp_wins" | "magic_balance",
    limit: 50,
  });

  const entries = ((data?.entries ?? []) as unknown as LeaderboardEntry[]).slice().sort((a, b) => {
    if (sortBy === "damage") return (b.total_damage ?? 0) - (a.total_damage ?? 0);
    if (sortBy === "xp") return b.xp - a.xp;
    if (sortBy === "pvp_wins") return b.pvp_wins - a.pvp_wins;
    return b.level - a.level;
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: "#7c6ff7" }} />
          <h1 className="text-xl font-bold text-white">Leaderboard</h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          Top players ranked by performance
        </p>
      </div>

      <div className="flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSortBy(tab.key)}
            className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
            style={
              sortBy === tab.key
                ? { background: "#7c6ff7", color: "#ffffff" }
                : {
                    background: "#141927",
                    color: "#6b7280",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: "#141927", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["#", "PLAYER", "LEVEL", "XP", "WINS", "DAMAGE", "RANK"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider"
                  style={{ color: "#6b7280" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-16" style={{ background: "#1e2a3a" }} />
                      </td>
                    ))}
                  </tr>
                ))
              : entries.map((entry, i) => {
                  const cls = CLASSES[entry.class];
                  return (
                    <tr
                      key={entry.user_id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.1s" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                      }}
                    >
                      <td className="px-4 py-3 text-sm" style={{ color: "#6b7280" }}>
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-white">{entry.username}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                          {cls?.emoji ?? ""} {entry.class} · #{entry.user_id}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: "#7c6ff7" }}>
                        {entry.level}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#4ade80" }}>
                        {formatNumber(entry.xp)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#4ade80" }}>
                        {entry.pvp_wins}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#f59e0b" }}>
                        {formatNumber(entry.total_damage ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium capitalize"
                          style={rankBadgeStyle(entry.player_rank)}
                        >
                          {entry.player_rank}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            {!isLoading && entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: "#6b7280" }}>
                  No players yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
