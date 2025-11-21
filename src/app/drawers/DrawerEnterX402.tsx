import React, { useState } from "react"
import { useDrawer } from "~/app/contexts/AppProvider"

import PasteIconSrc from "@assets/icons/paste.svg"
import { Button } from "~/components/Button"
import { SvgIcon } from "~/components/SvgIcon"
import { Input } from "~/components/ui/input"
import { MessageTooltip } from "~/components/MessageTooltip"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"

import { loadRecentUrls, saveRecentUrl } from "~/lib/storage/recentUrls"
import { clearPendingTransaction } from "~/lib/storage/x402_pending_transaction"

import DrawerX402Request, { DrawerTitleX402Request } from "./DrawerX402Request"

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

type DrawerEnterX402Props = {
  mode?: "popup" | "sidepanel"
}

export const DrawerEnterX402: React.FC<DrawerEnterX402Props> = ({ mode = "popup" }) => {
  const { openDrawer, closeDrawer } = useDrawer()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentUrls, setRecentUrls] = useState<{ url: string; method: "GET" | "POST" }[]>([])
  const [method, setMethod] = useState<"GET" | "POST">("POST")

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
        method,
        headers: {
          "Content-Type": "application/json"
        }
      })
      setLoading(false)
      console.log("Response status:", response.status)

      if (response.status === 402) {
        const body = await response.json()
        console.log("402 Response body:", body)
        await saveRecentUrl(url, method)
        openDrawer(
          <DrawerX402Request
            item={{ ...body, resource: url }}
            mode={mode}
            onClose={() => clearPendingTransaction()}
          />,
          <DrawerTitleX402Request>{url}</DrawerTitleX402Request>
        )
        setUrl("")
        setError(null)
      } else {
        setError("Request did not return a 402 status. Please try again using GET or POST.")
      }
    } catch (e) {
      setLoading(false)
      console.error("Request failed:", e)
      setError("Request failed")
    }
  }


  React.useEffect(() => {
    loadRecentUrls().then(list => setRecentUrls(list))
  }, [])

  const selectRecent = (u: { url: string; method?: "GET" | "POST" }) => {
    setUrl(u.url)
    setMethod(u.method ?? "GET")
    const validationError = validateURL(u.url)
    setError(validationError)
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
    <div className="p-3 pt-0">
      <div className="">
        <Input
          type="text"
          size="sm"
          value={url}
          onChange={handleUrlChange}
          placeholder="Please provide a URL supports x402"
          variant={error ? "error" : "default"}
          suffix={
            <MessageTooltip content={'Paste'}>
              <SvgIcon src={PasteIconSrc} className="w-4 h-4 text-secondary hover:text-primary-hover cursor-pointer" onClick={handlePaste} />
            </MessageTooltip>
          }
        />
        <div className="mt-3">
          <div className="text-xs text-color-strong mb-1">HTTP Method</div>
          <RadioGroup
            value={method}
            onValueChange={(value) => {
              setMethod(value as "GET" | "POST")
              setError(null)
            }}
            className="flex gap-6"
          >
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <RadioGroupItem value="GET" />
              <span>GET</span>
            </label>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <RadioGroupItem value="POST" />
              <span>POST</span>
            </label>
          </RadioGroup>
        </div>
        {error && (
          <div className="mt-2 text-xs text-error">
            {error}
          </div>
        )}
        {recentUrls.length > 0 && (
          <div className="mt-3 text-sm">
            <div className="mb-1 text-xs">Recently used</div>
            <ul className="space-y-1">
              {recentUrls.map(u => (
                <li key={`${u.method}-${u.url}`}>
                  <div
                    className="flex justify-between items-start gap-2"
                  >
                    <span
                      onClick={() => selectRecent(u)}
                      className="text-secondary hover:underline text-left text-sm cursor-pointer break-all flex-1"
                    >
                      {`${u.url}`}
                    </span>
                    <span className="bg-card text-textColor2 py-[1px] px-1 flex-shrink-0 rounded">
                      {u.method}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="pt-6">
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
      </div>
    </div>
  )
}
