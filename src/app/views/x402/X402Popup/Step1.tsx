import React, { useMemo, useState } from "react"
import { useWallet } from "../../../contexts/WalletContext"
import X402AcceptOption from "./X402AcceptOption"
import { buildXPaymentHeader } from "../lib"
import { Button } from "~src/components/Button"
import { ConnectPhantomButton } from "~src/components/PhantomWallet"
import type { X402Accept, X402Item } from "../types"

// 根据 accept 输出 schema 推导方法
function deriveInitByAccept(acc: X402Accept): RequestInit {
  const method = acc?.outputSchema?.input?.method?.toUpperCase?.() || "GET"
  if (method === "POST") return { method: "POST" }
  return { method }
}

type Props = {
  item: X402Item
  mode?: "popup" | "sidepanel"
  onSelected: (acc: X402Accept, init: RequestInit, xPaymentHeader: string) => void
}

const Step1: React.FC<Props> = ({ item, mode = "popup", onSelected }) => {
  const { connected, signer } = useWallet()
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
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
        requirement: selectedAccept as any  // API 数据类型比 x402 库类型定义更宽松
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
    <div className="">
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
        <div className="text-xs text-gray-600">No accepts.</div>
      )}

      {err && <div className="text-xs text-error mt-3">{err}</div>}

      {/* Footer */}
      <div className="mt-6 px-0 border-borderColor flex items-center justify-end">
        {
          connected ?
            <Button
              className="w-full"
              variant="primary"
              size="lg"
              onClick={onProceed}
              disabled={!canProceed}
              loading={signing}
            >
              {signing ? 'Signing' : 'Confirm'}
            </Button> : <ConnectPhantomButton className="w-full" size="lg" />
        }
      </div>
    </div>
  )
}

export default Step1
