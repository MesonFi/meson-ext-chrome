# 技术设计：钱包网络匹配

## 1. 背景与目标
在支付流程的第一步（Step1）中，用户选择不同网络的支付选项后，必须确保使用对应的区块链钱包（MetaMask 用于 EVM，Phantom 用于 Solana）。

## 2. 网络与钱包类型映射
- Solana 网络（`solana`、`solana-devnet`）→ `phantom`
- EVM 网络（`base`、`base-sepolia` 等）→ `metamask`

## 3. 关键实现步骤

### 3.1 添加工具函数（`src/lib/x402/index.ts`）
```ts
/**
 * 根据网络名称推导所需的钱包类型
 * @param network - 网络名称（如 "solana", "base"）
 * @returns "phantom" | "metamask"
 */
export function getWalletTypeByNetwork(network: string | undefined): WalletType {
  if (!network) return "metamask" // 默认 MetaMask
  const normalized = network.toLowerCase()
  if (normalized.startsWith("solana")) return "phantom"
  return "metamask" // EVM 默认
}
```

### 3.2 更新 Step1 组件（`src/app/drawers/DrawerX402Request/Step1.tsx`）

1. **获取钱包状态**（补充 `walletType`）：
   ```ts
   const { connected, walletType, connect, switchWallet, signer } = useWallet()
   ```

2. **计算所需钱包类型**：
   ```ts
   import { getWalletTypeByNetwork } from "~/lib/x402"

   const requiredWallet = useMemo(() =>
     getWalletTypeByNetwork(selectedAccept?.network),
     [selectedAccept]
   )
   ```

3. **计算匹配状态**：
   ```ts
   const isNetworkMatch = walletType === requiredWallet
   const needsSwitch = connected && !isNetworkMatch
   const canProceed = connected && isNetworkMatch && !!selectedAccept
   ```

4. **钱包切换处理函数**：
   ```ts
   const [switching, setSwitching] = useState(false)

   const handleWalletSwitch = async () => {
     if (!requiredWallet) return

     try {
       setSwitching(true)
       setErr("")

       await switchWallet(requiredWallet)
       await connect(requiredWallet)

       // 切换成功后自动执行支付流程
       await onProceed()
     } catch (e: any) {
       console.error("切换钱包失败:", e)
       setErr(e?.message ?? "切换钱包失败，请重试")
     } finally {
       setSwitching(false)
     }
   }
   ```

5. **按钮渲染逻辑**：
   ```ts
   {!connected ? (
     // 未连接：显示通用连接按钮
     <ConnectButton className="w-full" size="lg" />
   ) : needsSwitch ? (
     // 已连接但网络不匹配：显示切换钱包按钮
     <Button
       className="w-full"
       variant="primary"
       size="lg"
       onClick={handleWalletSwitch}
       loading={switching}
       disabled={switching}
     >
       {switching
         ? 'Switching...'
         : `Connect ${requiredWallet === 'phantom' ? 'Phantom' : 'MetaMask'} Wallet`}
     </Button>
   ) : (
     // 已连接且网络匹配：显示确认按钮
     <Button
       className="w-full"
       variant="primary"
       size="lg"
       onClick={onProceed}
       disabled={!canProceed}
       loading={signing}
     >
       {signing ? 'Signing' : 'Confirm'}
     </Button>
   )}
   ```

## 4. 边界情况处理

| 场景 | 处理方式 |
|------|---------|
| `network` 为空/undefined | 默认为 `metamask` |
| 未知网络名称（如 "polygon"） | 默认为 `metamask`（EVM） |
| 用户拒绝切换钱包 | 捕获错误，显示错误提示，保持当前状态 |
| 切换过程中出错 | 显示错误信息，不改变当前连接状态 |

## 5. 状态管理

新增状态：
- `switching: boolean` - 钱包切换中
- 复用现有的 `err: string` 用于错误提示

## 6. 无需改动
- Step2/Step3 中的请求与展示逻辑无需修改
- `WalletProvider` 的 `switchWallet` 和 `connect` 方法无需修改
- 其他组件与上下文无需调整

## 7. 测试场景

| 场景 | 预期行为 |
|------|---------|
| 未连接钱包，选中任意网络 | 显示 "Connect Wallet" |
| 已连接 MetaMask，选中 Solana | 显示 "Connect Phantom Wallet"，点击后切换 |
| 已连接 Phantom，选中 Base | 显示 "Connect MetaMask Wallet"，点击后切换 |
| 已连接正确钱包 | 显示 "Confirm" 按钮 |
| 切换钱包时用户拒绝 | 显示错误提示，保持 MetaMask/Phantom 连接 |
| 网络字段为空 | 默认使用 MetaMask |
