import { useGetGuilds } from "@workspace/api-client-react";
import { Shield, Users, Coins, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { formatNumber } from "@/lib/constants";

type GuildRow = {
  id: number;
  name: string;
  leader_id: number;
  leader_username: string;
  level: number;
  xp: number;
  member_count: number;
  created_at: string;
  wins?: number;
  losses?: number;
  tag?: string;
};

const guildTag = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.substring(0, 3).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .substring(0, 4)
    .toUpperCase();
};

export const Guilds = () => {
  const { data, isLoading } = useGetGuilds();

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: "#7c6ff7" }} />
          <h1 className="text-xl font-bold text-white">Guilds</h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          All guilds in Astralis
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" style={{ background: "#141927" }} />
          ))}
        </div>
      ) : (data?.guilds ?? []).length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "#6b7280" }}>
          <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
          No guilds founded yet
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(data?.guilds ?? []).map((guild) => {
            const g = guild as GuildRow;
            const tag = g.tag ?? guildTag(g.name);
            const wins = g.wins ?? 0;
            const losses = g.losses ?? 0;
            const bank = formatNumber(g.xp ?? 0);

            return (
              <div
                key={g.id}
                className="rounded-lg p-5"
                style={{
                  background: "#141927",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{
                          color: "#7c6ff7",
                          background: "rgba(124,111,247,0.12)",
                          border: "1px solid rgba(124,111,247,0.25)",
                        }}
                      >
                        [{tag}]
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white mt-1">{g.name}</div>
                    <div className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
                      A guild in the Astralis universe
                    </div>
                  </div>
                  <div className="text-right flex-none">
                    <div className="text-[11px] tracking-wider uppercase" style={{ color: "#6b7280" }}>
                      Level
                    </div>
                    <div className="text-2xl font-bold" style={{ color: "#7c6ff7" }}>
                      {g.level}
                    </div>
                  </div>
                </div>

                <div
                  className="grid grid-cols-3 gap-3 mt-4 pt-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                      <span className="text-[11px] tracking-wider uppercase" style={{ color: "#6b7280" }}>
                        Members
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {g.member_count}
                      <span style={{ color: "#6b7280" }}>/50</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                      <span className="text-[11px] tracking-wider uppercase" style={{ color: "#6b7280" }}>
                        Record
                      </span>
                    </div>
                    <div className="text-sm font-semibold">
                      <span style={{ color: "#4ade80" }}>{wins}W</span>
                      {" "}
                      <span style={{ color: "#ef4444" }}>{losses}L</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Coins className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                      <span className="text-[11px] tracking-wider uppercase" style={{ color: "#6b7280" }}>
                        Bank
                      </span>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: "#f59e0b" }}>
                      {bank}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between mt-4 pt-3 text-xs"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    color: "#6b7280",
                  }}
                >
                  <span>Leader: {g.leader_username}</span>
                  <span>
                    Founded{" "}
                    {formatDistanceToNow(new Date(g.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
