// src/lib/transport.ts
const TIMEOUT_MS = 5 * 60_000

export function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("等待响应超时")), ms)
    p.then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) }
    )
  })
}

function isHttp(url?: string | null) {
  return !!url && /^https?:\/\//.test(url)
}

// 只在“当前窗口”里找可注入的 tab，避免 sidepanel 干扰
async function getTargetTabInCurrentWindow(): Promise<chrome.tabs.Tab> {
  const win = await chrome.windows.getCurrent()
  const windowId = win.id!

  const [active] = await chrome.tabs.query({ windowId, active: true })
  if (active && isHttp(active.url)) return active

  const anyHttp = (await chrome.tabs.query({ windowId })).find(t => isHttp(t.url))
  if (anyHttp) return anyHttp

  throw new Error("未找到可注入的 http/https 标签页，请在当前窗口打开任意网站页面并刷新后再试。")
}

export async function sendToActiveTab<T>(msg: any): Promise<T> {
  const tab = await getTargetTabInCurrentWindow()
  return new Promise<T>((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id!, msg, (res) => {
      const err = chrome.runtime.lastError
      if (err) reject(new Error(`消息发送失败：${err.message}（tabUrl=${tab.url}）`))
      else resolve(res as T)
    })
  })
}
