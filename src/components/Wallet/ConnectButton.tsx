// src/components/Wallet/ConnectButton.tsx
import React, { useMemo, useState } from "react"
import { useWallet } from "~/app/contexts/AppProvider"
import { Button, type ButtonProps } from "~/components/Button"
import type { WalletType } from "~/lib/storage/app_state"
import { shortAddr } from "~/lib/utils/address"

type ConnectButtonProps = {
  className?: string
  size?: ButtonProps['size']
  onConnected?: (address: string) => void
  onError?: (error: Error) => void
  showAddressWhenConnected?: boolean
  children?: React.ReactNode
  walletType?: WalletType
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  className,
  size,
  onConnected,
  onError,
  showAddressWhenConnected = false,
  children,
  walletType: propWalletType
}) => {
  const { booting, connecting, connected, address, walletType, connect } = useWallet()
  const [showWalletPicker, setShowWalletPicker] = useState(false)

  const handleConnect = async (type?: WalletType) => {
    try {
      await connect(type)
      if (address && onConnected) {
        onConnected(address)
      }
      setShowWalletPicker(false)
    } catch (e: any) {
      console.error("连接失败：", e?.message ?? String(e))
      if (onError) {
        onError(e)
      }
    }
  }

  const buttonText = useMemo(() => {
    if (booting) return "Loading..."
    if (connecting) return "Connecting..."
    if (connected && showAddressWhenConnected) return shortAddr(address)
    if (connected) return walletType === "phantom" ? "Phantom Connected" : "MetaMask Connected"
    return children || "Connect Wallet"
  }, [booting, connecting, connected, address, showAddressWhenConnected, children, walletType])

  // 如果指定了钱包类型，直接连接该钱包
  if (propWalletType) {
    return (
      <Button
        variant="primary"
        size={size}
        className={className}
        onClick={() => handleConnect(propWalletType)}
        disabled={booting || connecting || connected}
      >
        {connecting ? "Connecting..." : children || `Connect ${propWalletType === "phantom" ? "Phantom" : "MetaMask"}`}
      </Button>
    )
  }

  // 未连接时显示钱包选择器
  if (!connected && showWalletPicker) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size={size}
          className={className}
          onClick={() => handleConnect("metamask")}
          disabled={booting || connecting}
        >
          Connect MetaMask
        </Button>
        <Button
          variant="secondary"
          size={size}
          className={className}
          onClick={() => handleConnect("phantom")}
          disabled={booting || connecting}
        >
          Connect Phantom
        </Button>
        <Button
          variant="default"
          size={size}
          className={className}
          onClick={() => setShowWalletPicker(false)}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="primary"
      size={size}
      className={className}
      onClick={() => connected ? undefined : setShowWalletPicker(true)}
      disabled={booting || connecting || connected}
    >
      {buttonText}
    </Button>
  )
}

export default ConnectButton
