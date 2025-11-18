// src/components/ConnectMetamask/ConnectMetamaskButton.tsx
import React, { useMemo } from "react"
import { useWallet } from "~/app/contexts/WalletContext"
import { Button, type ButtonProps } from "~/components/Button"

function shortAddr(addr?: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

type ConnectMetamaskButtonProps = {
  className?: string
  size?: ButtonProps['size']
  onConnected?: (address: string) => void
  onError?: (error: Error) => void
  showAddressWhenConnected?: boolean
  children?: React.ReactNode
}

export const ConnectMetamaskButton: React.FC<ConnectMetamaskButtonProps> = ({
  className,
  size,
  onConnected,
  onError,
  showAddressWhenConnected = false,
  children
}) => {
  const { booting, connecting, connected, address, connect } = useWallet()

  const handleConnect = async () => {
    try {
      await connect()
      if (address && onConnected) {
        onConnected(address)
      }
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
    if (connected) return "Connected"
    return children || "Connect MetaMask"
  }, [booting, connecting, connected, address, showAddressWhenConnected, children])

  return (
    <Button
      variant="primary"
      size={size}
      className={className}
      onClick={handleConnect}
      disabled={booting || connecting || connected}
    >
      {buttonText}
    </Button>
  )
}

export default ConnectMetamaskButton
