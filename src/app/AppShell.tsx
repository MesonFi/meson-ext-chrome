// src/app/AppShell.tsx
import React, { useMemo, useState } from "react"
import "./styles.css"
import { WalletProvider } from "./contexts/WalletContext"
import Header from "./Header"
import Home from "./views/Home"
import ViewX402List from "./views/x402/ViewX402List"
import ViewOptions from "./views/ViewOptions"
import { cn } from "~lib/utils"
import { Button } from "~src/components/Button"

type Mode = "popup" | "sidepanel"
type View = "home" | "x402" | "options"

const AppShell: React.FC<{ mode: Mode }> = ({ mode }) => {
  const [view, setView] = useState<View>("home")

  const containerClass = useMemo(
    () =>
      mode === "popup"
        ? "w-[360px] h-[560px] text-gray-900 flex flex-col"
        : "w-full h-screen text-gray-900 flex flex-col",
    [mode]
  )

  // 内容区可滚动，header 固定
  return (
    <WalletProvider>
      <div className={cn(containerClass, 'rounded-2xl border border-borderColor overflow-hidden m-2')}>
        <Header mode={mode} />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <Home />
        </div>
        <div className="p-3 border-t border-borderColor">

          <Button variant="secondary" className="w-full" size="lg">
            Enter x402 URL
          </Button>
        </div>
      </div>
    </WalletProvider>
  )
}

export default AppShell
