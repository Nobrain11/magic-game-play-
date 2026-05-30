const MAGIC_MINT = 'Htg5dsESFUSRdtNQ42JCgkUx5ikH6sK54nfkWFVdpump';
const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/${MAGIC_MINT}`;

const FALLBACK_PRICE_USD = 0.000001;

let _cachedPrice: number | null = null;
let _cacheExpiry = 0;

/**
 * Returns the current USD price of one MAGIC token.
 * Cached for 5 minutes; falls back to FALLBACK_PRICE_USD on error.
 */
export async function getMagicPriceUsd(): Promise<number> {
  const now = Date.now();
  if (_cachedPrice !== null && now < _cacheExpiry) return _cachedPrice;

  try {
    const res = await fetch(DEXSCREENER_URL, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      pairs?: Array<{ priceUsd?: string }>;
    };
    const price = parseFloat(data.pairs?.[0]?.priceUsd ?? '0');
    if (price > 0) {
      _cachedPrice = price;
      _cacheExpiry = now + 5 * 60 * 1000;
      return price;
    }
  } catch {
    // use fallback
  }

  return FALLBACK_PRICE_USD;
}

/**
 * Converts a USD amount to whole MAGIC tokens (in-game units, no on-chain decimals).
 * e.g. usdToMagic(1.50) with price=$0.000010 → 150_000 MAGIC
 */
export async function usdToMagic(usdAmount: number): Promise<number> {
  const price = await getMagicPriceUsd();
  return Math.max(1, Math.round(usdAmount / price));
}
