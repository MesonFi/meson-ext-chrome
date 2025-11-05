import React from "react"

type Props = {
  finalText: string
  decodedPaymentResp: any
}

const Step3: React.FC<Props> = ({ finalText, decodedPaymentResp }) => {
  return (
    <div className="space-y-3">
      {decodedPaymentResp && (
        <div>
          <div className="text-[11px] text-gray-500 mb-1">
            X-PAYMENT-RESPONSE（解析）
          </div>
          <pre className="text-[11px] bg-slate-50 p-2 rounded whitespace-pre-wrap break-words">
            {JSON.stringify(decodedPaymentResp, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <div className="text-[11px] text-gray-500 mb-1">响应文本</div>
        <pre className="text-[11px] bg-slate-50 p-2 rounded whitespace-pre-wrap break-words">
          {finalText || "(empty)"}
        </pre>
      </div>

      {/* Step3 没有可操作按钮，就不放 Footer */}
    </div>
  )
}

export default Step3
