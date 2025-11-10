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
import { SvgIcon } from "~src/components/SvgIcon"
import CloseIconSrc from "~src/assets/icons/X.svg"
import { Input } from "~src/components/ui/input"

// URL 验证函数
function validateURL(url: string): string | null {
  if (!url.trim()) {
    return "Invalid URL"
  }

  try {
    const urlObj = new URL(url)

    // 必须是 https 协议
    if (urlObj.protocol !== "https:") {
      return "Invalid URL"
    }

    // 必须有 hostname
    if (!urlObj.hostname) {
      return "Invalid URL"
    }

    return null // 验证通过
  } catch (e) {
    return "Invalid URL"
  }
}

export const X402URL: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)

    // 实时验证
    if (value.trim()) {
      const validationError = validateURL(value)
      setError(validationError)
    } else {
      setError(null)
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    const validationError = validateURL(url)
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      setLoading(false)
      console.log("Response status:", response.status)

      if (response.status === 402) {
        const body = await response.json()
        console.log("402 Response body:", body)
        setOpen(false)
        setUrl("")
        setError(null)
      } else {
        setError("URL must be a 402 url.")
      }
    } catch (e) {
      setLoading(false)
      console.error("Request failed:", e)
      setError("Request failed")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // 关闭时重置状态
      setUrl("")
      setError(null)
    }
  }

  const isValid = url.trim() && !error

  return (
    <div className="p-3 border-t border-borderColor">
      <Drawer open={open} onOpenChange={handleOpenChange}>
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
              <SvgIcon src={CloseIconSrc} className="w-6 h-6" />
            </DrawerClose>
          </DrawerHeader>
          <div className="px-3">
            <Input
              type="text"
              size="sm"
              value={url}
              onChange={handleUrlChange}
              placeholder="Please provide a URL supports x402"
              variant={error ? "error" : "default"}
            />
            {error && (
              <div className="mt-2 text-xs text-error">
                {error}
              </div>
            )}
          </div>
          <DrawerFooter className="pt-6">
            <Button
              variant="primary"
              disabled={!isValid}
              size="lg"
              className="w-full"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}