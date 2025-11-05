import React, { useMemo, useState } from "react"
import { useWallet } from "../../../contexts/WalletContext"
import X402AcceptOption from "./X402AcceptOption"
import { buildXPaymentHeader } from "../lib"

// 根据 accept 输出 schema 推导方法
function deriveInitByAccept(acc: any): RequestInit {
  const method = acc?.outputSchema?.input?.method?.toUpperCase?.() || "GET"
  if (method === "POST") return { method: "POST" }
  return { method }
}

type Props = {
  item: any
  onSelected: (acc: any, init: RequestInit, xPaymentHeader: string) => void
}

const Step1: React.FC<Props> = ({ item, onSelected }) => {
  const { connected, signer } = useWallet()
  const [selectedIdx, setSelectedIdx] = useState<number>(-1)
  const [signing, setSigning] = useState(false)
  const [err, setErr] = useState<string>("")

  const accepts = useMemo(() => (Array.isArray(item?.accepts) ? item.accepts : []), [item])
  const selectedAccept = selectedIdx >= 0 ? accepts[selectedIdx] : null

  const canProceed = connected && !!selectedAccept

  async function onProceed() {
    setErr("")
    try {
      if (!connected) throw new Error("钱包未连接")
      if (!selectedAccept) throw new Error("请先选择一个支付选项")

      setSigning(true)

      const x402Version: number = item?.x402Version ?? 1
      // 直接用列表里的 accept 当成 requirement（x402 的 schema兼容）
      const header = await buildXPaymentHeader({
        wallet: signer,
        x402Version,
        requirement: selectedAccept
      })

      const init = deriveInitByAccept(selectedAccept)
      onSelected(selectedAccept, init, header)
    } catch (e: any) {
      console.error(e)
      setErr(e?.message ?? String(e))
    } finally {
      setSigning(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* 支付选项列表 */}
      {accepts.map((acc: any, i: number) => (
        <X402AcceptOption
          key={i}
          accept={acc}
          selected={i === selectedIdx}
          onSelect={() => setSelectedIdx(i)}
        />
      ))}

      {accepts.length === 0 && (
        <div className="text-xs text-gray-600">没有可用的支付选项。</div>
      )}

      {err && <div className="text-xs text-red-600">{err}</div>}

      {/* Footer */}
      <div className="h-14 mt-2 px-0 border-t border-gray-200 flex items-center justify-end">
        <button
          onClick={onProceed}
          disabled={!canProceed || signing}
          className={`px-3 py-2 text-sm rounded ${
            canProceed && !signing
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-100 text-slate-500 cursor-not-allowed"
          }`}
        >
          {signing ? "生成中…" : "进行支付"}
        </button>
      </div>
    </div>
  )
}

export default Step1
