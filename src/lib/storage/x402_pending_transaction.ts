import { get, set, remove } from "./index"

const KEY = "x402_pending_transaction"

export type X402TransactionState = {
  item: any
  selectedAcceptIndex: number
  step: 1 | 2 | 3
  accept?: any
  init?: RequestInit
  xPaymentHeader?: string
  response?: { status: number; body: any }
  timestamp: number
  validBefore?: number
}

export async function savePendingTransaction(state: X402TransactionState): Promise<void> {
  await set(KEY, { ...state, timestamp: Date.now() })
}

export async function getPendingTransaction(maxAge: number = 30 * 60_000): Promise<X402TransactionState | null> {
  const state = await get<X402TransactionState>(KEY)
  if (!state) return null

  const age = Date.now() - (state.timestamp || 0)
  if (age > maxAge) {
    await clearPendingTransaction()
    return null
  }

  if (state.validBefore) {
    const nowSec = Math.floor(Date.now() / 1000)
    if (nowSec >= state.validBefore) {
      await clearPendingTransaction()
      return null
    }
  }

  return state
}

export async function clearPendingTransaction(): Promise<void> {
  await remove(KEY)
}

export async function updatePendingTransaction(updates: Partial<X402TransactionState>): Promise<void> {
  const current = await getPendingTransaction()
  if (!current) return
  await savePendingTransaction({ ...current, ...updates, timestamp: Date.now() })
}
