import { useState } from "react";
import { useGetMarketListings } from "@workspace/api-client-react";
import { formatNumber, RARITIES } from "@/lib/constants";
import { ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const RARITY_TABS = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary"];

const rarityColor = (rarity: string) => {
  const r = rarity?.toLowerCase();
  if (r === "legendary") return { color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" };
  if (r === "epic") return { color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.08)" };
  if (r === "rare") return { color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.08)" };
  if (r === "uncommon") return { color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.08)" };
  return { color: "#9ca3af", border: "1px solid rgba(156,163,175,0.3)", background: "rgba(156,163,175,0.08)" };
};

const priceColor = (currency: string) => {
  if (currency === "astral") return "#7c6ff7";
  return "#f59e0b";
};

export const Market = () => {
  const [activeRarity, setActiveRarity] = useState<string>("All");

  const { data, isLoading } = useGetMarketListings({
    rarity: activeRarity !== "All" ? activeRarity : undefined,
    limit: 40,
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" style={{ color: "#7c6ff7" }} />
          <h1 className="text-xl font-bold text-white">Marketplace</h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          Active item listings
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {RARITY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveRarity(tab)}
            className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
            style={
              activeRarity === tab
                ? { background: "#7c6ff7", color: "#ffffff" }
                : {
                    background: "#141927",
                    color: "#6b7280",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-44 rounded-lg"
                style={{ background: "#141927" }}
              />
            ))
          : (data?.listings ?? []).length === 0
          ? (
            <div className="col-span-full py-16 text-center text-sm" style={{ color: "#6b7280" }}>
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-20" />
              No listings found
            </div>
          )
          : (data?.listings ?? []).map((item) => {
              const rc = rarityColor(item.rarity);
              const currency = (item as { currency?: string }).currency ?? "gold";
              return (
                <div
                  key={item.listing_id}
                  className="rounded-lg p-5 flex flex-col gap-3"
                  style={{
                    background: "#141927",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="text-xs px-2 py-0.5 rounded font-medium capitalize"
                      style={rc}
                    >
                      {item.rarity?.toLowerCase()}
                    </span>
                    <span className="text-xs capitalize" style={{ color: "#6b7280" }}>
                      {item.item_type}
                    </span>
                  </div>

                  <div>
                    <div className="text-base font-semibold text-white leading-snug">
                      {item.item_name}
                    </div>
                    <div className="text-2xl font-bold mt-2" style={{ color: priceColor(currency) }}>
                      {formatNumber(item.price)}{" "}
                      <span className="text-sm font-normal" style={{ color: "#6b7280" }}>
                        {currency}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between text-xs pt-2"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      color: "#6b7280",
                    }}
                  >
                    <span>Seller: {item.seller_username}</span>
                    <span>
                      {formatDistanceToNow(
                        new Date((item as { listed_at?: string }).listed_at ?? Date.now()),
                        { addSuffix: true }
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};
