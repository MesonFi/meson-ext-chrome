// src/lib/signer/PhantomSigner.ts
// Phantom wallet signer (Solana)
import { withTimeout, sendToActiveTab } from "~/wallet-transport"
import { address as createAddress } from "@solana/addresses"

export type SolanaNetwork = "solana" | "solana-devnet"

/**
 * Phantom wallet signer (Solana)
 * Implements @solana/signers TransactionPartialSigner interface
 */
export class PhantomSigner {
  private _address: string | null = null
  private _network: SolanaNetwork = "solana"

  public chain = {}
  public transport = {}

  get account() {
    return { address: this._address }
  }

  /**
   * Returns @solana/addresses Address type
   * x402 library needs this type, not plain string
   */
  get address(): any {
    if (!this._address) {
      throw new Error("Wallet not connected. Please connect Phantom wallet first.")
    }
    // Convert string address to @solana/addresses Address type
    return createAddress(this._address)
  }

  constructor() {
    // No auto-initialization, wait for user to connect
  }

  /**
   * Set address (sync from external)
   * WalletContext will call this after connection
   */
  setAddress(addr: string | null) {
    this._address = addr
  }

  /** Connect Phantom wallet and get address */
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

  /** Get current network */
  async getNetwork(): Promise<SolanaNetwork> {
    return this._network
  }

  /** Sign message (for authentication, etc.) */
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
   * Sign transactions (for x402 payment)
   * @param transactions - Transaction objects array (from @solana/transactions)
   * @returns SignatureDictionary[] - Signature dictionary array
   *
   * Transaction format:
   * {
   *   messageBytes: Uint8Array,  // Compiled transaction message (wire format)
   *   signatures: { [address]: SignatureBytes | null }
   * }
   */
  async signTransactions(transactions: any[]): Promise<any[]> {
    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to sign")
    }

    // Ensure connected
    if (!this._address) {
      await this.getAddress()
    }

    // Extract messageBytes from Transaction objects and serialize to base64
    const serializedTxs = transactions.map((tx, index) => {
      // @solana/transactions Transaction format: { messageBytes, signatures }
      const messageBytes = tx.messageBytes

      if (!messageBytes || !(messageBytes instanceof Uint8Array)) {
        console.error("[PhantomSigner] Transaction structure:", tx)
        throw new Error(`Transaction ${index} missing messageBytes or invalid format. Expected Uint8Array, got: ${typeof messageBytes}`)
      }

      // VersionedTransaction.deserialize() expects format:
      // [numSignatures: 1 byte] [sig1: 64 bytes] [sig2: 64 bytes] ... [message bytes]
      //
      // But tx.messageBytes only contains message part, no signatures
      // We need to construct full transaction bytes (with empty signature placeholders)

      const numSigners = Object.keys(tx.signatures).length

      // Construct full transaction bytes
      const fullTxBytes = new Uint8Array(1 + numSigners * 64 + messageBytes.length)
      let offset = 0

      // 1. Number of signatures (compact-u16, simplified to 1 byte, assume signatures < 128)
      fullTxBytes[offset] = numSigners
      offset += 1

      // 2. N 64-byte empty signature placeholders (all zeros)
      // Phantom will fill in actual signatures
      for (let i = 0; i < numSigners; i++) {
        // 64-byte empty signature
        fullTxBytes.fill(0, offset, offset + 64)
        offset += 64
      }

      // 3. Message bytes
      fullTxBytes.set(messageBytes, offset)

      return btoa(String.fromCharCode(...fullTxBytes))
    })

    const resp = await withTimeout<any>(
      sendToActiveTab({
        type: "PHANTOM_SIGN_TRANSACTIONS",
        transactions: serializedTxs
      }),
      60000 // Transaction signing may take longer
    )

    if (resp?.error) throw new Error(resp.error)

    const signedTransactions = resp?.signedTransactions as string[] // base64 format signed transactions
    if (!signedTransactions || !Array.isArray(signedTransactions)) {
      throw new Error("Invalid response from Phantom: missing signedTransactions")
    }

    // Return the signed transactions as Uint8Array wrapped in objects
    // x402 library may expect transaction objects or raw bytes
    return signedTransactions.map((txBase64, index) => {
      const txBytes = Uint8Array.from(atob(txBase64), c => c.charCodeAt(0))

      // Create a transaction-like object
      const originalTx = transactions[index]
      return {
        ...originalTx,
        __signedBytes: txBytes,  // Store complete signed bytes
        serialize: () => txBytes  // Provide serialize method that returns signed bytes
      }
    })
  }

  /** Disconnect */
  async disconnect(): Promise<void> {
    const resp = await withTimeout<any>(
      sendToActiveTab({ type: "PHANTOM_DISCONNECT" }),
      10000
    )
    if (resp?.error) throw new Error(resp.error)
    this._address = null
  }

  /** Infer current network (for x402 use) */
  inferNetworkFromWallet(): "solana" | "solana-devnet" {
    return this._network
  }
}
