import { useQuery } from "@tanstack/react-query";
import { Swords } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { formatNumber, CLASSES } from "@/lib/constants";

type Battle = {
  id: number;
  attacker_id: number;
  attacker_username: string;
  attacker_class: string;
  defender_id: number;
  defender_username: string;
  defender_class: string;
  winner_id: number;
  magic_won: number;
  draw: boolean;
  fought_at: string;
};

export const Arena = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["battles"],
    queryFn: async () => {
      const res = await fetch("/api/battles?limit=50");
      if (!res.ok) throw new Error("fetch failed");
      return res.json() as Promise<{ battles: Battle[] }>;
    },
  });

  const battles = data?.battles ?? [];

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5" style={{ color: "#7c6ff7" }} />
          <h1 className="text-xl font-bold text-white">Arena</h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          Recent PvP battles across Astralis
        </p>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: "#141927", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["ATTACKER", "VS", "DEFENDER", "WINNER", "MAGIC WON", "TIME"].map((h) => (
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
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-20" style={{ background: "#1e2a3a" }} />
                      </td>
                    ))}
                  </tr>
                ))
              : battles.map((b) => {
                  const atkClass = CLASSES[b.attacker_class];
                  const defClass = CLASSES[b.defender_class];
                  const attackerWon = b.winner_id === b.attacker_id;

                  return (
                    <tr
                      key={b.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">{b.attacker_username}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                          {atkClass?.emoji ?? ""} {b.attacker_class}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold" style={{ color: "#6b7280" }}>
                        VS
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">{b.defender_username}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                          {defClass?.emoji ?? ""} {b.defender_class}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {b.draw ? (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ color: "#9ca3af", background: "rgba(156,163,175,0.1)", border: "1px solid rgba(156,163,175,0.2)" }}>
                            Draw
                          </span>
                        ) : (
                          <span
                            className="text-sm font-medium"
                            style={{ color: attackerWon ? "#4ade80" : "#f59e0b" }}
                          >
                            {attackerWon ? b.attacker_username : b.defender_username}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: "#f59e0b" }}>
                        {formatNumber(b.magic_won)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#6b7280" }}>
                        {formatDistanceToNow(new Date(b.fought_at), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
            {!isLoading && battles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: "#6b7280" }}>
                  <Swords className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No battles yet. Challenge someone with /arena in Telegram!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
