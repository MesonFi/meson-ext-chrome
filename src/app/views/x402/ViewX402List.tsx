import React, { useEffect, useMemo, useState } from "react"
import { loadState, watchState, type AppState } from "../../lib/storage"
import X402Item from "./X402Item"
import X402Popup from "./X402Popup"

const BAZAAR_URL =
  "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources"

type Props = { goBack: () => void }

function monthTx(meta?: any) {
  return (
    meta?.paymentAnalytics?.transactionsMonth ??
    meta?.paymentAnalytics?.totalTransactions ??
    0
  )
}
function normalizeList(json: any): any[] {
  if (Array.isArray(json)) return json
  if (Array.isArray(json?.items)) return json.items
  return []
}

type SortKey = "score" | "month"
const CACHE_KEY = "x402_cache"
const CACHE_MS = 5 * 60 * 1000

export default function ViewX402List({ goBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [items, setItems] = useState<any[]>([])
  const [sortKey, setSortKey] = useState<SortKey>("score")
  const [showItem, setShowItem] = useState<any | null>(null)

  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | undefined>("")

  useEffect(() => {
    ;(async () => {
      const s = await loadState()
      setConnected(!!s.connected && !!s.address)
      setAddress(s.address)
    })()
    return watchState((s: AppState) => {
      setConnected(!!s.connected && !!s.address)
      setAddress(s.address)
    })
  }, [])

  async function load(force = false) {
    setLoading(true)
    setError("")
    try {
      if (!force) {
        const raw = localStorage.getItem(CACHE_KEY)
        if (raw) {
          const { ts, data } = JSON.parse(raw)
          if (Date.now() - ts < CACHE_MS) {
            setItems(data || [])
            setLoading(false)
            return
          }
        }
      }
      const res = await fetch(BAZAAR_URL, {
        headers: { accept: "application/json" },
        cache: "no-store"
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const list = normalizeList(json)
      setItems(list)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: list }))
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const maxMonth = useMemo(
    () => Math.max(0, ...items.map((it) => monthTx(it?.metadata) || 0)),
    [items]
  )
  const sorted = useMemo(() => {
    const arr = [...items]
    if (sortKey === "score") {
      arr.sort(
        (a, b) =>
          (b?.metadata?.confidence?.overallScore ?? -1) -
          (a?.metadata?.confidence?.overallScore ?? -1)
      )
    } else {
      arr.sort((a, b) => monthTx(b?.metadata) - monthTx(a?.metadata))
    }
    return arr
  }, [items, sortKey])

  return (
    <div>
      <div className="px-3 pt-3 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200"
              onClick={goBack}
            >
              ←
            </button>
            <h3 className="text-lg font-semibold">x402 列表</h3>
            <button
              onClick={() => load(true)}
              className="p-1 rounded hover:bg-slate-100"
              title="刷新"
              aria-label="刷新"
              disabled={loading}
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <path d="M21 3v6h-6" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">排序：</span>
            <div className="flex rounded-md overflow-hidden border border-gray-200">
              <button
                className={`px-2 py-1 ${sortKey === "score" ? "bg-slate-200" : "bg-white hover:bg-slate-50"}`}
                onClick={() => setSortKey("score")}
                title="按综合评分排序"
              >
                评分
              </button>
              <button
                className={`px-2 py-1 ${sortKey === "month" ? "bg-slate-200" : "bg-white hover:bg-slate-50"}`}
                onClick={() => setSortKey("month")}
                title="按月交易量排序"
              >
                月交易
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        {loading && <div className="text-sm text-gray-600">加载中...</div>}
        {error && <div className="text-sm text-red-600">加载失败：{error}</div>}

        {!loading && !error && (
          <div className="divide-y divide-gray-200">
            {sorted.map((item: any, idx: number) => (
              <X402Item
                key={idx}
                item={item}
                maxMonth={maxMonth}
                onClick={() => setShowItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {showItem && (
        <X402Popup
          item={showItem}
          onClose={() => setShowItem(null)}
        />
      )}
    </div>
  )
}
