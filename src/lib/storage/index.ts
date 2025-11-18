export async function get<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(key)
  return (result[key] as T) ?? null
}

export async function set(key: string, value: any): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
}

export async function remove(key: string): Promise<void> {
  await chrome.storage.local.remove(key)
}

export function listen(cb: (changes: { [k: string]: chrome.storage.StorageChange }, area: string) => void): () => void {
  chrome.storage.onChanged.addListener(cb)
  return () => chrome.storage.onChanged.removeListener(cb)
}
