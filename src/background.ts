// src/background.ts
type MapValue = { tabId: number }
const KEY = "lastEligibleTabs"
const hasStorage = !!(globalThis as any)?.chrome?.storage?.local

function isHttpUrl(url?: string | null) {
  return !!url && /^https?:\/\//.test(url)
}

async function updateLastEligible(windowId: number | undefined, tabId: number, url?: string) {
  if (!hasStorage) return
  if (!windowId || !isHttpUrl(url)) return
  const data = (await chrome.storage.local.get(KEY))[KEY] as Record<string, MapValue> | undefined
  const map = data ?? {}
  map[String(windowId)] = { tabId }
  await chrome.storage.local.set({ [KEY]: map })
}

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  try {
    const tab = await chrome.tabs.get(tabId)
    await updateLastEligible(windowId, tabId, tab.url)
  } catch {}
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    await updateLastEligible(tab.windowId, tabId, changeInfo.url ?? tab.url)
  }
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (!hasStorage) return
  if (windowId === chrome.windows.WINDOW_ID_NONE) return
  const tabs = await chrome.tabs.query({ windowId, active: true })
  const t = tabs[0]
  if (t) await updateLastEligible(windowId, t.id!, t.url)
})
