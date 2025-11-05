// src/app/views/Home.tsx
import React from "react"

const Home: React.FC<{
  gotoX402: () => void
  gotoOptions: () => void
}> = ({ gotoX402, gotoOptions }) => {
  return (
    <div className="p-3 space-y-2">
      <div className="text-sm text-gray-500 mb-1">目录</div>
      <button
        className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:bg-slate-50"
        onClick={gotoX402}
      >
        x402 列表
      </button>
      <button
        className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:bg-slate-50"
        onClick={gotoOptions}
      >
        设置
      </button>
    </div>
  )
}

export default Home
