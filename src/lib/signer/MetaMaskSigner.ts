// src/lib/signer/MetaMaskSigner.ts
// MetaMask (EVM) wallet signer
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
  chainId: Hex
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}

export class MetaMaskSigner {
  private _address: string | null = null
  private _chainId: Hex | null = null

  public chain = {}
  public transport = {}

  get account() {
    return { address: this._address }
  }

  constructor() {
    // No auto-initialization - wait for explicit calls
    console.log('[MetaMaskSigner] Constructor called - MetaMaskSigner instance created')
  }

  setAddress(addr: string | null) {
    this._address = addr
  }

  /** Get current account (triggers MetaMask connection prompt) */
  async getAddress(): Promise<string> {
    const resp = await withTimeout<any>(sendToActiveTab({ type: "MM_GET_ACCOUNTS" }), 30000)
    if (resp?.error) throw new Error(resp.error)
    const addr = resp?.accounts?.[0]
    if (!addr) throw new Error("No account")
    this._address = addr
    return addr
  }

  /** Get current chain ID */
  async getChainId(): Promise<Hex> {
    const resp = await withTimeout<any>(sendToActiveTab({ type: "MM_CHAIN_ID" }), 15000)
    if (resp?.error) throw new Error(resp.error)
    const id = resp?.chainId as Hex
    if (!id) throw new Error("No chain id")
    this._chainId = id
    return id
  }

  /** Switch chain; fallback to add chain if not recognized */
  async switchChain(chainId: Hex, addParams?: AddChainParams) {
    const r = await withTimeout<any>(
      sendToActiveTab({ type: "MM_SWITCH_CHAIN", chainId }),
      20000
    )

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

  /** Get default add chain params by chainId */
  private _getDefaultAddParams(chainId: Hex): AddChainParams | null {
    const id = chainId.toLowerCase()
    switch (id) {
      case "0x2105": // Base mainnet (8453)
        return {
          chainId,
          chainName: "Base",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"]
        }
      case "0x14a34": // Base Sepolia (84532)
        return {
          chainId,
          chainName: "Base Sepolia",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://sepolia.base.org"],
          blockExplorerUrls: ["https://sepolia.basescan.org"]
        }
      default:
        return null
    }
  }

  /** Send transaction */
  async sendTx(tx: TxParams): Promise<Hex> {
    const resp = await withTimeout<any>(sendToActiveTab({ type: "MM_SEND_TX", tx }), 120000)
    if (resp?.error) throw new Error(resp.error)
    return resp?.txHash as Hex
  }

  /** Sign message (personal_sign) */
  async signMessage(message: string): Promise<Hex> {
    if (!this._address) await this.getAddress()
    const resp = await withTimeout<any>(
      sendToActiveTab({ type: "MM_PERSONAL_SIGN", from: this._address, message }),
      60000
    )
    if (resp?.error) throw new Error(resp.error)
    return resp?.signature as Hex
  }

  /** Sign typed data v4 */
  async signTypedDataV4(data: string): Promise<Hex> {
    if (!this._address) await this.getAddress()
    const resp = await withTimeout<any>(
      sendToActiveTab({ type: "MM_SIGN_TYPED_DATA_V4", from: this._address, data }),
      60000
    )
    if (resp?.error) throw new Error(resp.error)
    return resp?.signature as Hex
  }

  /**
   * Sign typed data (viem-compatible interface, required by x402 library)
   * Accepts { domain, message, primaryType, types } format
   */
  async signTypedData(params: {
    domain?: any
    message?: any
    primaryType?: string
    types?: any
  }): Promise<Hex> {
    if (!this._address) await this.getAddress()

    // Serialize typed data to JSON string for eth_signTypedData_v4
    const typedDataJson = JSON.stringify({
      domain: params.domain,
      message: params.message,
      primaryType: params.primaryType,
      types: params.types
    })

    const resp = await withTimeout<any>(
      sendToActiveTab({
        type: "MM_SIGN_TYPED_DATA_V4",
        from: this._address,
        data: typedDataJson
      }),
      60000
    )
    if (resp?.error) throw new Error(resp.error)
    return resp?.signature as Hex
  }
}
