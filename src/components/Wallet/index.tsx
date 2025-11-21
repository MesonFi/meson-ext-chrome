// src/components/Wallet/index.tsx
import React, { useState, useMemo } from "react"
import { useWallet } from "~/app/contexts/AppProvider"
import { SvgIcon } from "~/components/SvgIcon"
import MetaMaskIconSrc from "@assets/icons/metamask.svg"
import PhantonIconSrc from "@assets/icons/phantom.svg"
import CopyIconSrc from "@assets/icons/copy.svg"
import LogoutIconSrc from "@assets/icons/logout.svg"
import { cn } from "~/lib/utils"
import { MessageTooltip } from "~/components/MessageTooltip"
import { ConnectButton } from "./ConnectButton"
import { shortAddr } from "~/lib/utils/address"

// Re-export ConnectButton for convenience
export { ConnectButton } from "./ConnectButton"

type WalletProps = {
  mode?: "button" | "full"
  className?: string
  showActions?: boolean
  onConnected?: (address: string) => void
  onDisconnected?: () => void
}

const Wallet: React.FC<WalletProps> = ({
  mode = "full",
  className,
  showActions = true,
  onConnected,
  onDisconnected
}) => {
  const { connected, address, walletType, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

  // 根据钱包类型动态选择图标
  const walletIcon = useMemo(() => {
    return walletType === "phantom" ? PhantonIconSrc : MetaMaskIconSrc
  }, [walletType])

  const handleDisconnect = async () => {
    await disconnect()
    if (onDisconnected) {
      onDisconnected()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address || "")
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    } catch (e) {
      console.error("复制失败：", e)
    }
  }

  if (mode === "button") {
    return (
      <ConnectButton
        className={className}
        onConnected={onConnected}
        showAddressWhenConnected={true}
      />
    )
  }

  return (
    <div className={cn(connected && "flex items-center gap-2", className)}>
      {!connected ? (
        <ConnectButton
          className="flex-1"
          onConnected={onConnected}
        />
      ) : (
        <>
          <div className="flex-1 flex items-center gap-2 rounded-lg">
            <SvgIcon src={walletIcon} className="w-6 h-6" />
            <span className="text-sm font-medium text-color-strong flex-1 truncate" title={address}>
              {shortAddr(address)}
            </span>
          </div>
          {showActions && (
            <div className="flex items-center gap-4">
              <MessageTooltip content={copied ? 'Copied' : 'Copy'}>
                <button onClick={handleCopy} title="Copy Address" className="flex items-center">
                  <SvgIcon src={CopyIconSrc} className="w-4 h-4 text-secondary hover:text-primary-hover transition-colors" />
                </button>
              </MessageTooltip>
              <MessageTooltip content={'Disconnect'}>
                <button onClick={handleDisconnect} title="Disconnect" className="flex items-center">
                  <SvgIcon src={LogoutIconSrc} className="w-4 h-4 text-secondary hover:text-primary-hover transition-colors" />
                </button>
              </MessageTooltip>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Wallet
