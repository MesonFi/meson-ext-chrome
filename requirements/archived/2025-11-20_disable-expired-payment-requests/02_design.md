# 技术设计

## 概述
为历史记录中的 x402 支付流程引入过期检测，防止用户重复发送已过期的支付请求。

## 1. 已过期记录打开时禁用按钮
- 在打开历史记录（`DrawerX402Request` 的历史模式）时，读取存储的 `validBefore` 时间戳与当前时间比较。  
- 如果存在 `validBefore` 且早于当前 Unix 时间，则将 Step2 中的 “Request with Payment Header” 按钮设为禁用状态。

## 2. 发送请求前重新检查过期
- 在 Step2 的 `onSend` 函数中，发送请求前：
  1. 从历史条目状态或 `xPaymentHeader` 中解析出 `validBefore`。  
  2. 如果当前时间 ≥ `validBefore`，中止请求流程：
     - 将按钮状态更新为禁用。  
     - 使用 Sonner 的 `toast.error("支付请求已过期")` 或在表单上方渲染错误信息，通知用户已过期。  
     - 调用 `updateX402Request(historyTimestamp, { step: 3 })` 或添加 `expired` 标识，记录过期状态。

## 3. 持久化过期状态
- 在检测到过期时，调用 `updateX402Request` 更新历史记录中的状态。  
- 调用 `clearPendingTransaction()` 清除 pending 状态，避免重启时重新打开已过期流程。

## 4. 相关组件和接口
- `src/app/views/x402/DrawerX402Request/Step2.tsx`：
  - 修改 `onSend`，添加过期检查和 UI 状态更新。  
  - 将 `<Button>` 的 `disabled` 属性与过期状态绑定。  
- `src/lib/storage/x402_pending_transaction.ts` & `x402_history.ts`：
  - 使用 `updateX402Request` 持久化过期标记或步骤更新。  
- UI 提示：
  - 使用 Sonner (`toast.error`) 或 Step2 内的错误区域提供过期提示。
