// src/app/Header.tsx
import React from "react"
import WalletStatus from "./WalletStatus"

const Header: React.FC<{
  mode: "popup" | "sidepanel"
  onOpenSidePanel: () => void
}> = ({ mode, onOpenSidePanel }) => {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 h-12 flex items-center justify-between px-3">
      <WalletStatus />

      {mode === "popup" && (
        <button
          onClick={onOpenSidePanel}
          className="px-2 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200"
        >
          Sidebar
        </button>
      )}
    </div>
  )
}

export default Header
