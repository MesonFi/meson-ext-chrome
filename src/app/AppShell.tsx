// src/app/AppShell.tsx
import React, { useMemo, useState } from "react"
import "./styles.css"
import { WalletProvider } from "./contexts/WalletContext"
import Header from "./Header"
import Home from "./views/Home"
import ViewX402List from "./views/x402/ViewX402List"
import ViewOptions from "./views/ViewOptions"

type Mode = "popup" | "sidepanel"
type View = "home" | "x402" | "options"

const AppShell: React.FC<{ mode: Mode }> = ({ mode }) => {
  const [view, setView] = useState<View>("home")

  const containerClass = useMemo(
    () =>
      mode === "popup"
        ? "w-[360px] h-[560px] text-gray-900 flex flex-col"
        : "w-full max-w-[360px] min-h-full text-gray-900 flex flex-col",
    [mode]
  )

  // 内容区可滚动，header 固定
  return (
    <WalletProvider>
      <div className={containerClass}>
        <Header
          mode={mode}
          onOpenSidePanel={async () => {
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
          }}
        />

        <div className="flex-1 overflow-y-auto">
          {view === "home" && (
            <Home
              gotoX402={() => setView("x402")}
              gotoOptions={() => setView("options")}
            />
          )}
          {view === "x402" && <ViewX402List goBack={() => setView("home")} />}
          {view === "options" && <ViewOptions goBack={() => setView("home")} />}
        </div>
      </div>
    </WalletProvider>
  )
}

export default AppShell
