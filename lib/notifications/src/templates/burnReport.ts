export function burnReportTemplate(params: {
  username: string
  total: number
  burned: number
  marketing: number
  buyback: number
  rewards: number
  txSig: string
}): string {
  return `🔥 *$MAGIC Burn Report*\n\n` +
    `👤 ${params.username}\n` +
    `💎 Total: *${params.total.toLocaleString()} $MAGIC*\n\n` +
    `🔥 Burned: ${params.burned.toLocaleString()}\n` +
    `📢 Marketing: ${params.marketing.toLocaleString()}\n` +
    `💼 Buyback: ${params.buyback.toLocaleString()}\n` +
    `🎁 Rewards Pool: ${params.rewards.toLocaleString()}\n\n` +
    `[View TX](https://solscan.io/tx/${params.txSig})`
}
