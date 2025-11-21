# 需求：全屏抽屉展示钱包连接选项

## 背景
当前 “Connect Wallet” 按钮点击后，会在原位置展开三项选择：
- Connect MetaMask
- Connect Phantom
- Cancel

该方式会拉伸原有容器高度，影响整体界面布局与专注度。

## 目标
引入全屏抽屉（Drawer）来承载钱包连接选项，优化移动端体验：
- 不改变触发按钮所在容器尺寸
- 聚焦视觉中心，减少界面干扰
- 符合移动端抽屉交互规范

## 功能需求
1. 点击 “Connect Wallet” 按钮时，调用 DrawerContext 打开全屏抽屉
2. 抽屉内容包括：
   - Connect MetaMask：调用 MetaMask 连接流程
   - Connect Phantom：调用 Phantom 连接流程
3. 抽屉右上角展示关闭按钮（X 图标），点击可关闭抽屉
4. 在抽屉内点击任一钱包选项或关闭按钮后，自动调用 closeDrawer 关闭抽屉
