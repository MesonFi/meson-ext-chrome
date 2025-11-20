import React, { useEffect, useMemo, useState } from "react"
import X402Item from "./X402Item"
import { useDrawer } from "~/app/contexts/AppProvider"
import { SvgIcon } from "~/components/SvgIcon"
import RefreshIconSrc from "@assets/icons/refresh.svg"
import Loading from "~/components/Loading"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import SettingsIconSrc from "@assets/icons/settings.svg"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "~/components/ui/select"
import { toast } from "sonner"
import type {
  X402Item as X402ItemType,
  X402DiscoveryResponse,
  X402ItemMetadata
} from "./types"

import DrawerX402Request, { DrawerTitleX402Request } from "./DrawerX402Request"

const BAZAAR_URL =
  "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources"

type Props = {
  mode?: "popup" | "sidepanel"
}

function monthTx(meta?: X402ItemMetadata) {
  return (
    meta?.paymentAnalytics?.transactionsMonth ??
    meta?.paymentAnalytics?.totalTransactions ??
    0
  )
}
function normalizeList(json: X402DiscoveryResponse | X402ItemType[]): X402ItemType[] {
  if (Array.isArray(json)) return json
  if (Array.isArray(json?.items)) return json.items
  return []
}

type SortKey = "score" | "month"
const CACHE_KEY = "x402_cache"

const ViewX402List: React.FC<Props> = ({ mode = "popup" }) => {
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [items, setItems] = useState<X402ItemType[]>([])
  const [sortKey, setSortKey] = useState<SortKey>("score")
  const [serviceUrl, setServiceUrl] = useState<string>(BAZAAR_URL)
  const [networkFilter, setNetworkFilter] = useState<string>("all")
  const [networks, setNetworks] = useState<string[]>([])
  const { openDrawer } = useDrawer()

  async function load(forceRefresh = false) {
    setLoadFailed(false)

    // 1. 先尝试从缓存加载数据
    const raw = localStorage.getItem(CACHE_KEY)
    let cacheData: X402ItemType[] = []

    if (raw) {
      try {
        const { data } = JSON.parse(raw)
        if (data && data.length > 0) {
          cacheData = data as X402ItemType[]
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
      const res = await fetch(serviceUrl, {
        headers: { accept: "application/json" },
        cache: "no-store"
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: X402DiscoveryResponse = await res.json()
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
  // on mount load list and saved options
  useEffect(() => {
    const opts = JSON.parse(localStorage.getItem("x402_list_option")||"{}")
    if (opts.serviceUrl) setServiceUrl(opts.serviceUrl)
    if (opts.sortKey) setSortKey(opts.sortKey)
    if (opts.networkFilter) setNetworkFilter(opts.networkFilter)
    load(false)
  }, [])

  // derive available networks whenever items change
  useEffect(() => {
    const uniq = Array.from(new Set(items.flatMap(it => it.accepts?.map(a=>a.network)||[])))
    setNetworks(uniq)
  }, [items])

  // persist options on change
  useEffect(() => {
    localStorage.setItem("x402_list_option", JSON.stringify({serviceUrl,sortKey,networkFilter}))
  }, [serviceUrl,sortKey,networkFilter])
  
  // reload when serviceUrl changes
  useEffect(() => { load(true) }, [serviceUrl])
  


  const maxMonth = useMemo(
    () => Math.max(0, ...items.map((it) => monthTx(it?.metadata) || 0)),
    [items]
  )
  const sorted = useMemo(() => {
    const filtered = items.filter(it=>
      networkFilter==="all" ||
      it.accepts?.some(a=>a.network===networkFilter)
    )
    const arr = [...filtered]
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
  }, [items, sortKey, networkFilter])

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
                className={`w-4 h-4 text-secondary hover:text-primary-hover transition-colors ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button aria-label="Settings">
                  <SvgIcon src={SettingsIconSrc} className="w-5 h-5 text-secondary hover:text-primary-hover" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content sideOffset={4} className="p-2 bg-white rounded border space-y-2 min-w-[220px]">
                <div className="text-xs font-medium">X402 Discovery Service URL</div>
                <Select value={serviceUrl} onValueChange={setServiceUrl}>
                  <SelectTrigger className="w-64 truncate">
                    <SelectValue placeholder="Select URL" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={BAZAAR_URL} className="truncate">
                      {BAZAAR_URL}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs font-medium pt-2">Sort By</div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSortKey('score')}
                    className={`px-2 py-1 rounded ${sortKey === 'score' ? 'bg-primary text-white' : 'bg-surface text-color-strong'}`}
                  >
                    Score
                  </button>
                  <button
                    onClick={() => setSortKey('month')}
                    className={`px-2 py-1 rounded ${sortKey === 'month' ? 'bg-primary text-white' : 'bg-surface text-color-strong'}`}
                  >
                    Monthly Tx
                  </button>
                </div>
                <div className="text-xs font-medium pt-2">Network</div>
                <Select value={networkFilter} onValueChange={setNetworkFilter}>
                  <SelectTrigger className="w-64 truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All</SelectItem>
                    {networks.map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="text-sm text-gray-600 flex flex-col gap-6 px-3">
            {new Array(10).fill(1).map((_, i) => (
              <Loading key={i} className="w-full h-[128px] bg-surface" />
            ))}
          </div>
        ) : loadFailed ? (
          <div className="text-sm w-full flex justify-center mt-24">
            Loading failed
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm w-full flex justify-center mt-24">
            No data available
          </div>
        ) : (
          <div className="divide-y divide-border pb-3">
            {sorted.map((item, idx) => (
              <X402Item
                key={idx}
                item={item}
                maxMonth={maxMonth}
                sortKey={sortKey}
                onClick={() => openDrawer(<DrawerX402Request item={item} mode={mode} />, <DrawerTitleX402Request>{item.resource}</DrawerTitleX402Request>)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewX402List
