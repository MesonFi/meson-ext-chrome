import React from "react"
import SvgIcon from "~/components/SvgIcon"
import PlusIconSrc from "@assets/icons/plus.svg"

type Tab = "discover" | "history"

interface TabBarProps {
  selectedTab: Tab
  onSelect: (tab: Tab) => void
  onAdd: () => void
}

const TabBar: React.FC<TabBarProps> = ({ selectedTab, onSelect, onAdd }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface border-t flex justify-around relative">
      <button
        aria-label="Discover"
        onClick={() => onSelect("discover")}
        className={`text-base font-medium py-3 w-full ${selectedTab === "discover" ? "text-textColor1 bg-primary/10" : "text-textColor4"}`}
      >
        Discover
      </button>
      <button
        aria-label="Add"
        onClick={onAdd}
        className="text-2xl text-white absolute left-[50%] translate-x-[-50%] -top-3 w-12 h-12 rounded-full bg-primary hover:bg-primary-hover active:bg-primary flex items-center justify-center"
      >
        <SvgIcon src={PlusIconSrc} />
      </button>
      <button
        aria-label="History"
        onClick={() => onSelect("history")}
        className={`text-base font-medium py-3 w-full ${selectedTab === "history" ? "text-textColor1 bg-primary/10" : "text-textColor4"}`}
      >
        History
      </button>
    </nav>
  )
}

export default TabBar
