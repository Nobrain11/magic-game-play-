import { useGetGameStats, useGetActivity, useGetRecentBurns } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/constants";
import { Zap, Swords, Compass, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

type ExtendedStats = {
  total_players: number;
  total_missions_completed: number;
  total_pvp_battles: number;
  total_magic_burned: number;
  active_24h: number;
  top_class: string;
  avg_level: number;
};

const StatCard = ({
  label,
  value,
  color,
  desc,
}: {
  label: string;
  value: React.ReactNode;
  color: string;
  desc?: string;
}) => (
  <div
    className="rounded-lg p-5"
    style={{
      background: "#141927",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div
      className="text-[11px] tracking-wider mb-2 uppercase"
      style={{ color: "#6b7280" }}
    >
      {label}
    </div>
    <div className="text-3xl font-bold" style={{ color }}>
      {value}
    </div>
    {desc && (
      <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
        {desc}
      </div>
    )}
  </div>
);

const FeedPanel = ({
  title,
  icon: Icon,
  items,
  loading,
}: {
  title: string;
  icon: React.ElementType;
  items: { text: string; time: string; accent?: string }[];
  loading: boolean;
}) => (
  <div
    className="rounded-lg overflow-hidden"
    style={{
      background: "#141927",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div
      className="flex items-center gap-2 px-4 py-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <Icon className="w-4 h-4" style={{ color: "#7c6ff7" }} />
      <span className="text-xs font-semibold tracking-wider uppercase text-white">
        {title}
      </span>
    </div>
    <div className="divide-y divide-white/5">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-3 space-y-1">
              <Skeleton className="h-3 w-3/4" style={{ background: "#1e2a3a" }} />
              <Skeleton className="h-2 w-1/3" style={{ background: "#1e2a3a" }} />
            </div>
          ))
        : items.length === 0
        ? (
          <div className="px-4 py-6 text-center text-xs" style={{ color: "#6b7280" }}>
            No data yet
          </div>
        )
        : items.map((item, i) => (
            <div key={i} className="px-4 py-3" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
              <div className="text-sm text-white leading-snug">{item.text}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                {item.time}
              </div>
            </div>
          ))}
    </div>
  </div>
);

export const Home = () => {
  const { data: rawStats, isLoading: statsLoading } = useGetGameStats();
  const stats = rawStats as ExtendedStats | undefined;
  const { data: activity, isLoading: activityLoading } = useGetActivity({ limit: 20 });
  const { data: burnsData, isLoading: burnsLoading } = useGetRecentBurns({ limit: 5 });

  const activityItems = activity?.items ?? [];
  const battleItems = activityItems
    .filter((i) => i.type === "pvp")
    .slice(0, 5)
    .map((i) => ({
      text: i.description,
      time: formatDistanceToNow(new Date(i.timestamp), { addSuffix: true }),
    }));
  const missionItems = activityItems
    .filter((i) => i.type === "mission")
    .slice(0, 5)
    .map((i) => ({
      text: i.description,
      time: formatDistanceToNow(new Date(i.timestamp), { addSuffix: true }),
    }));
  const burnItems = (burnsData?.burns ?? []).slice(0, 5).map((b) => ({
    text: `${b.username ?? `Player#${b.user_id}`} burned ${formatNumber(b.burned)} ASTRAL`,
    time: formatDistanceToNow(new Date(b.burned_at), { addSuffix: true }),
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: "#7c6ff7" }} />
          <h1 className="text-xl font-bold text-white">Command Overview</h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          Live snapshot of the Astralis universe
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Players"
          value={statsLoading ? "—" : formatNumber(stats?.total_players ?? 0)}
          color="#7c6ff7"
          desc="Registered characters"
        />
        <StatCard
          label="Total Missions"
          value={statsLoading ? "—" : formatNumber(stats?.total_missions_completed ?? 0)}
          color="#7c6ff7"
          desc="Missions completed"
        />
        <StatCard
          label="Total Battles"
          value={statsLoading ? "—" : formatNumber(stats?.total_pvp_battles ?? 0)}
          color="#7c6ff7"
          desc="PvP fights logged"
        />
        <StatCard
          label="Tokens Burned"
          value={statsLoading ? "—" : formatNumber(stats?.total_magic_burned ?? 0)}
          color="#f59e0b"
          desc="ASTRAL tokens burned"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Active (24H)"
          value={statsLoading ? "—" : stats?.active_24h ?? 0}
          color="#4ade80"
          desc="Players active today"
        />
        <StatCard
          label="Top Class"
          value={
            statsLoading
              ? "—"
              : (stats?.top_class ?? "—").charAt(0).toUpperCase() +
                (stats?.top_class ?? "").slice(1)
          }
          color="#ffffff"
          desc="Most popular class"
        />
        <StatCard
          label="Avg Level"
          value={statsLoading ? "—" : stats?.avg_level ?? 1}
          color="#4ade80"
          desc="Average player level"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FeedPanel
          title="Recent Battles"
          icon={Swords}
          items={battleItems}
          loading={activityLoading}
        />
        <FeedPanel
          title="Recent Missions"
          icon={Compass}
          items={missionItems}
          loading={activityLoading}
        />
        <FeedPanel
          title="Recent Burns"
          icon={Flame}
          items={burnItems}
          loading={burnsLoading}
        />
      </div>
    </div>
  );
};
