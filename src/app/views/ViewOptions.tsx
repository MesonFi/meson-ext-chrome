// src/app/views/ViewOptions.tsx
import React, { useEffect, useState } from "react"

const STORAGE_KEY = "x402_bazaar_url"

const ViewOptions: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [url, setUrl] = useState("")

  useEffect(() => {
    ;(async () => {
      const v = await chrome.storage.local.get(STORAGE_KEY)
      setUrl((v?.[STORAGE_KEY] as string) || "")
    })()
  }, [])

  async function save() {
    await chrome.storage.local.set({ [STORAGE_KEY]: url.trim() })
    goBack()
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200"
          onClick={goBack}
        >
          ←
        </button>
        <h3 className="text-lg font-semibold">设置</h3>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-600" htmlFor="bazaar">
          x402 Bazaar 服务地址（可覆盖默认）
        </label>
        <input
          id="bazaar"
          placeholder="https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={save}
          className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
        >
          保存
        </button>
        <button
          onClick={goBack}
          className="px-3 py-2 rounded-md bg-slate-200 hover:bg-slate-300 text-sm"
        >
          取消
        </button>
      </div>
    </div>
  )
}

export default ViewOptions
