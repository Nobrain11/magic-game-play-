import { useGetGuilds } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/constants";
import { Shield, Users, Crown, Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export const Guilds = () => {
  const { data, isLoading } = useGetGuilds();

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-serif font-bold text-glow tracking-widest flex items-center justify-center gap-3 uppercase">
          <Shield className="w-10 h-10 text-primary" />
          Guild Halls
        </h1>
        <p className="font-mono text-muted-foreground">
          Factions forged in the void. Unite to conquer raid bosses and claim dominance over the realm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl bg-card border border-primary/10" />)
        ) : data?.guilds.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
            <p className="font-mono text-muted-foreground">No guilds have been founded yet.</p>
          </div>
        ) : (
          data?.guilds.map((guild) => (
            <Card key={guild.id} className="glass-panel overflow-hidden border-primary/20 hover:border-primary/50 transition-all hover:-translate-y-1 relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors -z-10" />
              
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-2xl font-bold tracking-wide text-glow">{guild.name}</h3>
                    <div className="font-mono text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Crown className="w-3 h-3 text-accent" />
                      Leader: <span className="text-foreground">{guild.leader_username}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded bg-background border border-primary/30">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">Lvl</span>
                    <span className="font-serif font-bold text-primary">{guild.level}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/50 border border-primary/10 p-3 rounded flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-mono text-[10px] uppercase text-muted-foreground">Members</div>
                      <div className="font-mono font-bold">{guild.member_count}</div>
                    </div>
                  </div>
                  
                  <div className={`border p-3 rounded flex items-center gap-3 ${
                    guild.raid_boss ? 'bg-red-500/10 border-red-500/30' : 'bg-background/50 border-primary/10'
                  }`}>
                    <Skull className={`w-5 h-5 ${guild.raid_boss ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="font-mono text-[10px] uppercase text-muted-foreground">Status</div>
                      <div className={`font-mono font-bold text-sm ${guild.raid_boss ? 'text-red-400' : 'text-foreground'}`}>
                        {guild.raid_boss ? 'In Raid' : 'Idle'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs font-mono text-muted-foreground border-t border-primary/10">
                  <span>Founded</span>
                  <span>{formatDistanceToNow(new Date(guild.created_at))} ago</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};