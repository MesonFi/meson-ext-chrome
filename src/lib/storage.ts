// src/app/lib/storage.ts
export type AppState = {
  connected: boolean
  address?: string
}

const KEY = "app_state"

export async function loadState(): Promise<AppState> {
  const raw = await chrome.storage.local.get(KEY)
  return (raw[KEY] as AppState) ?? { connected: false }
}

export async function saveState(next: AppState): Promise<void> {
  await chrome.storage.local.set({ [KEY]: next })
}

export async function clearState(): Promise<void> {
  await chrome.storage.local.remove(KEY)
}

type Unsub = () => void

// 监听存储变化（popup/sidepanel 之间实时同步）
export function watchState(cb: (s: AppState) => void): Unsub {
  const handler = (changes: { [k: string]: chrome.storage.StorageChange }, area: string) => {
    if (area !== "local") return
    if (KEY in changes) {
      const v = changes[KEY].newValue as AppState | undefined
      cb(v ?? { connected: false })
    }
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}
