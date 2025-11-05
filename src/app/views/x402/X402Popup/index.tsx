import React, { useState } from "react"
import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"

type Props = {
  item: any
  onClose: () => void
}

type Step = 1 | 2 | 3

const X402Popup: React.FC<Props> = ({ item, onClose }) => {
  const [step, setStep] = useState<Step>(1)

  // 选择的 accept
  const [selectedAccept, setSelectedAccept] = useState<any>(null)
  // 支付凭证（X-PAYMENT header）
  const [xPaymentHeader, setXPaymentHeader] = useState<string>("")
  // 用于最终请求的 URL（优先 accept.resource，否则 item.resource）
  const resourceUrl = (selectedAccept?.resource as string) || (item?.resource as string) || "-"

  // 首次请求的 init（由 accept.outputSchema.input.method 推断）
  const [baseInit, setBaseInit] = useState<RequestInit>({ method: "GET" })

  // 最终响应数据
  const [finalText, setFinalText] = useState<string>("")
  const [decodedPaymentResp, setDecodedPaymentResp] = useState<any>(null)

  const renderStepIndicator = () => {
    const steps = [
      { n: 1, label: "支付选项" },
      { n: 2, label: "支付凭证" },
      { n: 3, label: "完成请求" }
    ] as const
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-gray-600">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <span className={step === s.n ? "font-semibold text-gray-900" : ""}>
              {s.label}
            </span>
            {i < steps.length - 1 && <span>›</span>}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* 顶部留白 + 遮罩（点击关闭） */}
      <div className="absolute inset-0 bg-black/30 pt-1" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-white max-h-[80vh] rounded-t-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题：显示完整 URL，break-all */}
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="text-[13px] font-semibold break-all">
            {resourceUrl}
          </div>
        </div>

        {renderStepIndicator()}

        {/* 内容区域，底部按钮在各 Step 内部 */}
        <div className="px-3 pb-3 pt-1 max-h-[calc(80vh-32px-32px)] overflow-y-auto text-[13px]">
          {step === 1 && (
            <Step1
              item={item}
              onSelected={(acc, init, header) => {
                setSelectedAccept(acc)
                setBaseInit(init)
                setXPaymentHeader(header)
                setStep(2)
              }}
            />
          )}

          {step === 2 && (
            <Step2
              resourceUrl={resourceUrl}
              baseInit={baseInit}
              xPaymentHeader={xPaymentHeader}
              onCompleted={(payload) => {
                setFinalText(payload.text)
                setDecodedPaymentResp(payload.decoded)
                setStep(3)
              }}
            />
          )}

          {step === 3 && (
            <Step3
              finalText={finalText}
              decodedPaymentResp={decodedPaymentResp}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default X402Popup
