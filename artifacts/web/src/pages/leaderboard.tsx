import { useState } from "react";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { CLASSES, RANKS, formatNumber } from "@/lib/constants";
import { Trophy, Star, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
type LeaderboardBy = "level" | "magic_balance" | "pvp_wins";

export const Leaderboard = () => {
  const [filterBy, setFilterBy] = useState<LeaderboardBy>("level");
  
  const { data, isLoading } = useGetLeaderboard({ 
    by: filterBy,
    limit: 50 
  });

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-glow tracking-widest flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            HALL OF HEROES
          </h1>
          <p className="font-mono text-muted-foreground mt-2">The most powerful entities in the cosmos.</p>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={filterBy} onValueChange={(val) => setFilterBy(val as GetLeaderboardBy)}>
            <SelectTrigger className="glass-panel font-mono border-primary/30">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30 text-foreground font-mono">
              <SelectItem value="level">Sort by Level</SelectItem>
              <SelectItem value="magic_balance">Sort by $MAGIC</SelectItem>
              <SelectItem value="pvp_wins">Sort by PvP Wins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg bg-card/50 border border-primary/10" />)
        ) : (
          <div className="grid gap-3">
            {data?.entries.map((player, idx) => {
              const charClass = player.class.toLowerCase();
              const classData = CLASSES[charClass] || { emoji: '👤', color: 'text-gray-400' };
              const rankData = RANKS[player.player_rank] || { emoji: '⚪', color: 'text-gray-400' };
              
              const isTop3 = idx < 3;

              return (
                <Card key={player.user_id} className={`glass-panel overflow-hidden transition-transform hover:scale-[1.01] ${
                  isTop3 ? 'border-accent/40 bg-accent/5' : 'border-primary/10'
                }`}>
                  <CardContent className="p-4 md:p-6 flex items-center gap-4 md:gap-6">
                    <div className={`w-12 h-12 flex items-center justify-center font-serif text-2xl font-bold rounded-full ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                      idx === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/50' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-700 border border-amber-700/50' :
                      'bg-background border border-primary/20 text-muted-foreground'
                    }`}>
                      #{player.rank}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 items-center">
                      <div className="md:col-span-2 flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className={`font-serif text-xl tracking-wide ${isTop3 ? 'text-glow-accent text-accent' : 'text-foreground'}`}>
                            {player.username}
                          </span>
                          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground mt-1">
                            <span className={classData.color}>{classData.emoji} {player.class}</span>
                            <span>•</span>
                            <span className={rankData.color}>{rankData.emoji} Rank {player.player_rank}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 font-mono text-sm md:col-span-2 justify-start md:justify-end">
                        <div className="flex flex-col items-center">
                          <span className="text-muted-foreground text-[10px] uppercase">Level</span>
                          <span className="font-bold flex items-center gap-1"><Star className="w-3 h-3 text-primary" /> {player.level}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-muted-foreground text-[10px] uppercase">$MAGIC</span>
                          <span className="font-bold flex items-center gap-1 text-primary">{formatNumber(player.magic_balance)}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-muted-foreground text-[10px] uppercase">W/L</span>
                          <span className="font-bold flex items-center gap-1 text-accent">
                            {player.pvp_wins} <span className="text-muted-foreground mx-0.5">/</span> {player.pvp_losses}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};