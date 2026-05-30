import { Link, useLocation } from "wouter";
import { Sparkles, Trophy, Store, Flame, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NavLinks = ({ onClick }: { onClick?: () => void }) => {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Observatory", icon: Sparkles },
    { href: "/leaderboard", label: "Ranks", icon: Trophy },
    { href: "/market", label: "Bazaar", icon: Store },
    { href: "/burns", label: "Void", icon: Flame },
    { href: "/guilds", label: "Halls", icon: Shield },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center">
      {links.map((link) => {
        const isActive = location === link.href;
        const Icon = link.icon;
        
        return (
          <Link 
            key={link.href} 
            href={link.href}
            onClick={onClick}
            className={`flex items-center gap-2 text-sm uppercase tracking-widest font-mono transition-all duration-300 ${
              isActive 
                ? "text-primary text-glow border-b-2 border-primary pb-1" 
                : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground pb-1"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col bg-noise">
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all duration-500">
              <Sparkles className="w-5 h-5 text-primary animate-pulse-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-glow tracking-widest">ASTRALIS</span>
              <span className="font-mono text-[10px] text-primary/70 uppercase tracking-[0.3em]">Network Active</span>
            </div>
          </Link>

          <nav className="hidden md:flex">
            <NavLinks />
          </nav>

          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-primary/20">
                <div className="mt-12">
                  <NavLinks onClick={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {children}
      </main>

      <footer className="border-t border-primary/10 bg-background/50 backdrop-blur-sm py-8 mt-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Powered by $MAGIC • In the deep void of Solana
          </p>
        </div>
      </footer>
    </div>
  );
};
