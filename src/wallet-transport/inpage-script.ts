// src/wallet-transport/inpage-script.ts
// 支持 EIP-6963 多钱包发现协议的 Inpage Script

import { VersionedTransaction } from '@solana/web3.js'

// ========== EIP-6963 类型定义 ==========

interface EIP6963ProviderInfo {
  rdns: string  // 反向 DNS 名称，如 "io.metamask"
  uuid: string  // 唯一标识符
  name: string  // 钱包名称
  icon: string  // Base64 图标
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo
  provider: any  // EIP-1193 provider
}

interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider"
  detail: EIP6963ProviderDetail
}

// ========== 钱包发现管理器 ==========

class WalletDiscoveryManager {
  private providers: Map<string, EIP6963ProviderDetail> = new Map()

  constructor() {
    this.setupListeners()
  }

  private setupListeners() {
    // 监听钱包宣告事件
    window.addEventListener("eip6963:announceProvider", ((event: EIP6963AnnounceProviderEvent) => {
      const { info, provider } = event.detail
      console.log("[EIP6963] Wallet announced:", info.name, info.rdns)

      // 存储 provider（使用 rdns 作为 key）
      this.providers.set(info.rdns, { info, provider })
    }) as EventListener)

    // 初始化：请求所有钱包宣告自己
    this.requestProviders()
  }

  requestProviders() {
    console.log("[EIP6963] Requesting providers...")
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    // 等待钱包响应
    setTimeout(() => {
      console.log("[EIP6963] Discovered wallets:", Array.from(this.providers.keys()))
    }, 100)
  }

  /**
   * 根据 RDNS 获取特定钱包的 provider
   */
  getProvider(rdns: string): any | null {
    const detail = this.providers.get(rdns)
    if (detail) {
      console.log("[EIP6963] Found provider for:", rdns)
      return detail.provider
    }
    console.warn("[EIP6963] Provider not found for:", rdns)
    return null
  }

  /**
   * 获取所有已发现的钱包
   */
  getAllProviders(): EIP6963ProviderDetail[] {
    return Array.from(this.providers.values())
  }

  /**
   * 检查特定钱包是否可用
   */
  isAvailable(rdns: string): boolean {
    return this.providers.has(rdns)
  }

  /**
   * 根据钱包类型获取对应的 RDNS
   */
  getRdnsByWalletType(walletType: string): string {
    const rdnsMap: Record<string, string> = {
      "metamask": "io.metamask",
      "coinbase": "com.coinbase.wallet",
      "trust": "com.trustwallet.app",
      "rabby": "io.rabby",
      // 可扩展...
    }
    return rdnsMap[walletType.toLowerCase()] || walletType
  }

  /**
   * 智能获取 provider：优先使用 EIP-6963，降级到 window.ethereum
   */
  getSmartProvider(walletType?: string): any {
    // 如果指定了钱包类型，使用 EIP-6963
    if (walletType) {
      const rdns = this.getRdnsByWalletType(walletType)
      const provider = this.getProvider(rdns)
      if (provider) {
        return provider
      }
      console.warn("[EIP6963] Provider not found for wallet type:", walletType, "falling back to window.ethereum")
    }

    // 降级：使用传统的 window.ethereum
    const ethereum = (window as any).ethereum
    if (ethereum) {
      console.log("[EIP6963] Using fallback window.ethereum")
      return ethereum
    }

    return null
  }
}

// ========== 主逻辑 ==========

