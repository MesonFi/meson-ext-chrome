# 技术设计

## 1. 概要
针对现有的重复检测待处理交易并打开 Drawer 的问题，需将检测逻辑上移至应用根级，并简化各视图组件的职责，保证仅在 AppShell 启动时执行一次检测。

## 2. AppShell 拆分与启动检测
- 拆分 `src/app/AppShell.tsx` 为两层结构：
  1. **AppRoot**：渲染 `AppProvider` 并包含检测逻辑。
  2. **AppShellContent**：使用 `useDrawer`，渲染 `Header`、`TabView`、`DrawerPopup`、`Toaster` 等。
- 在 `AppRoot` 的 `useEffect` 中：
  - 调用 `getPendingTransaction()`（来自 `~/lib/storage/x402_pending_transaction`）。
  - 若返回非空状态 `state`，调用 `openDrawer` 并渲染：
    ```tsx
    <DrawerX402Request
      initialState={state}
      item={state.item}
      mode={mode}
    />
    ```
    同时传入 `<DrawerTitleX402Request>{state.item.resource}</DrawerTitleX402Request>` 作为标题。

## 3. ViewX402List 调整
- 从 `src/app/views/x402/ViewX402List.tsx` 删除自动恢复交易的 `useEffect`：
  ```tsx
  useEffect(() => { ...getPendingTransaction & openDrawer... }, [])
  ```

## 4. DrawerX402Request 改造
- 修改组件签名，新增可选 prop：
  ```ts
  interface DrawerX402RequestProps {
    item: X402Item;
    mode?: "popup" | "sidepanel";
    initialState?: X402TransactionState;
  }
  ```
- 移除内部的 `useEffect` 恢复逻辑（`getPendingTransaction()`）。
- 在组件初始渲染时，根据 `initialState`：
  - 设置 `step`, `selectedAccept`, `baseInit`, `xPaymentHeader`, `finalText`, `decodedPaymentResp` 等状态。
  - 若未提供 `initialState`，保持现有空白初始态。

## 5. 传递 initialState
- 在 AppRoot 调用 `openDrawer` 时，使用 `initialState` 将持久化状态传递给 `DrawerX402Request`。
- 保证所有入口（弹出窗口和侧边栏）都使用新结构调用。

## 6. 类型与测试
- 在 `src/lib/storage/x402_pending_transaction.ts` 中已有 `X402TransactionState` 类型，可直接复用。
- 编写单元测试或手动验证：
  1. 打开应用，若无 pending transaction，则 Drawer 不自动展开。
  2. 模拟存在 pending transaction，重启应用后 Drawer 仅展开一次。
  3. 切换 Tab 时，不再重复打开 Drawer。
