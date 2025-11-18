import React from "react"

type Tab = "list" | "history"

interface TabBarProps {
  selectedTab: Tab
  onSelect: (tab: Tab) => void
  onAdd: () => void
}

const TabBar: React.FC<TabBarProps> = ({ selectedTab, onSelect, onAdd }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-secondaryBg border-t border-borderColor flex justify-around py-2">
      <button
        aria-label="List"
        onClick={() => onSelect("list")}
        className={`text-sm ${selectedTab === "list" ? "text-primary" : "text-textColor2"}`}
      >
        List
      </button>
      <button
        aria-label="Add"
        onClick={onAdd}
        className="text-2xl text-primary"
      >
        +
      </button>
      <button
        aria-label="History"
        onClick={() => onSelect("history")}
        className={`text-sm ${selectedTab === "history" ? "text-primary" : "text-textColor2"}`}
      >
        History
      </button>
    </nav>
  )
}

export default TabBar
