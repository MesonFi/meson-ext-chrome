// src/lib/signer.ts
import { withTimeout, sendToActiveTab } from "~/wallet-transport"

export type Hex = `0x${string}`

export type TxParams = {
  from?: string
  to?: string
  data?: Hex
  value?: Hex
  gas?: Hex
  gasPrice?: Hex
  maxFeePerGas?: Hex
  maxPriorityFeePerGas?: Hex
  nonce?: Hex
  chainId?: Hex
}

export type AddChainParams = {
  chainId: Hex // 0xAA36A7
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}

export class ExtensionSigner {
  private _address: string | null = null
  private _chainId: Hex | null = null

  public chain = {}
  public transport = {}
  get account () {
    return { address: this._address }
  }

  constructor () {
    setTimeout(() => {
      this.getAddress()
      this.getChainId()
    }, 3000)
  }

  /** 读取当前账户（会触发 MetaMask 连接授权弹窗） */
  async getAddress(): Promise<string> {
    const resp = await withTimeout<any>(sendToActiveTab({ type: "MM_GET_ACCOUNTS" }), 30000)
    if (resp?.error) throw new Error(resp.error)
    const addr = resp?.accounts?.[0]
    if (!addr) throw new Error("No account")
    this._address = addr
    return addr
  }

  /** 读取当前链 ID（0x…） */
  async getChainId(): Promise<Hex> {
    const resp = await withTimeout<any>(sendToActiveTab({ type: "MM_CHAIN_ID" }), 15000)
    if (resp?.error) throw new Error(resp.error)
    const id = resp?.chainId as Hex
    if (!id) throw new Error("No chain id")
    this._chainId = id
    return id
  }

  /** 尝试切换链；如果未添加则回退添加链 */
  async switchChain(chainId: Hex, addParams?: AddChainParams) {
    const r = await withTimeout<any>(
      sendToActiveTab({ type: "MM_SWITCH_CHAIN", chainId }),
      20000
    )
    // 检查是否有错误
    if (r?.error) {

      if (/Unrecognized chain ID/.test(String(r.error))) {
        const params = addParams || this._getDefaultAddParams(chainId)
        if (!params) {
          throw new Error(String(r.error))
        }

        const ar = await withTimeout<any>(
          sendToActiveTab({ type: "MM_ADD_CHAIN", params }),
          30000
        )
        if (ar?.error) {
          const addErrorMsg = typeof ar.error === 'object' ? ar.error.message : ar.error
          throw new Error(addErrorMsg || String(ar.error))
        }
      } else {
        throw new Error(String(r.error))
      }
    }

    this._chainId = chainId
  }

  /** 根据 chainId 获取默认的添加链参数 */
  private _getDefaultAddParams(chainId: Hex): AddChainParams | null {
    const id = chainId.toLowerCase()
    switch (id) {
      case "0x2105": // Base mainnet (8453)
        return {
          chainId: "0x2105",
          chainName: "Base",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"]
        }
      case "0x14a34": // Base Sepolia (84532)
        return {
          chainId: "0x14a34",
          chainName: "Base Sepolia",
          nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://sepolia.base.org"],
          blockExplorerUrls: ["https://sepolia.basescan.org"]
        }
      default:
        return null
    }
  }

  /** personal_sign（EOA 原文签名） */
  async personalSign(messageHexOrUtf8: string, address?: string): Promise<Hex> {
    const from = address ?? this._address ?? (await this.getAddress())
    const resp = await withTimeout<any>(
      sendToActiveTab({ type: "MM_PERSONAL_SIGN", from, message: messageHexOrUtf8 }),
      30000
    )
    if (resp?.error) throw new Error(resp.error)
    return resp?.result?.signature as Hex
  }

  /** EIP-712 v4（typed data） */
  async signTypedData(typedDataJson: any): Promise<Hex> {
    const addr = this._address ?? (await this.getAddress())
    typedDataJson.account = addr
    typedDataJson.types.EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ]
    console.log(typedDataJson)
    const resp = await withTimeout<any>(
      sendToActiveTab({ type: "MM_SIGN_TYPED_DATA_V4", from: addr, data: JSON.stringify(typedDataJson) }),
      30000
    )
    if (resp?.error) throw new Error(resp.error)
    return resp?.signature as Hex
  }

  /** 发送交易（保持“完整 tx 透传”不变） */
  async sendTransaction(tx: TxParams): Promise<string> {
    const resp = await withTimeout<any>(
      sendToActiveTab({ type: "MM_SEND_TX", tx }),
      60000
    )
    if (resp?.error) throw new Error(resp.error)
    return resp?.result?.txHash ?? resp?.txHash
  }

  /** 简单的网络名推断（给 x402 的 infer 用） */
  inferNetworkFromWallet():
    | "ethereum"
    | "base"
    | "base-sepolia"
    | "polygon"
    | "arbitrum"
    | "optimism"
    | "unknown" {
    const id = (this._chainId ?? "0x0").toLowerCase()
    switch (id) {
      case "0x1":
        return "ethereum"
      case "0x2105": // Base mainnet (8453)
        return "base"
      case "0x14a34": // Base Sepolia (84532)
        return "base-sepolia"
      case "0x89":
        return "polygon"
      case "0xa4b1":
        return "arbitrum"
      case "0xa":
        return "optimism"
      default:
        return "unknown"
    }
  }
}
