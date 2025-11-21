// src/components/Wallet/ConnectButton.tsx
import React, { useMemo, useState } from "react"
import { useWallet } from "~/app/contexts/AppProvider"
import { Button, type ButtonProps } from "~/components/Button"
import type { WalletType } from "~/lib/storage/app_state"
import { shortAddr } from "~/lib/utils/address"
import { useDrawer } from "~/app/contexts/AppProvider"
import DrawerConnectWallet from "./DrawerConnectWallet"
import { Drawer, DrawerContent } from "~/components/ui/drawer"
import { cn } from "~/lib/utils"

type ConnectButtonProps = {
  className?: string
  size?: ButtonProps['size']
  onConnected?: (address: string) => void
  onError?: (error: Error) => void
  showAddressWhenConnected?: boolean
  children?: React.ReactNode
  walletType?: WalletType
  inline?: boolean  // 新增：是否在当前上下文中内联显示钱包选择
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  className,
  size,
  onConnected,
  onError,
  showAddressWhenConnected = false,
  children,
  walletType: propWalletType,
  inline = false
}) => {
  const { booting, connecting, connected, address, walletType, connect } = useWallet()
  const { openDrawer } = useDrawer()
  const [localDrawerOpen, setLocalDrawerOpen] = useState(false)

  const handleConnect = async (type?: WalletType) => {
    try {
      await connect(type)
      if (address && onConnected) {
        onConnected(address)
      }
      // 关闭本地 drawer
      setLocalDrawerOpen(false)
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

  if (!connected) {
    return (
      <>
        <Button
          variant={inline ? "primary" : "roundeOutline"}
          size={size}
          className={cn(className, !inline ? 'border-primaryColor text-primaryColor !px-4' : 'py-3')}
          onClick={() => {
            if (inline) {
              setLocalDrawerOpen(true)
            } else {
              openDrawer(<DrawerConnectWallet />, 'Connect Wallet')
            }
          }}
          disabled={booting || connecting}
        >
          {connecting ? "Connecting..." : children || "Connect Wallet"}
        </Button>

        {/* inline 模式：使用独立的 Drawer，不影响父级 drawer */}
        {inline && (
          <Drawer
            open={localDrawerOpen}
            onOpenChange={setLocalDrawerOpen}
            direction="right"
          >
            <DrawerContent
              className="inset-0 max-h-full rounded-none mt-0"
              direction="right"
            >
              <DrawerConnectWallet onClose={() => setLocalDrawerOpen(false)} />
            </DrawerContent>
          </Drawer>
        )}
      </>
    )
  }

  return (
    <Button
      variant="primary"
      size={size}
      className={className}
      disabled={booting || connecting || !connected}
    >
      {buttonText}
    </Button>
  )
}

export default ConnectButton
