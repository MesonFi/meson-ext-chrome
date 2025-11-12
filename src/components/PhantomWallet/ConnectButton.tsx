// src/components/PhantomWallet/ConnectButton.tsx
import React from "react"
import { useWallet } from "~src/app/contexts/WalletContext"
import { Button } from "~src/components/Button"
import { cn } from "~lib/utils"

type Props = {
  className?: string
  size?: "xs" | "sm" | "default" | "lg"
  onConnected?: (address: string) => void
}

export const ConnectPhantomButton: React.FC<Props> = ({
  className,
  size = "default",
  onConnected
}) => {
  const { connected, connecting, address, connect } = useWallet()

  const handleConnect = async () => {
    try {
      await connect()
      if (onConnected && address) {
        onConnected(address)
      }
    } catch (error: any) {
      console.error("连接 Phantom 失败:", error)
      alert(error?.message ?? "连接 Phantom 失败，请确保已安装 Phantom 钱包")
    }
  }

  if (connected) {
    return (
      <Button
        className={cn("gap-2", className)}
        variant="secondary"
        size={size}
        disabled
      >
        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
        {address.slice(0, 4)}...{address.slice(-4)}
      </Button>
    )
  }

  return (
    <Button
      className={cn("gap-2", className)}
      variant="primary"
      size={size}
      onClick={handleConnect}
      loading={connecting}
    >
      {connecting ? "Connecting..." : "Connect Phantom"}
    </Button>
  )
}
