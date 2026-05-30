import { PublicKey } from '@solana/web3.js'

export const SOLANA_RPC = process.env['SOLANA_RPC'] ?? 'https://api.mainnet-beta.solana.com'
export const MAGIC_MINT = new PublicKey('Htg5dsESFUSRdtNQ42JCgkUx5ikH6sK54nfkWFVdpump')
export const MARKETING_WALLET = new PublicKey('Cgh4CrF2LwY3vkPBqu3KAuKDih8oGqky6pwB6JeURSCE')
export const BUYBACK_WALLET = new PublicKey('93VJpwG2YJkRPSqQbha2Uf22k7KnjdovkZgesqgjDNdw')
export const TOKEN_DECIMALS = 6
export const LAMPORTS_UNIT = Math.pow(10, TOKEN_DECIMALS)
