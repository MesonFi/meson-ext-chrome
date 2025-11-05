import React from "react"
import "./app/styles.css"

export default function Options() {
  return (
    <div className="min-h-screen p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-4">扩展设置</h1>
      <p className="text-sm text-gray-600">把你的配置项放在这里（持久化到 chrome.storage）。</p>
    </div>
  )
}