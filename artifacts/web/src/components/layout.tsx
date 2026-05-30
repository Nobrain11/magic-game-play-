import { useLocation, Link } from "wouter";
import {
  LayoutGrid,
  Trophy,
  Compass,
  Swords,
  ShoppingBag,
  Flame,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Overview", icon: LayoutGrid },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/missions", label: "Missions", icon: Compass },
  { path: "/arena", label: "Arena", icon: Swords },
  { path: "/market", label: "Market", icon: ShoppingBag },
  { path: "/burns", label: "Burns", icon: Flame },
  { path: "/guilds", label: "Guilds", icon: Shield },
  { path: "/classes", label: "Classes", icon: Sparkles },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0f1e" }}>
      <aside
        className="fixed left-0 top-0 h-screen w-44 flex flex-col z-20"
        style={{ background: "#0d1321", borderRight: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="p-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 flex-none" style={{ color: "#7c6ff7" }} />
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-[0.18em] text-white">ASTRALIS</div>
              <div className="text-[10px] tracking-wider" style={{ color: "#4a5568" }}>
                RPG Dashboard
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className="flex items-center gap-3 rounded text-sm cursor-pointer transition-colors py-2"
                  style={
                    active
                      ? {
                          background: "rgba(124,111,247,0.12)",
                          color: "#ffffff",
                          borderLeft: "2px solid #7c6ff7",
                          paddingLeft: "10px",
                          paddingRight: "12px",
                        }
                      : {
                          color: "#6b7280",
                          borderLeft: "2px solid transparent",
                          paddingLeft: "10px",
                          paddingRight: "12px",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.color = "#d1d5db";
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.color = "#6b7280";
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 flex-none" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[10px]" style={{ color: "#4a5568" }}>
            v0.1.0
          </span>
        </div>
      </aside>

      <main className="ml-44 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
};
