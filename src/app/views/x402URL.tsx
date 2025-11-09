import React, { useState } from "react"
import { Button } from "~src/components/Button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~src/components/ui/drawer"
import CloseIcon from "~src/assets/icons/X.svg"
import { Input } from "~src/components/ui/input"

export const X402URL: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-3 border-t border-borderColor">
      <Drawer open={open} onOpenChange={setOpen}>
        <Button
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={() => setOpen(true)}
        >
          Enter x402 URL
        </Button>
        <DrawerContent>
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>Enter x402 URL</DrawerTitle>
            <DrawerClose className="p-1 hover:bg-gray-100 rounded transition-colors">
              <img src={CloseIcon} alt="close" className="w-6 h-6" />
            </DrawerClose>
          </DrawerHeader>
          <div className="px-3">
            <Input
              type="text"
              size="sm"
              placeholder="Please provide a URL supports x402"
            />
          </div>
          <DrawerFooter className="pt-6">
            <Button variant="primary" disabled size="lg" className="w-full">
              Confirm
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}