# Storage Refactoring Requirement

目前，项目中的数据存储代码分散在多个文件且结构混乱。需要进行以下重构：

1. 在 `src/lib/storage` 目录下创建新的存储模块：  
   - `index.ts`：通用存储封装，提供 `get`, `set`, `remove` 方法。  
   - 与每个 storage key 对应的文件，文件名与 storage key 保持一致（如 `app_state.ts`, `x402_pending_transaction.ts`），在各自模块中实现针对该 key 的具体方法。

2. 将现有的存储逻辑迁移到对应的新模块：  
   - 将 `src/lib/storage.ts` 中关于 `app_state` 的逻辑迁移到 `src/lib/storage/app_state.ts`。  
   - 将 `src/lib/transactionState.ts` 中关于 `x402_pending_transaction` 的逻辑迁移到 `src/lib/storage/x402_pending_transaction.ts`。

3. 创建文档文件 `docs/storage.md`，描述存储模块的结构、导出 API 及使用示例。
