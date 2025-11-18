import inpageUrl from "url:~wallet-transport/inpage-script.ts"

console.log("[CONTENT SCRIPT] wallet-transport/content-script.ts loaded", location.href)

/**
 * content script:
 * - 注入 inpage.js（页面上下文执行）
 * - 接收 popup 的消息，转发给页面（postMessage）
 * - 接收页面回包，回给 popup
 */

type Responder = (resp: any) => void
const pending = new Map<string, Responder>()
let seq = 1
const nextId = () => `${Date.now()}_${seq++}`

console.log("[CS] metamask-bridge loaded on", location.href)

// 看看打出来的 URL 长啥样（应该是 chrome-extension://<ID>/inpage.<hash>.js?...）
console.log("[CS] resolved inpageUrl =", inpageUrl)

const injectInpage = () => {
  console.log("[CS] injecting inpage via", inpageUrl)
  const script = document.createElement("script")
  script.src = inpageUrl        // ✅ 不再用 chrome.runtime.getURL("inpage.js")
  script.async = false
  ;(document.head || document.documentElement).appendChild(script)
  script.remove()
}
injectInpage()

// 来自 popup 的消息 -> 转发给页面(inpage)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("[CS] <- popup message", message)
  const id = nextId()
  pending.set(id, sendResponse)
  // 调试阶段用 "*"，生产改成 window.origin 或 location.origin
  window.postMessage({ target: "INPAGE", id, payload: message }, "*")
  console.log("[CS] -> posted to page (INPAGE)", { id, payload: message })
  return true // 表示异步 sendResponse
})

// 来自页面(inpage)的回传 -> 回给 popup
window.addEventListener("message", (evt) => {
  if (evt.source !== window) return
  const data = evt.data
  if (!data || data.target !== "CONTENT") return
  console.log("[CS] <- inpage message", data)
  const { id, result, error } = data
  const responder = pending.get(id)
  if (responder) {
    if (error) {
      console.warn("[CS] responding with error to popup", error)
      responder({ error })
    } else {
      responder(result)
    }
    pending.delete(id)
    console.log("[CS] -> popup response sent for id", id)
  } else {
    console.warn("[CS] no pending responder for id", id)
  }
})
