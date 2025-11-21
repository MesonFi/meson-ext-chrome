# 技术设计：钱包连接界面抽屉化

## 1. 新增 DrawerConnectWallet 组件
- 文件路径：`src/components/Wallet/DrawerConnectWallet.tsx`
- 功能：基于现有 Radix UI Drawer 实现全屏抽屉，包含：
  - 两个按钮：Connect MetaMask、Connect Phantom
  - 右上角关闭按钮（X 图标，路径：`@assets/icons/X.svg`）
- 连接流程：
  - 点击钱包按钮后，通过 `useWallet().connect(type)` 发起连接
  - **连接成功**：自动调用 `closeDrawer()` 关闭抽屉
  - **用户拒绝授权**：保持抽屉打开，显示提示信息
  - **连接出错**：保持抽屉打开，显示错误信息

## 2. 修改 ConnectButton 组件
- 删除原内联钱包选择分支（`showWalletPicker` 相关代码）
- 在"未连接"状态下，点击按钮时：
  - 调用 `openDrawer(<DrawerConnectWallet />, 'Connect Wallet')` 打开全屏抽屉
- 保留按钮文字与加载态逻辑，无其他变化

## 3. 抽屉样式实现
- 使用现有 `DrawerPopup` 与 `useDrawer` Context，无需新增全局 Provider
- **不修改 Drawer 组件本身**，所有样式通过 `DrawerConnectWallet` 组件内的 Tailwind className 覆盖：
  - 容器：`w-screen h-screen` 确保全屏铺满
  - 内容布局：垂直居中，按钮横向排列或纵向堆叠
  - 关闭按钮：绝对定位在右上角

## 4. 错误与状态反馈
- 连接过程中，按钮显示 loading 状态
- 连接失败或用户拒绝时，在抽屉中显示错误信息
- 错误信息支持重试操作

## 5. 不影响其他功能
- 未连接状态下只修改抽屉触发与内容展示；已连接及其他分支保持原有行为
- 不涉及 `src/app/**` 或 `docs/**` 文件修改
