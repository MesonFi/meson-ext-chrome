// src/app/Wallet.tsx
import React, { useMemo, useState } from "react"
import { useWallet } from "./contexts/WalletContext"

function shortAddr(addr?: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const WalletStatus: React.FC = () => {
  const { booting, connecting, connected, address, connect, disconnect } = useWallet()

  const [open, setOpen] = useState(false)

  // 统一按钮尺寸样式（连接 / 断开保持一致）
  const BTN_BASE = "px-3 py-2 text-sm rounded-md"
  const BTN_PRIMARY = `${BTN_BASE} bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50`
  const BTN_NEUTRAL = `${BTN_BASE} bg-slate-100 hover:bg-slate-200`

  const leftText = useMemo(() => {
    if (booting) return "加载中…"
    if (connecting) return "连接中…"
    if (!connected) return "未连接"
    return shortAddr(address)
  }, [booting, connecting, connected, address])

  return (
    <>
      {/* Header 左侧：可点击区域，增加 hover 效果 */}
      <button
        className="min-w-0 max-w-[220px] text-left text-sm font-medium truncate px-2 py-1 rounded hover:bg-slate-100 transition"
        onClick={() => setOpen(true)}
        title={connected ? address : leftText}
        aria-label="钱包连接状态"
      >
        {leftText}
      </button>

      {/* 向下展开的面板 + 遮罩（从 header 下方覆盖） */}
      {open && (
        <div
          className="fixed inset-0 z-[60]"
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (target.id === "wallet-overlay") setOpen(false)
          }}
        >
          {/* 顶部 Header 高度占位（留白） */}
          <div className="absolute top-0 left-0 right-0 h-12 pointer-events-none" />

          {/* 阴影：点击可关闭 */}
          <div
            id="wallet-overlay"
            className="absolute left-0 right-0 top-12 bottom-0 bg-black/30"
          />

          {/* 面板本体（从 header 下方“下拉”） */}
          <div className="absolute left-0 right-0 top-12 bg-white border-b border-gray-200 shadow-xl">
            <div className="p-3">
              {!connected ? (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">连接钱包</div>
                  <div className="text-xs text-gray-600">
                    点击下方按钮通过 Phantom 连接。
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await connect()
                        setOpen(false)
                      } catch (e: any) {
                        alert(`连接失败：${e?.message ?? String(e)}`)
                      }
                    }}
                    disabled={connecting}
                    className={BTN_PRIMARY}
                  >
                    {connecting ? "连接中…" : "连接 Phantom"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">钱包</div>
                  <div className="text-xs text-gray-600 break-words">{address}</div>
                  <div className="flex gap-2">
                    <button
                      className={BTN_NEUTRAL}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(address)
                        } catch {}
                      }}
                    >
                      复制地址
                    </button>
                    <button
                      className={BTN_NEUTRAL}
                      onClick={async () => {
                        await disconnect()
                        setOpen(false)
                      }}
                    >
                      断开连接
                    </button>
                    {/* 不放“关闭”按钮；点击阴影区域即可关闭 */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WalletStatus
