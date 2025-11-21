# 多钱包架构文档

## 概述

支持 MetaMask (EVM) 和 Phantom (Solana) 的多钱包架构，使用 EIP-6963 协议精确选择钱包。

## 架构图

```
Chrome Extension
  ├─ WalletProvider (状态管理)
  │   ├─ MetaMaskSigner (EVM)
  │   └─ PhantomSigner (Solana)
  │
  └─ Transport Layer
      ├─ Content Script (消息桥接)
      └─ Inpage Script (EIP-6963 + 钱包调用)
          ├─ window.ethereum (MetaMask)
          └─ window.phantom.solana (Phantom)
```

## 设计原则

- **职责分离**: Provider 管理状态，Signer 封装签名逻辑，Transport 处理通信
- **协议适配**: EVM 使用 EIP-712，Solana 使用交易签名
- **精确发现**: EIP-6963 通过 RDNS 标识符避免 `window.ethereum` 冲突

## 文件结构

```
src/
├── app/
│   └── contexts/
│       ├── AppProvider.tsx          # 顶层 Provider（组合 WalletProvider + DrawerContext）
│       └── WalletProvider.tsx       # 钱包状态管理 + Signer 创建
│
├── lib/
│   ├── signer/
│   │   ├── index.ts                 # 统一导出
│   │   ├── MetaMaskSigner.ts        # EVM 钱包签名器
│   │   └── PhantomSigner.ts         # Solana 钱包签名器
│   ├── storage/
│   │   └── app_state.ts             # 钱包状态持久化
│   └── utils/
│       └── address.ts               # 地址格式化工具
│
├── components/
│   └── Wallet/
│       ├── index.tsx                # 钱包组件（显示地址、复制、断开）
│       └── ConnectButton.tsx        # 连接按钮（支持钱包选择器）
│
├── wallet-transport/
│   ├── index.ts                     # sendToActiveTab 工具函数
│   ├── content-script.ts            # Content Script（消息桥接）
│   └── inpage-script.ts             # Inpage Script（EIP-6963 + 钱包调用）
│
└── app/views/x402/
    ├── lib.ts                       # x402 支付流程（多网络支持）
    └── DrawerX402Request/
        └── Step1.tsx                # x402 支付 UI

assets/
└── icons/
    ├── metamask.svg                 # MetaMask 图标
    └── solana.svg                   # Solana/Phantom 图标
```

## 核心模块

### 1. WalletProvider (`src/app/contexts/WalletProvider.tsx`)

管理钱包连接状态，动态创建 Signer，处理连接/断开/切换操作。

```typescript
const signer = useMemo(() => {
  if (walletType === "phantom") return new PhantomSigner()
  return new MetaMaskSigner()
}, [walletType])

// 配置驱动的连接逻辑
const walletConfig = {
  metamask: { messageType: "MM_GET_ACCOUNTS", ... },
  phantom: { messageType: "PHANTOM_CONNECT", ... }
}
```

### 2. Signer 实现

**MetaMaskSigner** (`src/lib/signer/MetaMaskSigner.ts`)
- 支持网络: Base (0x2105), Base Sepolia (0x14a34)
- 核心方法: `getAddress()`, `switchChain()`, `signTypedData()`, `sendTx()`
- 特性: 自动添加链，EIP-712 签名支持

**PhantomSigner** (`src/lib/signer/PhantomSigner.ts`)
- 支持网络: Solana Mainnet/Devnet
- 核心方法: `getAddress()`, `signTransactions()`, `signMessage()`
- 特性: 完整交易字节序列化（含签名占位符）

### 3. Transport Layer

**Content Script**: 桥接 Extension ↔ Page 消息
**Inpage Script**: 运行在页面上下文，实现 EIP-6963 和钱包调用

```typescript
class WalletDiscoveryManager {
  getSmartProvider(walletType?: string): any {
    // 通过 RDNS 精确选择钱包 (io.metamask, app.phantom 等)
    // 降级到 window.ethereum
  }
}
```

**支持的消息类型**:
- MetaMask: `MM_GET_ACCOUNTS`, `MM_SWITCH_CHAIN`, `MM_SIGN_TYPED_DATA_V4` 等
- Phantom: `PHANTOM_CONNECT`, `PHANTOM_SIGN_TRANSACTIONS` 等
- EIP-6963: `EIP6963_GET_PROVIDERS`, `EIP6963_CHECK_WALLET`

### 4. X402 支付流程 (`src/app/views/x402/lib.ts`)

支持 EVM (Base/Base Sepolia) 和 Solana (Mainnet/Devnet) 网络。

```typescript
async function buildXPaymentHeader(params: {
  wallet: MetaMaskSigner | PhantomSigner
  requirement: PaymentRequirementsParsed
}): Promise<string>

// EVM: 切换链 + EIP-712 签名
// Solana: RPC URL 配置 + 交易签名
```

### 5. UI 组件

**ConnectButton**: 显示连接按钮 → 钱包选择器（MetaMask/Phantom/Cancel）
**Wallet**: 显示地址、复制、断开操作，动态显示钱包图标

## 数据流示例

### 钱包连接流程

```
用户点击 "Connect Wallet" → 选择钱包类型 → WalletProvider.connect(type)
  ↓
Extension → Content Script → Inpage Script → EIP-6963 精确获取钱包
  ↓
调用钱包 API (eth_requestAccounts / phantom.connect())
  ↓
保存状态到 Chrome Storage → 创建对应 Signer → UI 更新
```

### X402 支付流程

```
用户选择支付选项 → buildXPaymentHeader(wallet, requirement)
  ↓
EVM: switchChain() + signTypedData()
Solana: signTransactions() (完整交易字节)
  ↓
构建 X-Payment header → fetchWithXPayment() → 服务器验证
```

## 状态持久化

使用 Chrome Storage API 持久化钱包状态 (`src/lib/storage/app_state.ts`)：

```typescript
interface AppState {
  connected: boolean
  address?: string
  walletType?: "metamask" | "phantom"
}
```

## API 参考

### useWallet()

```typescript
const {
  booting, connecting, connected,
  address, walletType,
  signer,      // MetaMaskSigner | PhantomSigner
  connect,     // (type?: WalletType) => Promise<void>
  disconnect,
  switchWallet
} = useWallet()
```

### Signer API

```typescript
// MetaMaskSigner
await signer.getAddress()
await signer.switchChain("0x2105")
await signer.signTypedData({ ... })  // EIP-712

// PhantomSigner
await signer.getAddress()
await signer.signTransactions([tx])
signer.address  // Address 类型
```

## 扩展指南

### 添加新钱包
1. 创建 Signer (如 EVM 兼容可继承 MetaMaskSigner)
2. 更新 WalletProvider 的 signer 创建逻辑和 walletConfig
3. 在 Inpage Script 的 rdnsMap 中添加 RDNS 标识符
4. UI 添加钱包选项

### 添加新网络
1. 更新 `src/app/views/x402/lib.ts` 的 `NETWORK_TO_CHAIN_ID`
2. 在 MetaMaskSigner 的 `_getDefaultAddParams` 中添加链配置
