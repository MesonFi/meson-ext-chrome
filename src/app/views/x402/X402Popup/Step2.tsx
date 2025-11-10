import React, { useState } from "react"
import { fetchWithXPayment, decodeXPaymentResponseHeader } from "../lib"
import { Button } from "~src/components/Button"

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
    <div className="">
      {err && <div className="text-xs text-error mb-3">错误：{err}</div>}

      <div className="">
        <div className="text-textColor1 text-sm mb-1">X-PaymentHeader</div>
        <div className="text-xs bg-card p-2 rounded-lg whitespace-pre-wrap break-words h-[172px] overflow-y-scroll scrollbar-hide">
          {xPaymentHeader}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 px-0 border-borderColor flex items-center justify-end">
        <Button
          className="w-full"
          variant="primary"
          size="lg"
          onClick={onSend}
          loading={sending}
        >
          {sending ? 'Sending' : 'Request with Payment Header'}
        </Button>
      </div>
    </div>
  )
}

export default Step2
