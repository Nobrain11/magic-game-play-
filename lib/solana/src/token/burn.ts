import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
  getOrCreateAssociatedTokenAccount,
  createBurnInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { getConnection } from '../connection.js'
import { getTreasuryKeypair } from '../wallet/createWallet.js'
import {
  MAGIC_MINT,
  MARKETING_WALLET,
  BUYBACK_WALLET,
  LAMPORTS_UNIT,
} from '../config/constants.js'
import type { BurnSplit } from './types.js'

export async function executeBurnSplit(split: BurnSplit): Promise<string> {
  const connection = getConnection()
  const treasury = getTreasuryKeypair()

  const treasuryAta = await getOrCreateAssociatedTokenAccount(
    connection, treasury, MAGIC_MINT, treasury.publicKey
  )
  const marketingAta = await getOrCreateAssociatedTokenAccount(
    connection, treasury, MAGIC_MINT, MARKETING_WALLET
  )
  const buybackAta = await getOrCreateAssociatedTokenAccount(
    connection, treasury, MAGIC_MINT, BUYBACK_WALLET
  )

  const tx = new Transaction()

  if (split.burned > 0) {
    tx.add(createBurnInstruction(
      treasuryAta.address,
      MAGIC_MINT,
      treasury.publicKey,
      BigInt(split.burned * LAMPORTS_UNIT),
      [],
      TOKEN_PROGRAM_ID,
    ))
  }

  if (split.marketing > 0) {
    tx.add(createTransferInstruction(
      treasuryAta.address,
      marketingAta.address,
      treasury.publicKey,
      BigInt(split.marketing * LAMPORTS_UNIT),
    ))
  }

  if (split.buyback > 0) {
    tx.add(createTransferInstruction(
      treasuryAta.address,
      buybackAta.address,
      treasury.publicKey,
      BigInt(split.buyback * LAMPORTS_UNIT),
    ))
  }

  const sig = await sendAndConfirmTransaction(connection, tx, [treasury])
  return sig
}

export async function transferToUser(
  recipientPublicKey: string,
  amount: number
): Promise<string> {
  const connection = getConnection()
  const treasury = getTreasuryKeypair()
  const recipient = new PublicKey(recipientPublicKey)

  const from = await getOrCreateAssociatedTokenAccount(
    connection, treasury, MAGIC_MINT, treasury.publicKey
  )
  const to = await getOrCreateAssociatedTokenAccount(
    connection, treasury, MAGIC_MINT, recipient
  )

  const tx = new Transaction()
  tx.add(createTransferInstruction(
    from.address,
    to.address,
    treasury.publicKey,
    BigInt(amount * LAMPORTS_UNIT),
  ))

  return sendAndConfirmTransaction(connection, tx, [treasury])
}
