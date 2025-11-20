# 需求概述

当前问题：
- ViewX402List 组件在挂载时会调用 `getPendingTransaction`，若存在待处理交易则打开 Drawer。
- 切换 Tab 时，ViewX402List 会反复 unmount/remount，导致重复检测并可能重复打开 Drawer。

解决方案：
1. 在 AppShell 启动时仅检测一次待处理交易；若存在，则打开 Drawer。
2. 从 ViewX402List 中移除检测待处理交易的 `useEffect`。
3. 将 `DrawerX402Request` 改为受控组件，通过 `initialState` prop 接收初始状态，不再自行读取 storage。

注意事项：
- AppShell 需拆分为两层：外层渲染 `AppProvider`，内层使用 `useDrawer`，以避免 Hook 调用错误。
