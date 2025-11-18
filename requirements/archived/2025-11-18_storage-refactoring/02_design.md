# Storage Module Refactoring Design

## Overview
将现有分散的存储逻辑集中管理，统一放置在 `src/lib/storage` 目录下。  
- `index.ts`：基础存取封装；  
- 每个 storage key 独立模块，实现针对该 key 的读写清晰接口；  
- 配套文档 `docs/storage.md`，说明目录结构、API 及示例。
- 原有引用 storage 相关代码的文件，更新对应的 import 语句

## 目录结构
```
src/lib/storage/
├─ index.ts                  # 通用存储封装：get, set, remove
├─ app_state.ts              # AppState 相关：loadState, saveState, clearState, watchState
└─ x402_pending_transaction.ts  # 交易状态：savePendingTransaction, getPendingTransaction, clearPendingTransaction, updatePendingTransaction
```

## 模块规范

### index.ts
- 导出通用方法：
  - `get<T>(key: string): Promise<T \| null>`
  - `set(key: string, value: any): Promise<void>`
  - `remove(key: string): Promise<void>`

### app_state.ts
- 常量 `KEY = "app_state"`
- 导出：
  - `loadState(): Promise<AppState>`
  - `saveState(next: AppState): Promise<void>`
  - `clearState(): Promise<void>`
  - `watchState(cb: (s: AppState) => void): Unsub`

### x402_pending_transaction.ts
- 常量 `TX_STATE_KEY = "x402_pending_transaction"`
- 导出：
  - `savePendingTransaction(state: X402TransactionState): Promise<void>`
  - `getPendingTransaction(maxAge?: number): Promise<X402TransactionState \| null>`
  - `clearPendingTransaction(): Promise<void>`
  - `updatePendingTransaction(updates: Partial<X402TransactionState>): Promise<void>`

## 文档
在 `docs/storage.md` 中说明：
- 各模块职责与目录结构  
- 全部导出函数列表及参数/返回值说明  
- 使用示例：加载与保存 AppState、交易状态等
