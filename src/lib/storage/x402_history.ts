import { get, set } from "./index"
import type { X402TransactionState } from "./x402_pending_transaction"

const KEY = "x402-history"

/**
 * Load all x402 transaction history entries.
 */
export async function loadX402History(): Promise<X402TransactionState[]> {
  const list = (await get<X402TransactionState[]>(KEY)) ?? []
  return list
}

/**
 * Save a new x402 transaction entry.
 * Prepends entry to history list.
 */
export async function saveX402Request(entry: X402TransactionState): Promise<void> {
  const history = (await loadX402History()) || []
  history.unshift({ ...entry, timestamp: entry.timestamp ?? Date.now() })
  await set(KEY, history)
}

/**
 * Update an existing entry by timestamp.
 */
export async function updateX402Request(
  timestamp: number,
  updates: Partial<X402TransactionState>
): Promise<void> {
  const history = await loadX402History()
  const idx = history.findIndex((e) => e.timestamp === timestamp)
  if (idx === -1) return
  history[idx] = { ...history[idx], ...updates }
  await set(KEY, history)
}
