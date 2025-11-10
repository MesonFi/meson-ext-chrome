// src/app/Header.tsx
import React, { useMemo } from "react"
import { useWallet } from "./contexts/WalletContext"
import { Button } from "~src/components/Button"
import { SvgIcon } from "~src/components/SvgIcon"
import SidebarIconSrc from "../assets/icons/sidebar.svg"
import CloseIconSrc from "../assets/icons/close.svg"
import MetaMaskIconSrc from "../assets/icons/metamask.svg"
import CopyIconSrc from "../assets/icons/copy.svg"
import LogoutIconSrc from "../assets/icons/logout.svg"
import { cn } from "~lib/utils"
import { MessageTooltip } from "~src/components/MessageTooltip"

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
    <div className={cn("border-b border-borderColor flex items-center justify-between gap-3 px-3", connected ? 'py-[18px]' : 'py-3')}>
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
        <div className="flex-1 flex items-center gap-2 rounded-lg">
          <SvgIcon src={MetaMaskIconSrc} className="w-6 h-6" />
          <span className="text-sm font-medium text-gray-900 flex-1 truncate" title={address}>
            {shortAddr(address)}
          </span>
        </div>
      )}
      <div className="flex items-center gap-4">
        {
          connected && <>
            <MessageTooltip content={'Copy'}>
              <button
              onClick={handleCopy}
              title="Copy Address"
              >
                <SvgIcon src={CopyIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors" />
              </button>
            </MessageTooltip>
            <MessageTooltip content={'Disconnect'}>
              <button
                onClick={disconnect}
                title="Disconnect"
              >
                <SvgIcon src={LogoutIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors" />
              </button>
            </MessageTooltip>
          </>
        }
        {mode === "popup" &&
          <MessageTooltip content={'Sidebar'}>
            <button
              onClick={onOpenSidePanel}
              title="Open Sidebar"
            >
              <SvgIcon src={SidebarIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors" />
            </button>
          </MessageTooltip>
        }
      </div>
    </div>
  )
}

export default Header
