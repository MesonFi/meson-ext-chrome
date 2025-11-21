import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

import {
  loadState,
  saveState,
  clearState,
  watchState,
  type AppState,
  type WalletType
} from "~/lib/storage/app_state"
import { sendToActiveTab, withTimeout } from "~/wallet-transport"
import { MetaMaskSigner, PhantomSigner } from "~/lib/signer"

type WalletCtx = {
  booting: boolean
  connecting: boolean
  connected: boolean
  address: string
  walletType: WalletType
  connect: (type?: WalletType) => Promise<void>
  disconnect: () => Promise<void>
  switchWallet: (type: WalletType) => Promise<void>
  signer: MetaMaskSigner | PhantomSigner
}

const WalletContext = createContext<WalletCtx | null>(null)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [booting, setBooting] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [address, setAddress] = useState<string>("")
  const [walletType, setWalletType] = useState<WalletType>("metamask")

  // Create signer based on walletType
  const signer = useMemo(() => {
    if (walletType === "phantom") {
      return new PhantomSigner()
    }
    return new MetaMaskSigner()
  }, [walletType])

  // 初始化加载 & 监听存储变化
  useEffect(() => {
    ;(async () => {
      const s = await loadState()
      if (s.connected && s.address) {
        setAddress(s.address)
        setWalletType(s.walletType ?? "metamask")
      } else {
        setAddress("")
        setWalletType(s.walletType ?? "metamask")
      }
      setBooting(false)
    })()
    return watchState((s: AppState) => {
      if (s.connected && s.address) {
        setAddress(s.address)
        setWalletType(s.walletType ?? "metamask")
      } else {
        setAddress("")
      }
    })
  }, [])

  // 监听 MetaMask 账户变化
  useEffect(() => {
    const handleMsg = (message: any) => {
      if (message.type === 'MM_ACCOUNTS_CHANGED' && walletType === 'metamask') {
        const newAddr = message.accounts?.[0] || '';
        saveState({ connected: !!newAddr, address: newAddr, walletType: 'metamask' });
        setAddress(newAddr);
      }
    };
    chrome.runtime.onMessage.addListener(handleMsg);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMsg);
    };
  }, [walletType]);

  const connected = useMemo(() => !!address, [address])

  // Sync address to signer when address or signer changes
  useEffect(() => {
    if (address && signer) {
      signer.setAddress(address)
    }
  }, [address, signer])

  // 连接钱包（支持 MetaMask 和 Phantom）
  const connect = async (type?: WalletType) => {
    const targetType = type ?? walletType

    // 钱包配置映射
    const walletConfig = {
      metamask: {
        messageType: "MM_GET_ACCOUNTS",
        extractAddress: (res: any) => res?.accounts?.[0] ?? res?.result?.accounts?.[0],
        errorMsg: "未获得地址，可能被拒绝或未安装 MetaMask"
      },
      phantom: {
        messageType: "PHANTOM_CONNECT",
        extractAddress: (res: any) => res?.publicKey,
        errorMsg: "未获得地址，请确保已安装 Phantom 钱包"
      }
    } as const

    setConnecting(true)
    try {
      const config = walletConfig[targetType]

      const res = await withTimeout<any>(
        sendToActiveTab({ type: config.messageType }),
        15000
      )

      if (res?.error) throw new Error(res.error)

      const address = config.extractAddress(res)
      if (!address) throw new Error(config.errorMsg)

      await saveState({ connected: true, address, walletType: targetType })
      setAddress(address)
      setWalletType(targetType)
    } finally {
      setConnecting(false)
    }
  }

  // 断开连接
  const disconnect = async () => {
    if (walletType === "phantom") {
      try {
        await withTimeout<any>(
          sendToActiveTab({ type: "PHANTOM_DISCONNECT" }),
          5000
        )
      } catch (e) {
        console.error("断开 Phantom 连接失败:", e)
      }
    }
    await clearState()
    setAddress("")
  }

  // 切换钱包类型
  const switchWallet = async (type: WalletType) => {
    // 先断开当前钱包
    await disconnect()
    // 更新钱包类型
    setWalletType(type)
    await saveState({ connected: false, walletType: type })
  }

  const value: WalletCtx = {
    booting,
    connecting,
    connected,
    address,
    walletType,
    connect,
    disconnect,
    switchWallet,
    signer
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const v = useContext(WalletContext)
  if (!v) throw new Error("useWallet must be used within WalletProvider")
  return v
}
