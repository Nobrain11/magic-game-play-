import { Connection } from '@solana/web3.js'
import { SOLANA_RPC } from './config/constants.js'

let _connection: Connection | null = null

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(SOLANA_RPC, 'confirmed')
  }
  return _connection
}
