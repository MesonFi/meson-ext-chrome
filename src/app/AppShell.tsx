// src/app/AppShell.tsx
import React, { useMemo } from "react"
import "../style.css"
import { AppProvider } from "./contexts/AppProvider"
import Header from "./Header"
import TabView from "./layout/TabView"
import { cn } from "~/lib/utils"
import { Toaster } from "~/components/ui/sonner"
import DrawerPopup from "./layout/DrawerPopup"

type Mode = "popup" | "sidepanel"

const AppShell: React.FC<{ mode: Mode }> = ({ mode }) => {
  const containerClass = useMemo(
    () =>
      mode === "popup"
        ? "w-[360px] h-[600px] text-color-strong flex flex-col"
        : "w-full h-screen text-color-strong flex flex-col",
    [mode]
  )

  return (
    <AppProvider>
      <div className={cn(containerClass, "overflow-hidden")}>
        <Header mode={mode} />
        <TabView mode={mode} />
        <DrawerPopup />
        <Toaster />
      </div>
    </AppProvider>
  )
}

export default AppShell
