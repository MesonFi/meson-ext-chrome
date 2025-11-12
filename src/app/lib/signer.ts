// src/app/lib/signer.ts
// Solana 签名器 - 用于 Phantom 钱包
import { withTimeout, sendToActiveTab } from "./transport"
import { address as createAddress } from "@solana/addresses"

export type SolanaNetwork = "solana" | "solana-devnet"

/**
 * Phantom 钱包签名器（Solana）
 * 实现 @solana/signers 的 TransactionPartialSigner 接口
 */
export class ExtensionSigner {
  private _address: string | null = null
  private _network: SolanaNetwork = "solana"

  public chain = {}
  public transport = {}

  get account() {
    return { address: this._address }
  }

  /**
   * 返回 @solana/addresses 的 Address 类型
   * x402 库需要这个类型，而不是普通字符串
   */
  get address(): any {
    if (!this._address) {
      throw new Error("Wallet not connected. Please connect Phantom wallet first.")
    }
    // 将字符串地址转换为 @solana/addresses 的 Address 类型
    return createAddress(this._address)
  }

  constructor() {
    // 不再自动初始化，等待用户主动连接
  }

  /**
   * 设置地址（从外部同步）
   * WalletContext 连接后会调用此方法
   */
  setAddress(addr: string | null) {
    this._address = addr
    console.log("[ExtensionSigner] Address updated:", addr)
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
   * @param transactions - 交易对象数组（来自 @solana/transactions）
   * @returns SignatureDictionary[] - 签名字典数组
   *
   * Transaction 格式：
   * {
   *   messageBytes: Uint8Array,  // 编译后的交易消息（线格式）
   *   signatures: { [address]: SignatureBytes | null }
   * }
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
    console.log("[ExtensionSigner] First transaction structure:", Object.keys(transactions[0]))

    // 从 Transaction 对象中提取 messageBytes 并序列化为 base64
    const serializedTxs = transactions.map((tx, index) => {
      console.log(`[ExtensionSigner] Transaction ${index} structure:`, Object.keys(tx))

      // @solana/transactions 的 Transaction 格式：{ messageBytes, signatures }
      const messageBytes = tx.messageBytes

      if (!messageBytes || !(messageBytes instanceof Uint8Array)) {
        console.error("[ExtensionSigner] Transaction structure:", tx)
        throw new Error(`Transaction ${index} missing messageBytes or invalid format. Expected Uint8Array, got: ${typeof messageBytes}`)
      }

      console.log(`[ExtensionSigner] Transaction ${index} messageBytes:`, {
        length: messageBytes.length,
        first10Bytes: Array.from(messageBytes.slice(0, 10)),
        signatures: tx.signatures
      })

      // VersionedTransaction.deserialize() 期望的格式：
      // [numSignatures: 1 byte] [sig1: 64 bytes] [sig2: 64 bytes] ... [message bytes]
      //
      // 但 tx.messageBytes 只包含消息部分，没有签名
      // 我们需要构造完整的交易字节数组（带空签名占位符）

      const numSigners = Object.keys(tx.signatures).length
      console.log(`[ExtensionSigner] Transaction ${index} needs ${numSigners} signatures`)

      // 构造完整的交易字节
      const fullTxBytes = new Uint8Array(1 + numSigners * 64 + messageBytes.length)
      let offset = 0

      // 1. 签名数量（compact-u16，这里简化为 1 字节，假设签名数 < 128）
      fullTxBytes[offset] = numSigners
      offset += 1

      // 2. N 个 64 字节的空签名占位符（全为 0）
      // Phantom 会填充实际签名
      for (let i = 0; i < numSigners; i++) {
        // 64 字节的空签名
        fullTxBytes.fill(0, offset, offset + 64)
        offset += 64
      }

      // 3. 消息字节
      fullTxBytes.set(messageBytes, offset)

      console.log(`[ExtensionSigner] Transaction ${index} full bytes length:`, fullTxBytes.length)

      return btoa(String.fromCharCode(...fullTxBytes))
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
