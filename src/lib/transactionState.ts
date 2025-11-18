// src/app/lib/transactionState.ts
// 用于保存和恢复 x402 交易状态（防止 popup 关闭时丢失状态）

const TX_STATE_KEY = "x402_pending_transaction"

// 简单的 storage wrapper
const storage = {
  async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key)
    return result[key] ?? null
  },
  async set(key: string, value: any): Promise<void> {
    await chrome.storage.local.set({ [key]: value })
  },
  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key)
  }
}

export type X402TransactionState = {
  // 基本信息
  item: any // x402 item
  selectedAcceptIndex: number
  step: 1 | 2 | 3 // 1: 选择支付方式, 2: 签名中, 3: 请求成功

  // 签名信息（step 2 之后）
  accept?: any
  init?: RequestInit
  xPaymentHeader?: string

  // 请求结果（step 3）
  response?: {
    status: number
    body: any
  }

  // 时间戳（毫秒）
  timestamp: number

  // 凭证有效期（秒级 Unix timestamp，从 X-Payment header 的 payload.authorization.validBefore 解析）
  validBefore?: number
}

/**
 * 保存当前交易状态
 */
export async function savePendingTransaction(state: X402TransactionState) {
  await storage.set(TX_STATE_KEY, {
    ...state,
    timestamp: Date.now()
  })
}

/**
 * 获取待处理的交易状态
 * @param maxAge 最大有效期（毫秒），默认 30 分钟
 */
export async function getPendingTransaction(maxAge: number = 30 * 60 * 1000): Promise<X402TransactionState | null> {
  const state = await storage.get<X402TransactionState>(TX_STATE_KEY)
  console.log('state >>', state)
  if (!state) return null

  // 检查是否过期
  const age = Date.now() - (state.timestamp || 0)
  if (age > maxAge) {
    await clearPendingTransaction()
    return null
  }

  // 检查凭证的 validBefore 时间（如果有）
  if (state.validBefore) {
    const now = Math.floor(Date.now() / 1000) // 转换为秒
    if (now >= state.validBefore) {
      console.log("[TransactionState] Transaction expired (validBefore exceeded)")
      await clearPendingTransaction()
      return null
    }
  }

  return state
}

/**
 * 清除交易状态
 */
export async function clearPendingTransaction() {
  await storage.remove(TX_STATE_KEY)
}

/**
 * 更新交易状态（部分更新）
 */
export async function updatePendingTransaction(updates: Partial<X402TransactionState>) {
  const current = await getPendingTransaction()
  if (!current) return

  await savePendingTransaction({
    ...current,
    ...updates,
    timestamp: Date.now()
  })
}
