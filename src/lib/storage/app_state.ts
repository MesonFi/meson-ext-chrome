import { get, set, remove, listen } from "./index"

export type AppState = {
  connected: boolean
  address?: string
}

const KEY = "app_state"

export async function loadState(): Promise<AppState> {
  const state = await get<AppState>(KEY)
  return state ?? { connected: false }
}

export async function saveState(next: AppState): Promise<void> {
  await set(KEY, next)
}

export async function clearState(): Promise<void> {
  await remove(KEY)
}

type Unsub = () => void

export function watchState(cb: (s: AppState) => void): Unsub {
  return listen((changes, area) => {
    if (area !== "local") return
    if (KEY in changes) {
      const v = changes[KEY].newValue as AppState | undefined
      cb(v ?? { connected: false })
    }
  })
}
