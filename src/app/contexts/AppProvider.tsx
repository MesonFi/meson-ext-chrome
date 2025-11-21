import React, { createContext, useContext, useState } from "react"
import { WalletProvider } from "./WalletProvider"

type DrawerContextType = {
  isOpen: boolean
  title: React.ReactNode | null
  content: React.ReactNode | null
  openDrawer: (content: React.ReactNode, title?: React.ReactNode) => void
  closeDrawer: () => void
}

const DrawerContext = createContext<DrawerContextType | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState<React.ReactNode | null>(null)
  const [drawerContent, setDrawerContent] = useState<React.ReactNode | null>(null)

  const openDrawer = (content: React.ReactNode, title?: React.ReactNode) => {
    setDrawerTitle(title ?? null)
    setDrawerContent(content)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setDrawerTitle(null)
    setDrawerContent(null)
  }

  const drawerValue: DrawerContextType = {
    isOpen: drawerOpen,
    title: drawerTitle,
    content: drawerContent,
    openDrawer,
    closeDrawer
  }

  return (
    <DrawerContext.Provider value={drawerValue}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error("useDrawer must be used within AppProvider")
  return ctx
}

// Re-export useWallet for backward compatibility
export { useWallet } from "./WalletProvider"
