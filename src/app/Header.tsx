// src/app/Header.tsx
import React, { useMemo } from "react"
import { useWallet } from "./contexts/WalletContext"
import { Button } from "~src/components/Button"
import SidebarIcon from "../assets/icons/sidebar.svg"
import CloseIcon from "../assets/icons/close.svg"
import MetaMaskIcon from "../assets/icons/metamask.svg"
import CopyIcon from "../assets/icons/copy.svg"
import LogoutIcon from "../assets/icons/logout.svg"
import { cn } from "~lib/utils"

function shortAddr(addr?: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const Header: React.FC<{
  mode: "popup" | "sidepanel"
}> = ({ mode }) => {
  const { booting, connecting, connected, address, connect, disconnect } = useWallet()

  const onOpenSidePanel = async () => {
    if (mode !== "popup") return
    try {
      // 打开侧边栏后关闭 popup
      // @ts-ignore
      if (chrome?.sidePanel?.open) {
        const win = await chrome.windows.getCurrent()
        // @ts-ignore
        await chrome.sidePanel.open({ windowId: win.id })
        window.close()
      }
    } catch (e) {
      console.error("open sidepanel failed:", e)
    }
  }

  const onCloseSidePanel = () => {
    if (mode !== "sidepanel") return
    // 关闭 sidepanel
    window.close()
  }

  const handleConnect = async () => {
    try {
      await connect()
    } catch (e: any) {
      console.error("连接失败：", e?.message ?? String(e))
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address || "")
    } catch (e) {
      console.error("复制失败：", e)
    }
  }

  const buttonText = useMemo(() => {
    if (booting) return "Loading..."
    if (connecting) return "Connecting..."
    return "Connect MetaMask"
  }, [booting, connecting])

  return (
    <div className={cn("border-b border-borderColor flex items-center justify-between px-3 gap-3", connected ? 'py-[18px]' : 'py-3')}>
      {!connected ? (
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleConnect}
          disabled={booting || connecting}
        >
          {buttonText}
        </Button>
      ) : (
        <div className="flex-1 flex items-center gap-2 rounded-lg px-3">
          <img src={MetaMaskIcon} alt="metamask" className="w-6 h-6" />
          <span className="text-sm font-medium text-gray-900 flex-1 truncate" title={address}>
            {shortAddr(address)}
          </span>
        </div>
      )}
      <div className="flex items-center gap-4">
        {
          connected && <>
            <button
              onClick={handleCopy}
              title="Copy Address"
            >
              <img src={CopyIcon} alt="copy" className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={disconnect}
              title="Disconnect"
            >
              <img src={LogoutIcon} alt="logout" className="w-4 h-4 text-gray-600" />
            </button>
          </>
        }
        {mode === "popup" ? (
          <button
            onClick={onOpenSidePanel}
            title="Open Sidebar"
          >
            <img src={SidebarIcon} alt="sidebar" className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onCloseSidePanel}
            title="Close Sidebar"
          >
            <img src={CloseIcon} alt="close" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Header
