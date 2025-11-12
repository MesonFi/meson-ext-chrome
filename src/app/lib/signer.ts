// src/app/lib/signer.ts
// Solana 签名器 - 用于 Phantom 钱包
import { withTimeout, sendToActiveTab } from "./transport"

export type SolanaNetwork = "solana" | "solana-devnet"

/**
 * Phantom 钱包签名器（Solana）
 * 实现基本的连接、签名功能，兼容现有的 useWallet hook
 */
export class ExtensionSigner {
  private _address: string | null = null
  private _network: SolanaNetwork = "solana"

  public chain = {}
  public transport = {}

  get account() {
    return { address: this._address }
  }

  get address() {
    return this._address || ""
  }

  constructor() {
    // 延迟初始化，避免在钱包未连接时报错
    setTimeout(() => {
      this.getAddress().catch(() => {
        // 忽略错误，等待用户主动连接
      })
    }, 3000)
  }

  /** 连接 Phantom 钱包并获取地址 */
  async getAddress(): Promise<string> {
    const resp = await withTimeout<any>(
      sendToActiveTab({ type: "PHANTOM_CONNECT" }),
      30000
    )
    if (resp?.error) throw new Error(resp.error)
    const addr = resp?.publicKey
    if (!addr) throw new Error("No Solana account")
    this._address = addr
    return addr
  }

  /** 获取当前网络 */
  async getNetwork(): Promise<SolanaNetwork> {
    return this._network
  }

  /** 签名消息（用于身份验证等） */
  async signMessage(message: string | Uint8Array): Promise<string> {
    const messageStr = typeof message === "string" ? message : new TextDecoder().decode(message)

    const resp = await withTimeout<any>(
      sendToActiveTab({
        type: "PHANTOM_SIGN_MESSAGE",
        message: messageStr
      }),
      30000
    )

    if (resp?.error) throw new Error(resp.error)
    return resp?.signature
  }

  /**
   * 签名交易（x402 支付需要）
   * @param transactions - 交易对象数组（来自 @solana/web3.js 2.x）
   * @returns SignatureDictionary[] - 签名字典数组
   */
  async signTransactions(transactions: any[]): Promise<any[]> {
    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to sign")
    }

    // 确保已连接
    if (!this._address) {
      await this.getAddress()
    }

    console.log("[ExtensionSigner] Signing transactions:", transactions.length)

    // 将交易序列化为 base64（x402 传入的是编译后的交易消息）
    const serializedTxs = transactions.map((tx) => {
      // x402 传入的交易可能已经有 serialize 方法，或者是字节数组
      let bytes: Uint8Array

      if (tx instanceof Uint8Array) {
        bytes = tx
      } else if (typeof tx.serialize === 'function') {
        bytes = tx.serialize()
      } else if (tx.__compiled) {
        // @solana/web3.js 2.x 编译后的交易
        bytes = tx.__compiled
      } else {
        throw new Error("Unknown transaction format")
      }

      return btoa(String.fromCharCode(...bytes))
    })

    const resp = await withTimeout<any>(
      sendToActiveTab({
        type: "PHANTOM_SIGN_TRANSACTIONS",
        transactions: serializedTxs
      }),
      60000 // 交易签名可能需要更长时间
    )

    if (resp?.error) throw new Error(resp.error)

    const signatures = resp?.signatures as string[] // base64 格式的签名数组
    if (!signatures || !Array.isArray(signatures)) {
      throw new Error("Invalid response from Phantom: missing signatures")
    }

    // 将签名转换为 SignatureDictionary 格式
    // SignatureDictionary = { [address: string]: Uint8Array }
    return signatures.map((sigBase64) => {
      const sigBytes = Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0))
      return {
        [this._address as string]: sigBytes
      }
    })
  }

  /** 断开连接 */
  async disconnect(): Promise<void> {
    const resp = await withTimeout<any>(
      sendToActiveTab({ type: "PHANTOM_DISCONNECT" }),
      10000
    )
    if (resp?.error) throw new Error(resp.error)
    this._address = null
  }

  /** 推断当前网络（给 x402 使用） */
  inferNetworkFromWallet(): "solana" | "solana-devnet" {
    return this._network
  }
}
