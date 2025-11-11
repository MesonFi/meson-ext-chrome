import React, { useEffect, useMemo, useState } from "react"
import { loadState, watchState, type AppState } from "../../lib/storage"
import X402Item from "./X402Item"
import X402Popup from "./X402Popup"
import { SvgIcon } from "~src/components/SvgIcon"
import RefreshIconSrc from "~/src/assets/icons/refresh.svg"
import Loading from "~src/components/Loading"
import { getPendingTransaction, clearPendingTransaction } from "../../lib/transactionState"
import { toast } from "sonner"

const BAZAAR_URL =
  "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources"

type Props = {
  mode?: "popup" | "sidepanel"
}

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

const ViewX402List: React.FC<Props> = ({ mode = "popup" }) => {
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
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

  async function load(forceRefresh = false) {
    setLoadFailed(false)

    // 1. 先尝试从缓存加载数据
    const raw = localStorage.getItem(CACHE_KEY)
    let cacheData: any[] = []

    if (raw) {
      try {
        const { data } = JSON.parse(raw)
        if (data && data.length > 0) {
          cacheData = data
          setItems(data)
        }
      } catch (e) {
        console.error("[ViewX402List] Failed to parse cache:", e)
      }
    }

    // 2. 只有在没有缓存数据或手动刷新时才显示 loading
    if (cacheData.length === 0 || forceRefresh) {
      setLoading(true)
    }

    // 3. 请求接口获取最新数据
    try {
      const res = await fetch(BAZAAR_URL, {
        headers: { accept: "application/json" },
        cache: "no-store"
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const list = normalizeList(json)

      // 成功：更新数据和缓存
      setItems(list)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: list }))
      setLoadFailed(false)
    } catch (e: any) {
      console.error("[ViewX402List] Failed to load:", e)

      // 失败：显示 toast 警告提示
      toast.warning("Failed to load X402 list", {
        description: e?.message ?? String(e)
      })

      // 如果有缓存数据，继续使用缓存
      if (cacheData.length > 0) {
        setItems(cacheData)
        setLoadFailed(false)
      } else {
        // 如果没有缓存数据，进入 loading failed 状态
        setItems([])
        setLoadFailed(true)
      }
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load(false) }, [])

  // 检查是否有待恢复的交易，自动打开 drawer
  useEffect(() => {
    const checkPendingTransaction = async () => {
      const savedState = await getPendingTransaction()
      if (savedState && savedState.item) {
        console.log("[ViewX402List] Auto-restoring pending transaction:", savedState)
        setShowItem(savedState.item)
      }
    }
    checkPendingTransaction()
  }, [])

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
    <div className="h-full flex flex-col">
      <div className="px-3 pt-4 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium">X402 List</h3>
            <button
              onClick={() => load(true)}
              className="flex items-center justify-center"
              title="刷新"
              aria-label="刷新"
              disabled={loading}
            >
              <SvgIcon
                src={RefreshIconSrc}
                className={`w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex rounded-md overflow-hidden border border-borderColor">
              <button
                className={`px-2 py-0.5 ${sortKey === "score" ? "bg-card border-r border-borderColor" : "bg-white text-textColor2 hover:text-textColor1"}`}
                onClick={() => setSortKey("score")}
                title="Score"
              >
                Score
              </button>
              <button
                className={`px-2 py-1 ${sortKey === "month" ? "bg-card border-l border-borderColor" : "bg-white text-textColor2 hover:text-textColor1"}`}
                onClick={() => setSortKey("month")}
                title="Monthly Tx"
              >
                Monthly Tx
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="text-sm text-gray-600 flex flex-col gap-6 px-3">
            {new Array(10).fill(1).map((_, i) => (
              <Loading key={i} className="w-full h-[128px] bg-card" />
            ))}
          </div>
        ) : loadFailed ? (
          <div className="text-sm text-textColor4 w-full flex justify-center mt-24">
            Loading failed
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-textColor4 w-full flex justify-center mt-24">
            No data available
          </div>
        ) : (
          <div className="divide-y divide-borderColor pb-3">
            {sorted.map((item: any, idx: number) => (
              <X402Item
                key={idx}
                item={item}
                maxMonth={maxMonth}
                sortKey={sortKey}
                onClick={() => setShowItem(item)}
              />
            ))}
          </div>
        )}
      </div>
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

export default ViewX402List
