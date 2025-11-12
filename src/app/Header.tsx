// src/app/Header.tsx
import React from "react"
import { useWallet } from "./contexts/WalletContext"
import { SvgIcon } from "~src/components/SvgIcon"
import SidebarIconSrc from "../assets/icons/sidebar.svg"
import { cn } from "~lib/utils"
import { MessageTooltip } from "~src/components/MessageTooltip"
import { ConnectPhantom } from "~src/components/PhantomWallet"

const Header: React.FC<{
  mode: "popup" | "sidepanel"
}> = ({ mode }) => {
  const { connected } = useWallet()

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

  return (
    <div className={cn("border-b border-borderColor flex items-center justify-between px-3", connected ? 'py-[18px]' : 'py-3')}>
      <ConnectPhantom mode="full" className="flex-1" showActions={true} />
      {(connected || mode === "popup") && (
        <div className="flex items-center gap-4 ml-4">
          {mode === "popup" && (
            <MessageTooltip content={'Sidebar'}>
              <button
                onClick={onOpenSidePanel}
                title="Open Sidebar"
                className="flex items-center"
              >
                <SvgIcon src={SidebarIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors" />
              </button>
            </MessageTooltip>
          )}
        </div>
      )}
    </div>
  )
}

export default Header
