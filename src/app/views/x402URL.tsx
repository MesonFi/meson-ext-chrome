import React, { useState } from "react"
import { Button } from "~/components/Button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer"
import { SvgIcon } from "~/components/SvgIcon"
import CloseIconSrc from "@assets/icons/X.svg"
import PasteIconSrc from "@assets/icons/paste.svg"
import { Input } from "~/components/ui/input"
import { MessageTooltip } from "~/components/MessageTooltip"
import X402Popup from "./x402/X402Popup"
import { clearPendingTransaction } from "~/lib/storage/x402_pending_transaction"

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

type X402URLProps = {
  mode?: "popup" | "sidepanel"
}

export const X402URL: React.FC<X402URLProps> = ({ mode = "popup" }) => {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showItem, setShowItem] = useState<any | null>(null)

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
        setShowItem({
          ...body,
          resource: url
        })
        setOpen(false)
        setUrl("")
        setError(null)
      } else {
        setError("URL must be a x402 url.")
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

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const text = await navigator.clipboard.readText()
          setUrl(text)
          if (text.trim()) {
            const validationError = validateURL(text)
            setError(validationError)
          } else {
            setError(null)
          }
          return
        } catch (clipboardError) {
          console.warn("Clipboard API failed, trying fallback method:", clipboardError)
        }
      }

      const textarea = document.createElement('textarea')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()

      const success = document.execCommand('paste')
      const text = textarea.value
      document.body.removeChild(textarea)

      if (success && text) {
        setUrl(text)

        // 验证粘贴的内容
        if (text.trim()) {
          const validationError = validateURL(text)
          setError(validationError)
        } else {
          setError(null)
        }
      } else {
        throw new Error("Paste operation failed")
      }
    } catch (e) {
      console.error("Failed to paste:", e)
      setError("Failed to paste. Please use Ctrl+V or Cmd+V to paste.")
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
              <SvgIcon src={CloseIconSrc} className="min-w-6 h-6" />
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
              suffix={
                <MessageTooltip content={'Paste'}>
                  <SvgIcon src={PasteIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover cursor-pointer" onClick={handlePaste} />
                </MessageTooltip>
              }
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
              disabled={!isValid || loading}
              size="lg"
              className="w-full"
              onClick={handleConfirm}
              loading={loading}
            >
              Confirm
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {showItem && (
        <X402Popup
          item={showItem}
          mode={mode}
          onClose={async () => {
            await clearPendingTransaction()
            setShowItem(null)
          }}
        />
      )}
    </div>
  )
}
