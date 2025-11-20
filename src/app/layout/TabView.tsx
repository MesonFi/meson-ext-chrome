import React, { useState } from "react"
import { useDrawer } from "~/app/contexts/AppProvider"
import TabBar from "~/app/layout/TabBar"
import ViewX402Discover from "~/app/views/discover/ViewX402Discover"
import ViewHistory from "~/app/views/history/ViewX402History"
import { DrawerEnterX402 } from "~/app/views/DrawerEnterX402"

type Tab = "discover" | "history"

interface TabViewProps {
  mode: "popup" | "sidepanel"
}

const TabView: React.FC<TabViewProps> = ({ mode }) => {
  const [selectedTab, setSelectedTab] = useState<Tab>("discover")
  const { openDrawer } = useDrawer()

  const handleAdd = () => {
    openDrawer(<DrawerEnterX402 mode={mode} />, 'Enter x402 URL')
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[50px]">
        {selectedTab === "discover" ? <ViewX402Discover mode={mode} /> : <ViewHistory />}
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
