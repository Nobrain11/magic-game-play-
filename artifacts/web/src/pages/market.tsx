import { useState } from "react";
import { useGetMarketListings } from "@workspace/api-client-react";
import { formatNumber, RARITIES } from "@/lib/constants";
import { Store, Tag, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const Market = () => {
  const [rarity, setRarity] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const { data, isLoading } = useGetMarketListings({
    rarity: rarity !== "all" ? rarity : undefined,
    item_type: type !== "all" ? type : undefined,
    limit: 40
  });

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-glow tracking-widest flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            THE BAZAAR
          </h1>
          <p className="font-mono text-muted-foreground mt-2">Trade artifacts infused with cosmic power.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Select value={rarity} onValueChange={setRarity}>
            <SelectTrigger className="w-full sm:w-40 glass-panel font-mono border-primary/30">
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30 text-foreground font-mono">
              <SelectItem value="all">All Rarities</SelectItem>
              {Object.keys(RARITIES).map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-40 glass-panel font-mono border-primary/30">
              <SelectValue placeholder="Item Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30 text-foreground font-mono">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="weapon">Weapon</SelectItem>
              <SelectItem value="armor">Armor</SelectItem>
              <SelectItem value="helmet">Helmet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl bg-card border border-primary/10" />)
        ) : data?.listings.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <Store className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
            <p className="font-mono text-muted-foreground">The stalls are empty. No items found.</p>
          </div>
        ) : (
          data?.listings.map((item) => {
            const rData = RARITIES[item.rarity] || RARITIES['Common'];
            
            return (
              <Card key={item.listing_id} className={`glass-panel overflow-hidden flex flex-col ${rData.bg} transition-all hover:scale-105 hover:z-10`}>
                <CardContent className="p-6 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-4xl" role="img" aria-label={item.item_type}>{item.emoji}</span>
                    <span className={`font-mono text-[10px] uppercase px-2 py-1 rounded-full border ${rData.color} border-current bg-background/50 backdrop-blur-md`}>
                      {rData.emoji} {item.rarity}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-serif text-lg font-bold tracking-wide">{item.item_name}</h3>
                    <p className="font-mono text-xs text-muted-foreground uppercase mt-1">Lvl {item.level} {item.item_type}</p>
                  </div>
                  
                  <div className="bg-background/40 rounded p-3 font-mono text-sm border border-primary/10">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground uppercase text-xs">{item.stat_type}</span>
                      <span className="text-primary font-bold">+{item.stat_value}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 text-xs font-mono text-muted-foreground flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    Seller: <span className="text-foreground">{item.seller_username}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-0">
                  <Button className="w-full rounded-none h-14 bg-primary/10 hover:bg-primary/20 text-primary font-mono font-bold border-t border-primary/20 flex justify-between px-6 transition-colors">
                    <span>PRICE</span>
                    <span className="flex items-center gap-1 text-lg">
                      <Sparkles className="w-4 h-4" />
                      {formatNumber(item.price)}
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};