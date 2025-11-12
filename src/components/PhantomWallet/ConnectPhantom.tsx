// src/components/PhantomWallet/ConnectPhantom.tsx
import React, { useState } from "react"
import { useWallet } from "~src/app/contexts/WalletContext"
import { SvgIcon } from "~src/components/SvgIcon"
import CopyIconSrc from "~src/assets/icons/copy.svg"
import SolanaIconSrc from "~src/assets/icons/solana.svg"
import LogoutIconSrc from "~src/assets/icons/logout.svg"
import { cn } from "~lib/utils"
import { MessageTooltip } from "~src/components/MessageTooltip"
import { ConnectPhantomButton } from "./ConnectButton"

function shortAddr(addr?: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

type ConnectPhantomProps = {
  mode?: "button" | "full"
  className?: string
  showActions?: boolean
  onConnected?: (address: string) => void
  onDisconnected?: () => void
}

export const ConnectPhantom: React.FC<ConnectPhantomProps> = ({
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
      <ConnectPhantomButton
        className={className}
        onConnected={onConnected}
      />
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!connected ? (
        <ConnectPhantomButton
          className="flex-1"
          onConnected={onConnected}
        />
      ) : (
        <>
          <div className="flex-1 flex items-center gap-2 rounded-lg">
            <SvgIcon src={SolanaIconSrc} className="w-6 h-6" />
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

export default ConnectPhantom