;(function () {
  console.log("[INPAGE] EIP-6963 enhanced inpage.js loaded on", location.href)

  // 导出 Solana web3.js
  ;(window as any).solanaWeb3 = {
    VersionedTransaction
  }
  console.log("[INPAGE] Solana web3.js loaded from bundle")

  // 初始化钱包发现管理器
  const walletDiscovery = new WalletDiscoveryManager()

  function reply(id: string, result?: any, error?: string) {
    console.log("[INPAGE] -> content reply", { id, result, error })
    window.postMessage({ target: "CONTENT", id, result, error }, "*")
  }

  window.addEventListener("message", async (evt) => {
    if (evt.source !== window) return
    const data = evt.data
    if (!data || data.target !== "INPAGE") return

    console.log("[INPAGE] <- content payload", data)
    const { id, payload } = data

    try {
      // ========== MetaMask (EVM) handlers with EIP-6963 ==========
      if (payload?.type?.startsWith("MM_")) {
        // 智能获取 provider：优先使用 EIP-6963 的 MetaMask provider
        const eth = walletDiscovery.getSmartProvider("metamask")

        if (!eth) {
          reply(id, undefined, "未检测到 MetaMask（请确保已安装 MetaMask 扩展）")
          return
        }

        console.log("[INPAGE] Using provider:", eth.isMetaMask ? "MetaMask" : "Unknown")

        if (payload.type === "MM_GET_ACCOUNTS") {
          console.log("[INPAGE] calling eth_requestAccounts on MetaMask provider")
          const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
          reply(id, { accounts })
          return
        }

        if (payload.type === "MM_CHAIN_ID") {
          const chainId = await eth.request({ method: "eth_chainId" })
          reply(id, { chainId })
          return
        }

        if (payload.type === "MM_SWITCH_CHAIN") {
          const { chainId } = payload
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }]
          })
          reply(id, { ok: true })
          return
        }

        if (payload.type === "MM_ADD_CHAIN") {
          const { params } = payload
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [params]
          })
          reply(id, { ok: true })
          return
        }

        if (payload.type === "MM_SEND_TX") {
          let finalTx = { ...payload.tx }
          if (!finalTx.from) {
            const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
            finalTx.from = accounts[0]
          }
          console.log("[INPAGE] eth_sendTransaction =", finalTx)
          const txHash = await eth.request({
            method: "eth_sendTransaction",
            params: [finalTx]
          })
          reply(id, { txHash })
          return
        }

        if (payload.type === "MM_PERSONAL_SIGN") {
          const { from, message } = payload
          const signature = await eth.request({
            method: "personal_sign",
            params: [message, from]
          })
          reply(id, { signature })
          return
        }

        if (payload.type === "MM_SIGN_TYPED_DATA_V4") {
          const { from, data } = payload
          const signature = await eth.request({
            method: "eth_signTypedData_v4",
            params: [from, data]
          })
          reply(id, { signature })
          return
        }
      }

      // ========== EIP-6963 钱包发现相关 ==========
      if (payload?.type === "EIP6963_GET_PROVIDERS") {
        // 返回所有已发现的钱包
        const providers = walletDiscovery.getAllProviders().map(detail => ({
          rdns: detail.info.rdns,
          name: detail.info.name,
          icon: detail.info.icon
        }))
        reply(id, { providers })
        return
      }

      if (payload?.type === "EIP6963_CHECK_WALLET") {
        // 检查特定钱包是否可用
        const { walletType } = payload
        const rdns = walletDiscovery.getRdnsByWalletType(walletType)
        const available = walletDiscovery.isAvailable(rdns)
        reply(id, { available, rdns })
        return
      }

      // ========== Phantom (Solana) handlers ==========
      if (payload?.type?.startsWith("PHANTOM_")) {
        const phantom = (window as any).phantom?.solana
        if (!phantom) {
          reply(id, undefined, "未检测到 Phantom 钱包（window.phantom.solana 不存在）")
          return
        }

        if (payload.type === "PHANTOM_CONNECT") {
          console.log("[INPAGE] connecting to Phantom")
          const response = await phantom.connect()
          const publicKey = response.publicKey.toString()
          reply(id, { publicKey })
          return
        }

        if (payload.type === "PHANTOM_DISCONNECT") {
          console.log("[INPAGE] disconnecting from Phantom")
          await phantom.disconnect()
          reply(id, { ok: true })
          return
        }

        if (payload.type === "PHANTOM_SIGN_MESSAGE") {
          console.log("[INPAGE] signing message with Phantom")
          const { message } = payload
          const encodedMessage = new TextEncoder().encode(message)
          const { signature } = await phantom.signMessage(encodedMessage, "utf8")
          const signatureBase64 = btoa(String.fromCharCode(...signature))
          reply(id, { signature: signatureBase64 })
          return
        }

        if (payload.type === "PHANTOM_SIGN_TRANSACTIONS") {
          console.log("[INPAGE] signing transactions with Phantom")
          const { transactions } = payload

          if (!Array.isArray(transactions) || transactions.length === 0) {
            reply(id, undefined, "transactions must be a non-empty array")
            return
          }

          try {
            const solanaWeb3 = (window as any).solanaWeb3
            if (!solanaWeb3?.VersionedTransaction) {
              reply(id, undefined, "Solana web3.js not available")
              return
            }

            console.log("[INPAGE] Deserializing transactions:", transactions.length)

            const txObjects = transactions.map((txBase64: string, idx: number) => {
              try {
                const txBytes = Uint8Array.from(atob(txBase64), c => c.charCodeAt(0))
                console.log(`[INPAGE] Transaction ${idx} bytes length:`, txBytes.length)
                return solanaWeb3.VersionedTransaction.deserialize(txBytes)
              } catch (err: any) {
                console.error(`[INPAGE] Failed to deserialize transaction ${idx}:`, err)
                throw new Error(`Failed to deserialize transaction ${idx}: ${err.message}`)
              }
            })

            console.log("[INPAGE] Calling Phantom signAllTransactions")
            const signedTxs = await phantom.signAllTransactions(txObjects)

            const signedTxsBase64 = signedTxs.map((signedTx: any, idx: number) => {
              try {
                const serialized = signedTx.serialize()
                return btoa(String.fromCharCode(...serialized))
              } catch (err: any) {
                console.error(`[INPAGE] Failed to serialize signed transaction ${idx}:`, err)
                throw new Error(`Failed to serialize signed transaction ${idx}: ${err.message}`)
              }
            })

            console.log("[INPAGE] Successfully signed", signedTxsBase64.length, "transactions")
            reply(id, { signedTransactions: signedTxsBase64 })
          } catch (err: any) {
            console.error("[INPAGE] transaction signing error:", err)
            reply(id, undefined, err?.message ?? String(err))
          }
          return
        }
      }

      reply(id, undefined, `未知消息类型：${payload?.type}`)
    } catch (err: any) {
      console.error("[INPAGE] caught error", err)
      reply(id, undefined, err?.message ?? String(err))
    }
  })

  // 监听 MetaMask 账户变化（使用 EIP-6963 provider）
  setTimeout(() => {
    const metamaskProvider = walletDiscovery.getProvider("io.metamask")
    if (metamaskProvider) {
      metamaskProvider.on?.('accountsChanged', (accounts: string[]) => {
        console.log("[INPAGE] MetaMask accounts changed:", accounts)
        window.postMessage({
          target: "CONTENT",
          payload: { type: "ACCOUNTS_CHANGED", accounts }
        }, "*")
      })
    }
  }, 500)
})()
