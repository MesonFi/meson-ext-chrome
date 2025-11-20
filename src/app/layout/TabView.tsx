import React, { useState } from "react"
import { useDrawer } from "~/app/contexts/AppProvider"
import TabBar from "~/app/layout/TabBar"
import ViewX402List from "~/app/views/x402/ViewX402List"
import ViewHistory from "~/app/views/history/ViewHistory"
import { DrawerEnterX402 } from "~/app/views/DrawerEnterX402"

type Tab = "list" | "history"

interface TabViewProps {
  mode: "popup" | "sidepanel"
}

const TabView: React.FC<TabViewProps> = ({ mode }) => {
  const [selectedTab, setSelectedTab] = useState<Tab>("list")
  const { openDrawer } = useDrawer()

  const handleAdd = () => {
    openDrawer(<DrawerEnterX402 mode={mode} />, 'Enter x402 URL')
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[50px]">
        {selectedTab === "list" ? <ViewX402List mode={mode} /> : <ViewHistory />}
      </div>
      <TabBar
        selectedTab={selectedTab}
        onSelect={(tab) => setSelectedTab(tab)}
        onAdd={handleAdd}
      />
    </>
  )
}

export default TabView
