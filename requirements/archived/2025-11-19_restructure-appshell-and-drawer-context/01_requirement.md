我要调整一下UI结构，从根组件 AppShell开始，top-down 结构下比较top层的一系列组件


AppShell作为根组件（所有东西在 AppProvider 中），所有其中包括：
- Header 固定在页面顶部
- 页面其余部分一个 TabView。TabView 组件里有 TabContent 和 TabBar。关于tab切换的逻辑放在 TabView 组件里来实现
- DrawerPopup，是一个从底部向上弹出的弹窗。这个组件是一个框架（就像TabContent一样），然后可以通过参数配置 DrawerPopup 里展示什么内容（比如现有的DrawerX402Request，或者X402URL。目前DrawerX402Request和X402URL两个组件内分别都实现了一遍Drawer代码，有冗余）
- Toaster

现在的 WalletProvider 重命名为 AppProvider，在提供现有的和钱包连接有关的功能外，还要提供调出 DrawerPopup 相关的东西
