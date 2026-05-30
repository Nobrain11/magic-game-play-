import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

export interface WalletPair {
  publicKey: string
  privateKey: string
}

export function createWallet(): WalletPair {
  const kp = Keypair.generate()
  return {
    publicKey: kp.publicKey.toBase58(),
    privateKey: bs58.encode(kp.secretKey),
  }
}

export function keypairFromPrivateKey(privateKeyB58: string): Keypair {
  return Keypair.fromSecretKey(bs58.decode(privateKeyB58))
}

export function getTreasuryKeypair(): Keypair {
  const key = process.env['SOLANA_PRIVATE_KEY']
  if (!key) throw new Error('SOLANA_PRIVATE_KEY is not set')
  return keypairFromPrivateKey(key)
}
