import { useGetBurnReport, useGetRecentBurns } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/constants";
import { Flame, Droplet, ArrowUpRight, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

export const Burns = () => {
  const { data: report, isLoading: reportLoading } = useGetBurnReport();
  const { data: recent, isLoading: recentLoading } = useGetRecentBurns({ limit: 15 });

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-accent/10 border border-accent/20 mb-4 animate-pulse-slow">
          <Flame className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-glow-accent text-accent tracking-widest uppercase">
          The Cosmic Forge
        </h1>
        <p className="font-mono text-muted-foreground">
          Tokens burned in the forge are removed from existence, fueling the arcane engine and rewarding the faithful.
        </p>
      </div>

      {reportLoading ? (
        <Skeleton className="h-48 w-full max-w-4xl mx-auto rounded-xl bg-card border border-primary/10" />
      ) : report ? (
        <div className="max-w-4xl mx-auto">
          <Card className="glass-panel border-accent/30 shadow-[0_0_30px_rgba(251,191,36,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -z-10" />
            <CardContent className="p-8 space-y-8">
              <div className="text-center">
                <span className="font-mono text-sm text-accent uppercase tracking-widest">Total $MAGIC Sacrificed</span>
                <div className="text-5xl md:text-7xl font-serif font-black text-glow-accent text-accent mt-2">
                  {formatNumber(report.total_burned)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-mono uppercase text-muted-foreground">
                  <span>Burn Split</span>
                  <span>100%</span>
                </div>
                
                {/* Visual representation of the split: 30% burn, 20% marketing, 10% buyback, 40% rewards */}
                <div className="h-4 w-full flex rounded-full overflow-hidden opacity-80">
                  <div className="bg-red-500 h-full" style={{ width: '30%' }} title="Forever Burned (30%)" />
                  <div className="bg-purple-500 h-full" style={{ width: '40%' }} title="Rewards Pool (40%)" />
                  <div className="bg-blue-500 h-full" style={{ width: '20%' }} title="Marketing (20%)" />
                  <div className="bg-green-500 h-full" style={{ width: '10%' }} title="Buyback (10%)" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <SplitStat label="Forever Burned" value={report.total_burned * 0.3} percent="30%" color="text-red-500" />
                  <SplitStat label="Rewards Pool" value={report.total_to_rewards} percent="40%" color="text-purple-500" />
                  <SplitStat label="Marketing" value={report.total_to_marketing} percent="20%" color="text-blue-500" />
                  <SplitStat label="Buyback Engine" value={report.total_to_buyback} percent="10%" color="text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-serif tracking-widest flex items-center gap-3 border-b border-primary/20 pb-4">
          <History className="w-6 h-6 text-primary" />
          Recent Sacrifices
        </h2>

        <div className="space-y-3">
          {recentLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg bg-card border border-primary/10" />)
          ) : (
            recent?.burns.map((burn) => (
              <div key={burn.id} className="glass-panel p-4 rounded-lg flex items-center justify-between border-primary/10 hover:border-accent/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-serif text-lg text-foreground">{burn.username}</div>
                    <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                      <span>{formatDistanceToNow(new Date(burn.burned_at), { addSuffix: true })}</span>
                      <span>•</span>
                      <a href={`https://solscan.io/tx/${burn.tx_signature}`} target="_blank" rel="noreferrer" className="flex items-center hover:text-primary transition-colors">
                        Tx <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono font-bold text-accent text-lg">
                    {formatNumber(burn.total_amount)}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase">
                    $MAGIC
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SplitStat = ({ label, value, percent, color }: { label: string, value: number, percent: string, color: string }) => (
  <div className="p-3 bg-background/50 rounded border border-primary/10 flex flex-col gap-1">
    <div className="flex items-center justify-between font-mono text-[10px] uppercase">
      <span className="text-muted-foreground">{label}</span>
      <span className={color}>{percent}</span>
    </div>
    <span className={`font-mono font-bold ${color}`}>{formatNumber(value)}</span>
  </div>
);