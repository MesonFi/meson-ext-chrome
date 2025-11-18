# Storage Modules

集中管理浏览器存储，提供通用接口和各键专用模块。

## 目录结构

src/lib/storage/  
├─ index.ts                  # 通用存取：get, set, remove  
├─ app_state.ts              # AppState：loadState, saveState, clearState, watchState  
└─ x402_pending_transaction.ts  # 交易状态：savePendingTransaction, getPendingTransaction, clearPendingTransaction, updatePendingTransaction  

## index.ts

导出通用方法：  
- `get<T>(key: string): Promise<T \| null>`  
- `set(key: string, value: any): Promise<void>`  
- `remove(key: string): Promise<void>`  

## app_state.ts

常量 `KEY = "app_state"`  
导出：  
- `loadState(): Promise<AppState>`  
- `saveState(next: AppState): Promise<void>`  
- `clearState(): Promise<void>`  
- `watchState(cb: (s: AppState) => void): Unsub`  

## x402_pending_transaction.ts

常量 `KEY = "x402_pending_transaction"`  
导出：  
- `savePendingTransaction(state: X402TransactionState): Promise<void>`  
- `getPendingTransaction(maxAge?: number): Promise<X402TransactionState \| null>`  
- `clearPendingTransaction(): Promise<void>`  
- `updatePendingTransaction(updates: Partial<X402TransactionState>): Promise<void>`  

## 使用示例

```ts
import { get, set } from "~/lib/storage"
import { loadState, saveState } from "~/lib/storage/app_state"
import { savePendingTransaction, getPendingTransaction } from "~/lib/storage/x402_pending_transaction"

await set("foo", { bar: 1 })
const foo = await get<{ bar: number }>("foo")

const state = await loadState()
await saveState({ connected: true, address: "0x..." })

await savePendingTransaction({ item, selectedAcceptIndex: 0, step: 1, timestamp: Date.now() })
const pending = await getPendingTransaction()
```
