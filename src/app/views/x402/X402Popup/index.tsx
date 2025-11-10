import React, { useState } from "react"
import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~src/components/ui/drawer"
import CloseIcon from "~src/assets/icons/X.svg"
import ArrowRightIcon from "~src/assets/icons/arrow-right.svg"

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
      { n: 1, label: "Accepts" },
      { n: 2, label: "X-Payment Header" },
      { n: 3, label: "Response" }
    ] as const
    return (
      <div className="flex items-center px-3 py-2 text-sm text-textColor3">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <span className={step === s.n ? "text-textColor1 font-medium" : ""}>
              {s.label}
            </span>
            {i < steps.length - 1 && <img src={ArrowRightIcon} alt="arrow" className="w-6 h-6" />}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <Drawer open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DrawerContent>
        <DrawerHeader className="flex justify-between border-borderColor items-start">
          <DrawerTitle className="break-all pr-8 text-left font-normal text-sm">
            {resourceUrl}
          </DrawerTitle>
          <DrawerClose className="p-1 hover:bg-gray-100 rounded transition-colors">
            <img src={CloseIcon} alt="close" className="min-w-6 h-6" />
          </DrawerClose>
        </DrawerHeader>

        {renderStepIndicator()}

        {/* 内容区域，底部按钮在各 Step 内部 */}
        <div className="px-3 pb-3 pt-1 max-h-[calc(80vh-120px)] overflow-auto text-[13px] scrollbar-hide">
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
      </DrawerContent>
    </Drawer>
  )
}

export default X402Popup
