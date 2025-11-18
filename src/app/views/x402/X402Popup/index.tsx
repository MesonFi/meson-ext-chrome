import React, { useState, useEffect } from "react"
import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer"
import CloseIcon from "@assets/icons/X.svg"
import ArrowRightIcon from "@assets/icons/arrow-right.svg"
import {
  savePendingTransaction,
  getPendingTransaction,
  clearPendingTransaction
} from "~/lib/storage/x402_pending_transaction"
import { parseValidBeforeFromHeader } from "../lib"
import type { X402Item, X402Accept } from "../types"
import { cn } from "~/lib/utils"
import { MessageTooltip } from "~/components/MessageTooltip"

type Props = {
  item: X402Item
  onClose: () => void
  mode?: "popup" | "sidepanel"
}

type Step = 1 | 2 | 3

const X402Popup: React.FC<Props> = ({ item, onClose, mode = "popup" }) => {
  const [step, setStep] = useState<Step>(1)

  // 选择的 accept
  const [selectedAccept, setSelectedAccept] = useState<X402Accept | null>(null)
  // 支付凭证（X-PAYMENT header）
  const [xPaymentHeader, setXPaymentHeader] = useState<string>("")
  // 用于最终请求的 URL（优先 accept.resource，否则 item.resource）
  const resourceUrl = selectedAccept?.resource || item.resource || "-"

  // 首次请求的 init（由 accept.outputSchema.input.method 推断）
  const [baseInit, setBaseInit] = useState<RequestInit>({ method: "GET" })

  // 最终响应数据
  const [finalText, setFinalText] = useState<string>("")
  const [decodedPaymentResp, setDecodedPaymentResp] = useState<any>(null)

  // 复制 resourceUrl 状态
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(resourceUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 1000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // 组件挂载时尝试恢复状态
  useEffect(() => {
    const restoreState = async () => {
      const savedState = await getPendingTransaction()

      if (savedState && savedState.item?.resource === item?.resource) {
        console.log("[X402Popup] Restoring saved state:", savedState)

        // 恢复状态
        setStep(savedState.step)

        if (savedState.accept) {
          setSelectedAccept(savedState.accept)
        }

        if (savedState.init) {
          setBaseInit(savedState.init)
        }

        if (savedState.xPaymentHeader) {
          setXPaymentHeader(savedState.xPaymentHeader)
        }

        if (savedState.response) {
          setFinalText(JSON.stringify(savedState.response.body, null, 2))
          // 如果有 decoded 信息也恢复
        }
      }
    }

    restoreState()
  }, [item])

  const renderStepIndicator = () => {
    const steps = [
      { n: 1, label: "Payment" },
      { n: 2, label: "Request" },
      { n: 3, label: "Response" }
    ] as const
    return (
      <div className={cn("flex items-center px-3 pb-1 text-sm text-textColor3", step === 2 && 'border-b border-borderColor')}>
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
      <DrawerContent className="max-h-[480px] flex flex-col">
        <DrawerHeader className="flex justify-between border-borderColor items-start flex-shrink-0">
          <MessageTooltip content={copiedUrl ? 'Copied' : 'Copy'}>
            <DrawerTitle
              className="break-all pr-8 text-left font-normal text-sm cursor-pointer hover:underline"
              onClick={handleCopyUrl}
            >
              {resourceUrl}
            </DrawerTitle>
          </MessageTooltip>
          <DrawerClose className="p-1 hover:bg-gray-100 rounded transition-colors">
            <img src={CloseIcon} alt="close" className="min-w-6 h-6" />
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-shrink-0">
          {renderStepIndicator()}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-h-0 pb-3 pt-1 flex flex-col">
          {step === 1 && (
            <Step1
              item={item}
              mode={mode}
              onSelected={async (acc, init, header) => {
                setSelectedAccept(acc)
                setBaseInit(init)
                setXPaymentHeader(header)
                setStep(2)

                // 保存状态（签名后的状态）
                const validBefore = parseValidBeforeFromHeader(header)
                await savePendingTransaction({
                  item,
                  selectedAcceptIndex: item.accepts?.indexOf(acc) ?? 0,
                  step: 2,
                  accept: acc,
                  init,
                  xPaymentHeader: header,
                  validBefore: validBefore ?? undefined, // 从凭证中解析有效期
                  timestamp: Date.now()
                })
              }}
            />
          )}

          {step === 2 && (
            <Step2
              resourceUrl={resourceUrl}
              baseInit={baseInit}
              xPaymentHeader={xPaymentHeader}
              selectedAccept={selectedAccept}
              onCompleted={async (payload) => {
                setFinalText(payload.text)
                setDecodedPaymentResp(payload.decoded)
                setStep(3)

                // 清除保存的状态（交易完成）
                await clearPendingTransaction()
              }}
            />
          )}

          {step === 3 && (
            <div className="h-full overflow-auto scrollbar-hide">
              <Step3
                finalText={finalText}
                decodedPaymentResp={decodedPaymentResp}
              />
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default X402Popup
