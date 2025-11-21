# 需求：钱包网络匹配

当选中的支付选项（`accept`）的 `network` 与当前已连接的钱包类型不一致时，应：
1. 将“Confirm”按钮文案更新为 `Connect ${Wallet_Type} Wallet`，例如 `Connect Phantom Wallet` 或 `Connect MetaMask Wallet`。
2. 用户点击该按钮后，自动执行切换并连接到所需的钱包类型。

示例：
- 选中 Solana 支付选项，但当前连接的是 MetaMask → 按钮显示 `Connect Phantom Wallet`，点击后切换并连接 Phantom。
- 选中 Base 支付选项，但当前连接的是 Phantom → 按钮显示 `Connect MetaMask Wallet`，点击后切换并连接 MetaMask。
