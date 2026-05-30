import { useGetGameStats, useGetActivity } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/constants";
import { Activity, Users, Flame, Swords, Target, Crosshair } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export const Home = () => {
  const { data: stats, isLoading: statsLoading } = useGetGameStats();
  const { data: activity, isLoading: activityLoading } = useGetActivity({ limit: 10 });

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 relative max-w-4xl mx-auto pt-10 pb-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow pointer-events-none" />
        
        <h1 className="text-5xl md:text-7xl font-serif font-black tracking-widest text-glow uppercase leading-tight">
          The Void <br/>
          <span className="text-accent text-glow-accent">Awakens</span>
        </h1>
        <p className="font-mono text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Gaze into the arcane data stream of Astralis. A universe fueled by blood, magic, and cosmic fire.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Souls Bound" 
          value={stats?.total_players} 
          icon={<Users className="w-5 h-5" />} 
          loading={statsLoading}
        />
        <StatCard 
          title="Magic Burned" 
          value={stats?.total_magic_burned} 
          icon={<Flame className="w-5 h-5 text-accent" />} 
          loading={statsLoading}
          highlight
        />
        <StatCard 
          title="Battles Fought" 
          value={stats?.total_pvp_battles} 
          icon={<Swords className="w-5 h-5" />} 
          loading={statsLoading}
        />
        <StatCard 
          title="Active Missions" 
          value={stats?.active_missions} 
          icon={<Target className="w-5 h-5" />} 
          loading={statsLoading}
        />
      </section>

      {/* Activity Feed */}
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-serif tracking-widest">Live Observatory</h2>
        </div>

        <div className="space-y-4">
          {activityLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg bg-card border border-primary/10" />)
          ) : (
            activity?.items.map((item) => (
              <Card key={item.id} className="glass-panel overflow-hidden border-primary/10 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-background border ${
                    item.type === 'pvp' ? 'border-red-500/50 text-red-500' :
                    item.type === 'burn' ? 'border-accent/50 text-accent' :
                    item.type === 'guild_raid' ? 'border-purple-500/50 text-purple-500' :
                    'border-blue-500/50 text-blue-500'
                  }`}>
                    {item.type === 'pvp' && <Swords className="w-5 h-5" />}
                    {item.type === 'burn' && <Flame className="w-5 h-5" />}
                    {item.type === 'guild_raid' && <Shield className="w-5 h-5" />}
                    {item.type === 'mission' && <Crosshair className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-mono text-sm leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                      {item.magic_amount && (
                        <span className="text-primary font-bold">+{formatNumber(item.magic_amount)} $MAGIC</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, value, icon, loading, highlight = false }: { title: string, value?: number, icon: React.ReactNode, loading: boolean, highlight?: boolean }) => {
  return (
    <Card className={`glass-panel overflow-hidden ${highlight ? 'border-accent/50 shadow-[0_0_20px_rgba(251,191,36,0.15)]' : ''}`}>
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between text-muted-foreground font-mono text-sm uppercase tracking-wider">
          <span>{title}</span>
          {icon}
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-10 w-24 bg-primary/20" />
          ) : (
            <span className={`text-4xl font-serif font-bold tracking-wider ${highlight ? 'text-accent text-glow-accent' : 'text-glow'}`}>
              {value ? formatNumber(value) : '0'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Import Shield for the activity feed since it wasn't in the initial import
import { Shield } from "lucide-react";