import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

type Mission = {
  id: number;
  user_id: number;
  username: string;
  difficulty: string;
  label: string;
  emoji: string;
  status: "completed" | "failed" | "in_progress";
  started_at: string;
  ends_at: string;
};

type StatusFilter = "all" | "in_progress" | "completed" | "failed";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

const DIFF_COLORS: Record<string, { color: string; background: string; border: string }> = {
  quick: { color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" },
  normal: { color: "#60a5fa", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)" },
  hard: { color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" },
  epic: { color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" },
};

const DIFF_LABELS: Record<string, string> = {
  quick: "Easy",
  normal: "Normal",
  hard: "Hard",
  epic: "Elite",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "completed") return <CheckCircle className="w-4 h-4" style={{ color: "#4ade80" }} />;
  if (status === "failed") return <XCircle className="w-4 h-4" style={{ color: "#ef4444" }} />;
  return <Clock className="w-4 h-4" style={{ color: "#f59e0b" }} />;
};

export const Missions = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["missions-log", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/missions-log?${params}`);
      if (!res.ok) throw new Error("fetch failed");
      return res.json() as Promise<{ missions: Mission[] }>;
    },
  });

  const missions = data?.missions ?? [];

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5" style={{ color: "#7c6ff7" }} />
          <h1 className="text-xl font-bold text-white">Mission Log</h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          All missions across Astralis
        </p>
      </div>

      <div className="flex items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
            style={
              statusFilter === tab.key
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
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["MISSION", "DIFFICULTY", "STATUS", "PLAYER", "TIME"].map((h) => (
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
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" style={{ background: "#1e2a3a" }} />
                      </td>
                    ))}
                  </tr>
                ))
              : missions.map((m) => {
                  const diff = DIFF_COLORS[m.difficulty] ?? DIFF_COLORS.normal;
                  return (
                    <tr
                      key={m.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">
                          {m.emoji} {m.label}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                          #{m.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium capitalize"
                          style={diff}
                        >
                          {DIFF_LABELS[m.difficulty] ?? m.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusIcon status={m.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {m.username}
                        <span className="text-xs ml-1" style={{ color: "#6b7280" }}>
                          #{m.user_id}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#6b7280" }}>
                        {formatDistanceToNow(new Date(m.started_at), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
            {!isLoading && missions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: "#6b7280" }}>
                  No missions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
