import React, { useState } from "react"
import { SvgIcon } from "~src/components/SvgIcon"
import CopyIconSrc from "~src/assets/icons/copy.svg"
import { MessageTooltip } from "~src/components/MessageTooltip"

type Props = {
  finalText: string
  decodedPaymentResp: any
}

const Step3: React.FC<Props> = ({ finalText, decodedPaymentResp }) => {
  const [copiedPayment, setCopiedPayment] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)

  const handleCopy = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const paymentResponseJson = decodedPaymentResp
    ? JSON.stringify(decodedPaymentResp, null, 2)
    : ""

  const responseBodyJson = (() => {
    if (!finalText) return ""
    try {
      const parsed = JSON.parse(finalText)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return finalText
    }
  })()

  return (
    <div className="space-y-3 h-full pt-2 px-3">
      {decodedPaymentResp && (
        <div>
          <div className="flex items-center mb-1 gap-1">
            <div className="text-sm text-textColor1">X-Payment Response</div>
            <MessageTooltip content={copiedPayment ? 'Copied' : 'Copy'}>
              <button
                onClick={() => handleCopy(paymentResponseJson, setCopiedPayment)}
                className="flex items-center"
              >
                <SvgIcon src={CopyIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors" />
              </button>
            </MessageTooltip>
          </div>
          <pre className="text-xs bg-card p-2 rounded-lg whitespace-pre-wrap break-words">
            {paymentResponseJson}
          </pre>
        </div>
      )}

      <div>
        <div className="flex items-center mb-1  gap-1">
          <div className="text-sm text-textColor1">Response Body</div>
          <MessageTooltip content={copiedBody ? 'Copied' : 'Copy'}>
            <button
              onClick={() => handleCopy(responseBodyJson || finalText, setCopiedBody)}
              className="flex items-center"
            >
              <SvgIcon src={CopyIconSrc} className="w-4 h-4 text-textColor2 hover:text-primaryColorHover transition-colors" />
            </button>
          </MessageTooltip>
        </div>
        <pre className="text-xs bg-card p-2 rounded-lg whitespace-pre-wrap break-words">
          {responseBodyJson || "(empty)"}
        </pre>
      </div>
    </div>
  )
}

export default Step3
