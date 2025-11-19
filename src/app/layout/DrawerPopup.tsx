import React from "react"
import { useDrawer } from "~/app/contexts/AppProvider"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "~/components/ui/drawer"
import CloseIcon from "@assets/icons/X.svg"

const DrawerPopup: React.FC = () => {
  const { isOpen, title, content, closeDrawer } = useDrawer()
  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) closeDrawer() }}>
      <DrawerContent>
        <DrawerHeader className="flex justify-between items-center">
          <DrawerTitle className="break-all">{title}</DrawerTitle>
          <DrawerClose onClick={closeDrawer} className="p-1 hover:bg-surface rounded transition-colors">
            <img src={CloseIcon} alt="close" className="h-6 w-6" />
          </DrawerClose>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerPopup
