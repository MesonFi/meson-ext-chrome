import React, { useMemo, useState } from "react"
import { useWallet } from "~/app/contexts/AppProvider"

import { Button } from "~/components/Button"
import { ConnectButton } from "~/components/Wallet"

import { buildXPaymentHeader } from "~/lib/x402"
import type { X402Accept, X402Item } from "~/lib/x402/types"

import X402AcceptOption from "./X402AcceptOption"

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

const Step1: React.FC<Props> = ({ item, onSelected }) => {
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
    <div className="flex flex-col h-full px-3 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
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
          <div className="text-xs text-color-muted">No accepts.</div>
        )}

        {err && <div className="text-xs text-error mt-3">{err}</div>}
      </div>

      {/* 固定底部按钮 */}
      <div className="pt-4 flex-shrink-0">
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
            </Button> : <ConnectButton className="w-full" size="lg" />
        }
      </div>
    </div>
  )
}

export default Step1
