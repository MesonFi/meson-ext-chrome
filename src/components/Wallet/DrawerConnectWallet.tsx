import React, { useState } from "react"
import { useDrawer } from "~/app/contexts/AppProvider"
import { useWallet } from "~/app/contexts/AppProvider"
import { Button } from "~/components/Button"
import CloseIcon from "@assets/icons/X.svg"
import SvgIcon from "../SvgIcon"
import MetaMaskIconSrc from "@assets/icons/metamask.svg"
import PhantomIconSrc from "@assets/icons/phantom.svg"

type DrawerConnectWalletProps = {
  onClose?: () => void  // 可选的关闭回调，用于 inline 模式
}

const DrawerConnectWallet: React.FC<DrawerConnectWalletProps> = ({ onClose }) => {
  const { closeDrawer } = useDrawer()
  const { connect } = useWallet()
  const [loading, setLoading] = useState<"metamask" | "phantom" | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 使用传入的 onClose 或默认的 closeDrawer
  const handleClose = onClose || closeDrawer

  const handleConnect = async (type: "metamask" | "phantom") => {
    setError(null)
    setLoading(type)
    try {
      await connect(type)
      handleClose()
    } catch (e: any) {
      setError(e?.message || "Connection failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold text-textColor1">Connect Wallet</h2>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-surface rounded transition-colors"
        >
          <img src={CloseIcon} alt="close" className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <div className="space-y-4 w-full max-w-xs">
        <div
          className="w-full h-[60px] flex items-center gap-2 text-base font-medium hover:bg-card cursor-pointer rounded-lg"
          onClick={() => handleConnect("metamask")}
        >
          <SvgIcon src={MetaMaskIconSrc} className="w-10 h-10" /> MetaMask
        </div>
        <div
          className="w-full h-[60px] flex items-center gap-2 text-base font-medium hover:bg-card cursor-pointer rounded-lg"
          onClick={() => handleConnect("phantom")}
        >
          <SvgIcon src={PhantomIconSrc} className="w-10 h-10" /> Phantom
        </div>
        {error && <div className="text-error text-sm mt-2">{error}</div>}
        </div>
      </div>
    </div>
  )
}

export default DrawerConnectWallet
