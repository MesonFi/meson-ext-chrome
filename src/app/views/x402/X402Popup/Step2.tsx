import React, { useState } from "react"
import { fetchWithXPayment, decodeXPaymentResponseHeader } from "../lib"

type Props = {
  resourceUrl: string
  baseInit: RequestInit
  xPaymentHeader: string
  onCompleted: (payload: { text: string; decoded: any }) => void
}

const Step2: React.FC<Props> = ({
  resourceUrl,
  baseInit,
  xPaymentHeader,
  onCompleted
}) => {
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string>("")

  async function onSend() {
    setErr("")
    try {
      setSending(true)
      const res = await fetchWithXPayment(resourceUrl, baseInit, xPaymentHeader)
      const text = await res.clone().text()
      const decoded = decodeXPaymentResponseHeader(res)
      onCompleted({ text: text || "", decoded: decoded || null })
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3">
      {err && <div className="text-xs text-red-600">错误：{err}</div>}

      <div>
        <div className="text-[11px] text-gray-500 mb-1">支付凭证（X-PAYMENT）</div>
        <pre className="text-[11px] bg-slate-50 p-2 rounded whitespace-pre-wrap break-words">
          {xPaymentHeader}
        </pre>
      </div>

      {/* Footer */}
      <div className="h-14 mt-2 px-0 border-t border-gray-200 flex items-center justify-end">
        <button
          onClick={onSend}
          disabled={sending}
          className={`px-3 py-2 text-sm rounded ${
            sending
              ? "bg-slate-100 text-slate-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {sending ? "发送中…" : "发送支付凭证"}
        </button>
      </div>
    </div>
  )
}

export default Step2
