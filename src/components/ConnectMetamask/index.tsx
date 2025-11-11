// src/components/ConnectMetamask/index.tsx
import React, { useState } from "react"
import { useWallet } from "~src/app/contexts/WalletContext"
import { SvgIcon } from "~src/components/SvgIcon"
import MetaMaskIconSrc from "~src/assets/icons/metamask.svg"
import CopyIconSrc from "~src/assets/icons/copy.svg"
import LogoutIconSrc from "~src/assets/icons/logout.svg"
import { cn } from "~lib/utils"
import { MessageTooltip } from "~src/components/MessageTooltip"
import { ConnectMetamaskButton } from "./ConnectMetamaskButton"

function shortAddr(addr?: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// Re-export ConnectMetamaskButton for convenience
export { ConnectMetamaskButton } from "./ConnectMetamaskButton"

type ConnectMetamaskProps = {
  mode?: "button" | "full"
  className?: string
  showActions?: boolean
  onConnected?: (address: string) => void
  onDisconnected?: () => void
}

export const ConnectMetamask: React.FC<ConnectMetamaskProps> = ({
  mode = "full",
  className,
  showActions = true,
  onConnected,
  onDisconnected
}) => {
  const { connected, address, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

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
      <ConnectMetamaskButton
        className={className}
        onConnected={onConnected}
        showAddressWhenConnected={true}
      />
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!connected ? (
        <ConnectMetamaskButton
          className="flex-1"
          onConnected={onConnected}
        />
      ) : (
        <>
          <div className="flex-1 flex items-center gap-2 rounded-lg">
            <SvgIcon src={MetaMaskIconSrc} className="w-6 h-6" />
            <span className="text-sm font-medium text-gray-900 flex-1 truncate" title={address}>
              {shortAddr(address)}
            </span>
          </div>
          {showActions && (
            <div className="flex items-center gap-4">
              <MessageTooltip content={copied ? 'Copied' : 'Copy'}>
                <button onClick={handleCopy} title="Copy Address" className="flex items-center">
                  <SvgIcon src={CopyIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors" />
                </button>
              </MessageTooltip>
              <MessageTooltip content={'Disconnect'}>
                <button onClick={handleDisconnect} title="Disconnect" className="flex items-center">
                  <SvgIcon src={LogoutIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors" />
                </button>
              </MessageTooltip>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ConnectMetamask
