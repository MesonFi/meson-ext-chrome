import { get, set } from './index'

const KEY = 'x402_recent_urls'
const MAX = 5

export type RecentUrl = {
  url: string
  method: "GET" | "POST"
  timestamp: number
}

export async function loadRecentUrls(): Promise<RecentUrl[]> {
  const list = (await get<RecentUrl[]>(KEY)) ?? []
  return list.sort((a, b) => b.timestamp - a.timestamp)
}

export async function saveRecentUrl(url: string, method: "GET" | "POST"): Promise<void> {
  const list = (await loadRecentUrls()).filter(item => !(item.url === url && item.method === method))
  list.unshift({ url, method, timestamp: Date.now() })
  await set(KEY, list.slice(0, MAX))
}
