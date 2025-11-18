;(function () {
  console.log("[INPAGE] injected inpage.js on", location.href)

  if ((window as any).ethereum && !(window as any).ethereum._forwardAccounts) {
    (window as any).ethereum._forwardAccounts = true;
    (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
      window.postMessage({
        target: "CONTENT",
        payload: { type: "ACCOUNTS_CHANGED", accounts }
      }, "*");
    });
  }

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
      const eth = (window as any).ethereum
      if (!eth) {
        reply(id, undefined, "未检测到 MetaMask（window.ethereum 不存在）")
        return
      }

      if (payload?.type === "MM_GET_ACCOUNTS") {
        console.log("[INPAGE] calling eth_requestAccounts")
        const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
        reply(id, { accounts })
        return
      }

      if (payload?.type === "MM_CHAIN_ID") {
        const chainId = await eth.request({ method: "eth_chainId" })
        reply(id, { chainId })
        return
      }

      if (payload?.type === "MM_SWITCH_CHAIN") {
        const { chainId } = payload // 0x…
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }]
        })
        reply(id, { ok: true })
        return
      }

      if (payload?.type === "MM_ADD_CHAIN") {
        const { params } = payload // 直接透传 EIP-3085 参数
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [params]
        })
        reply(id, { ok: true })
        return
      }

      if (payload?.type === "MM_SEND_TX") {
        // 新增：优先支持直接透传完整 tx（用于已在上游构造好的 ERC20 transfer 等）
        let finalTx = { ...payload.tx }

        // 如果上游没填 from，这里补上当前选中的账户
        if (!finalTx.from) {
          const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
          finalTx.from = accounts[0]
        }

        console.log("[INPAGE] eth_sendTransaction (passthrough tx) =", finalTx)
        const txHash = await eth.request({
          method: "eth_sendTransaction",
          params: [finalTx]
        })
        console.log("[INPAGE] eth_sendTransaction returned txHash", txHash)
        reply(id, { txHash })
        return
      }

      if (payload?.type === "MM_PERSONAL_SIGN") {
        const { from, message } = payload
        // personal_sign 的 params 顺序为 [message, from]
        const signature = await eth.request({
          method: "personal_sign",
          params: [message, from]
        })
        reply(id, { signature })
        return
      }

      if (payload?.type === "MM_SIGN_TYPED_DATA_V4") {
        const { from, data } = payload
        const signature = await eth.request({
          method: "eth_signTypedData_v4",
          params: [from, data]
        })
        reply(id, { signature })
        return
      }

      reply(id, undefined, `未知消息类型：${payload?.type}`)
    } catch (err: any) {
      console.error("[INPAGE] caught error", err)
      reply(id, undefined, err?.message ?? String(err))
    }
  })
})()
