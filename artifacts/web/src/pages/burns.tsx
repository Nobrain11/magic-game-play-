import { useGetBurnReport, useGetRecentBurns } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/constants";
import { Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

type ExtendedReport = {
  total_burned: number;
  burn_count: number;
  total_to_rewards: number;
  last_24h: number;
  last_7d: number;
  treasury_share: number;
};

const StatCard = ({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  color: string;
}) => (
  <div
    className="rounded-lg p-5"
    style={{ background: "#141927", border: "1px solid rgba(255,255,255,0.06)" }}
  >
    <div className="text-[11px] tracking-wider uppercase mb-2" style={{ color: "#6b7280" }}>
      {label}
    </div>
    <div className="text-3xl font-bold" style={{ color }}>
      {value}
    </div>
    {sub && (
      <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
        {sub}
      </div>
    )}
  </div>
);

export const Burns = () => {
  const { data: rawReport, isLoading: reportLoading } = useGetBurnReport();
  const report = rawReport as ExtendedReport | undefined;
  const { data: recent, isLoading: recentLoading } = useGetRecentBurns({ limit: 20 });

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5" style={{ color: "#f59e0b" }} />
          <h1 className="text-xl font-bold text-white">Burn Tracker</h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          Token burn statistics and event log
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Burned"
          value={reportLoading ? "—" : formatNumber(report?.total_burned ?? 0)}
          sub="ASTRAL tokens"
          color="#f59e0b"
        />
        <StatCard
          label="Total Burns"
          value={reportLoading ? "—" : report?.burn_count ?? 0}
          sub="Burn events"
          color="#ffffff"
        />
        <StatCard
          label="Treasury Share"
          value={reportLoading ? "—" : formatNumber(report?.treasury_share ?? 0)}
          sub="Allocated to treasury"
          color="#7c6ff7"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Reward Pool"
          value={reportLoading ? "—" : formatNumber(report?.total_to_rewards ?? 0)}
          sub="Allocated to rewards"
          color="#4ade80"
        />
        <StatCard
          label="Last 24H"
          value={reportLoading ? "—" : formatNumber(report?.last_24h ?? 0)}
          sub="ASTRAL burned"
          color="#f59e0b"
        />
        <StatCard
          label="Last 7 Days"
          value={reportLoading ? "—" : formatNumber(report?.last_7d ?? 0)}
          sub="ASTRAL burned"
          color="#7c6ff7"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4" style={{ color: "#f59e0b" }} />
          <span className="text-sm font-semibold tracking-wider uppercase text-white">
            Recent Burn Events
          </span>
        </div>

        <div
          className="rounded-lg overflow-hidden"
          style={{ background: "#141927", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["TRIGGER", "AMOUNT", "TREASURY", "REWARD POOL", "PLAYER", "TIME"].map((h) => (
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
              {recentLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-20" style={{ background: "#1e2a3a" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : (recent?.burns ?? []).map((burn) => {
                    const treasury = Math.floor(burn.burned * 0.5);
                    const rewardPool = burn.burned - treasury;
                    const sigShort = burn.tx_signature
                      ? `sig_${burn.tx_signature.substring(0, 10)}...`
                      : "—";

                    return (
                      <tr
                        key={burn.id}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm text-white">Token Burn</div>
                          <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                            {sigShort}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: "#f59e0b" }}>
                          {formatNumber(burn.burned)}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#9ca3af" }}>
                          {formatNumber(treasury)}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#4ade80" }}>
                          {formatNumber(rewardPool)}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#9ca3af" }}>
                          {burn.username ?? `#${burn.user_id}`}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#6b7280" }}>
                          {formatDistanceToNow(new Date(burn.burned_at), { addSuffix: true })}
                        </td>
                      </tr>
                    );
                  })}
              {!recentLoading && (recent?.burns ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: "#6b7280" }}>
                    No burn events yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};
