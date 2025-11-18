// src/app/AppShell.tsx
import React, { useMemo, useState } from "react"
import "./styles.css"
import { WalletProvider } from "./contexts/WalletContext"
import Header from "./Header"
import Home from "./views/Home"
import { cn } from "~/lib/utils"
import { X402URL } from "./views/x402URL"
import HistoryPage from "./views/History"
import TabBar from "~/components/Navigation/TabBar"
import { Toaster } from "~/components/ui/sonner"

type Mode = "popup" | "sidepanel"
type View = "home" | "x402" | "options"

const AppShell: React.FC<{ mode: Mode }> = ({ mode }) => {
  const [selectedTab, setSelectedTab] = useState<"list"|"history">("list")
  const [drawerOpen, setDrawerOpen] = useState(false)

  const containerClass = useMemo(
    () =>
      mode === "popup"
        ? "w-[360px] h-[600px] text-gray-900 flex flex-col"
        : "w-full h-screen text-gray-900 flex flex-col",
    [mode]
  )

  // 内容区可滚动，header 固定
  return (
    <WalletProvider>
      <div className={cn(containerClass, 'overflow-hidden')}>
        <Header mode={mode} />
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-[safe-area-inset-bottom]">
          { selectedTab === "list" && <Home mode={mode}/> }
          { selectedTab === "history" && <HistoryPage/> }
        </div>
        <X402URL open={drawerOpen} onOpenChange={setDrawerOpen} mode={mode} />
        <TabBar selectedTab={selectedTab} onSelect={setSelectedTab} onAdd={() => setDrawerOpen(true)} />
        <Toaster />
      </div>
    </WalletProvider>
  )
}

export default AppShell
