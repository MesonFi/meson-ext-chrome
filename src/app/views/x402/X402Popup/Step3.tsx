import React from "react"

type Props = {
  finalText: string
  decodedPaymentResp: any
}

const Step3: React.FC<Props> = ({ finalText, decodedPaymentResp }) => {
  return (
    <div className="space-y-3 h-full pt-2">
      {decodedPaymentResp && (
        <div>
          <div className="text-sm text-textColor1">
            X-Payment Response
          </div>
          <pre className="text-xs bg-card p-2 rounded-lg whitespace-pre-wrap break-words">
            {JSON.stringify(decodedPaymentResp, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <div className="text-sm text-textColor1">Response Body</div>
        <pre className="text-xs bg-card p-2 rounded-lg whitespace-pre-wrap break-words">
          {finalText || "(empty)"}
        </pre>
      </div>

      {/* Step3 没有可操作按钮，就不放 Footer */}
    </div>
  )
}

export default Step3
