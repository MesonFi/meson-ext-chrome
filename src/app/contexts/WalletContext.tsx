import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

import {
  loadState,
  saveState,
  clearState,
  watchState,
  type AppState
} from "../lib/storage"
import { sendToActiveTab, withTimeout } from "../lib/transport"
import { ExtensionSigner } from "../lib/signer"

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

  // 同步地址到 signer（当地址变化时）
  useEffect(() => {
    signer.setAddress(address || null)
  }, [address, signer])

  // 连接 Phantom 钱包
  const connect = async () => {
    setConnecting(true)
    try {
      const res = await withTimeout<any>(
        sendToActiveTab({ type: "PHANTOM_CONNECT" }),
        15000
      )
      if (res?.error) throw new Error(res.error)
      const publicKey = res?.publicKey
      if (!publicKey) throw new Error("未获得地址，请确保已安装 Phantom 钱包")
      await saveState({ connected: true, address: publicKey })
      setAddress(publicKey)
    } catch (error: any) {
      console.error("连接 Phantom 失败:", error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  // 断开连接
  const disconnect = async () => {
    try {
      await withTimeout<any>(
        sendToActiveTab({ type: "PHANTOM_DISCONNECT" }),
        5000
      )
    } catch (e) {
      console.error("断开连接失败:", e)
    }
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
