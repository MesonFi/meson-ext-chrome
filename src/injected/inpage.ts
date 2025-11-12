// src/injected/inpage.ts
// 该脚本注入到页面的真实 window 上，能访问 window.phantom (Solana)

// 直接 import Solana web3.js（会被 plasmo 打包进来）
import { VersionedTransaction } from '@solana/web3.js'

;(function () {
  console.log("[INPAGE] injected inpage.js on", location.href)

  // 将 Solana web3.js 导出到 window 上，供后续代码使用
  ;(window as any).solanaWeb3 = {
    VersionedTransaction
  }
  console.log("[INPAGE] Solana web3.js loaded from bundle")

  function reply(id: string, result?: any, error?: string) {
    console.log("[INPAGE] -> content reply", { id, result, error })
    // 调试阶段使用 "*"，生产改成 window.origin
    window.postMessage({ target: "CONTENT", id, result, error }, "*")
  }

  window.addEventListener("message", async (evt) => {
    // 只处理来自 content script 的消息（evt.source === window 且 target === 'INPAGE'）
    if (evt.source !== window) return
    const data = evt.data
    if (!data || data.target !== "INPAGE") return

    console.log("[INPAGE] <- content payload", data)
    const { id, payload } = data

    try {
      const phantom = (window as any).phantom?.solana
      if (!phantom) {
        reply(id, undefined, "未检测到 Phantom 钱包（window.phantom.solana 不存在）")
        return
      }

      // 连接 Phantom 钱包并获取账户
      if (payload?.type === "PHANTOM_CONNECT") {
        console.log("[INPAGE] connecting to Phantom")
        const response = await phantom.connect()
        const publicKey = response.publicKey.toString()
        reply(id, { publicKey })
        return
      }

      // 断开 Phantom 钱包
      if (payload?.type === "PHANTOM_DISCONNECT") {
        console.log("[INPAGE] disconnecting from Phantom")
        await phantom.disconnect()
        reply(id, { ok: true })
        return
      }

      // 签名消息
      if (payload?.type === "PHANTOM_SIGN_MESSAGE") {
        console.log("[INPAGE] signing message with Phantom")
        const { message } = payload

        // 将消息转换为 Uint8Array
        const encodedMessage = new TextEncoder().encode(message)

        const { signature } = await phantom.signMessage(encodedMessage, "utf8")

        // 将签名转换为 base64
        const signatureBase64 = btoa(String.fromCharCode(...signature))
        reply(id, { signature: signatureBase64 })
        return
      }

      // 签名交易（用于 x402 支付）
      if (payload?.type === "PHANTOM_SIGN_TRANSACTIONS") {
        console.log("[INPAGE] signing transactions with Phantom")
        const { transactions } = payload // 数组：每个元素是 base64 编码的序列化交易

        if (!Array.isArray(transactions) || transactions.length === 0) {
          reply(id, undefined, "transactions must be a non-empty array")
          return
        }

        try {
          // web3.js 已经在顶部导入并挂载到 window 上
          const solanaWeb3 = (window as any).solanaWeb3
          if (!solanaWeb3?.VersionedTransaction) {
            reply(id, undefined, "Solana web3.js not available (this should not happen)")
            return
          }

          console.log("[INPAGE] Deserializing transactions:", transactions.length)

          // 将 base64 编码的交易转换为 VersionedTransaction 对象
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

          console.log("[INPAGE] Calling Phantom signAllTransactions with", txObjects.length, "transactions")

          // 使用 Phantom 签名所有交易
          const signedTxs = await phantom.signAllTransactions(txObjects)

          console.log("[INPAGE] Phantom returned signed transactions:", signedTxs.length)

          // 提取签名并转换为 base64 格式
          const signatures = signedTxs.map((signedTx: any, idx: number) => {
            // signedTx.signatures 是 Array<Uint8Array | null>
            // 我们需要第一个签名（用户的签名）
            const sig = signedTx.signatures[0]
            if (!sig) {
              console.error(`[INPAGE] No signature in signed transaction ${idx}`)
              throw new Error(`No signature in signed transaction ${idx}`)
            }
            return btoa(String.fromCharCode(...sig))
          })

          console.log("[INPAGE] Successfully extracted", signatures.length, "signatures")
          reply(id, { signatures })
        } catch (err: any) {
          console.error("[INPAGE] transaction signing error:", err)
          reply(id, undefined, err?.message ?? String(err))
        }
        return
      }

      reply(id, undefined, `未知消息类型：${payload?.type}`)
    } catch (err: any) {
      console.error("[INPAGE] caught error", err)
      reply(id, undefined, err?.message ?? String(err))
    }
  })
})()
