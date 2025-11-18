import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

import {
  loadState,
  saveState,
  clearState,
  watchState,
  type AppState
} from "~/lib/storage/app_state"
import { sendToActiveTab, withTimeout } from "~/wallet-transport"
import { ExtensionSigner } from "../../lib/signer"

type WalletCtx = {
  booting: boolean
  connecting: boolean
  connected: boolean
  address: string
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signer: ExtensionSigner
}

const Ctx = createContext<WalletCtx | null>(null)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const signer = useMemo(() => new ExtensionSigner(), [])
  const [booting, setBooting] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [address, setAddress] = useState<string>("")

  // 初始化加载 & 监听存储变化（与你当前 Wallet.tsx 的逻辑一致）
  useEffect(() => {
    ;(async () => {
      const s = await loadState()
      if (s.connected && s.address) setAddress(s.address)
      else setAddress("")
      setBooting(false)
    })()
    return watchState((s: AppState) => {
      if (s.connected && s.address) setAddress(s.address)
      else setAddress("")
    })
  }, [])

  const connected = useMemo(() => !!address, [address])

  // 连接（沿用 MM_GET_ACCOUNTS）
  const connect = async () => {
    setConnecting(true)
    try {
      const res = await withTimeout<any>(
        sendToActiveTab({ type: "MM_GET_ACCOUNTS" }),
        15000
      )
      if (res?.error) throw new Error(res.error)
      const accounts: string[] | undefined = res?.accounts ?? res?.result?.accounts
      const a = accounts?.[0]
      if (!a) throw new Error("未获得地址，可能被拒绝或未安装 MetaMask")
      await saveState({ connected: true, address: a })
      setAddress(a)
    } finally {
      setConnecting(false)
    }
  }

  // 断开
  const disconnect = async () => {
    await clearState()
    setAddress("")
  }

  const value: WalletCtx = {
    booting,
    connecting,
    connected,
    address,
    connect,
    disconnect,
    signer
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWallet() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useWallet must be used within WalletProvider")
  return v
}
