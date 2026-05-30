import { TOKEN_SPLIT, MAGIC_BURN_AMOUNT } from '@workspace/shared'
import type { BurnSplit } from '@workspace/shared'

export function calculateBurnSplit(totalAmount: number): BurnSplit {
  return {
    total:     totalAmount,
    burned:    Math.floor(totalAmount * TOKEN_SPLIT.burn),
    marketing: Math.floor(totalAmount * TOKEN_SPLIT.marketing),
    buyback:   Math.floor(totalAmount * TOKEN_SPLIT.buyback),
    rewards:   Math.floor(totalAmount * TOKEN_SPLIT.rewards),
  }
}

export const STANDARD_BURN = MAGIC_BURN_AMOUNT
