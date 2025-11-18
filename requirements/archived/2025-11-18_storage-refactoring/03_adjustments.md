# 03 Adjustments

老的stroage相关的代码文件应该删除。引用这些文件的部分应该修改import，指向新的代码文件。
- 删除: src/lib/storage.ts, src/lib/transactionState.ts，已更新 import 在 src/app/views/x402URL.tsx 中指向新的模块
