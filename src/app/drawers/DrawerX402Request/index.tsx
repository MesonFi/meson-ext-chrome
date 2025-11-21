import React, { useState } from "react"
import ArrowRightIcon from "@assets/icons/arrow-right.svg"
import { MessageTooltip } from "~/components/MessageTooltip"

import { cn } from "~/lib/utils"
import {
  savePendingTransaction,
  clearPendingTransaction,
  type X402TransactionState,
} from "~/lib/storage/x402_pending_transaction"
import { saveX402Request, updateX402Request } from "~/lib/storage/x402_history"
import { parseValidBeforeFromHeader } from "~/lib/x402"
import type { X402Item, X402Accept } from "~/lib/x402/types"

import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"

type Step = 1 | 2 | 3

export type DrawerX402RequestInitialState = {
  step?: Step
  accept?: X402Accept | null
  xPaymentHeader?: string
  init?: RequestInit
  finalText?: string
  decodedPaymentResp?: any
}

interface DrawerX402RequestProps {
  item: X402Item
  mode?: "popup" | "sidepanel"
  // For history entries (from ViewHistory)
  historyEntry?: X402TransactionState
  // For auto-restore (from AppShell)
  initialState?: DrawerX402RequestInitialState
}

const DrawerX402Request: React.FC<DrawerX402RequestProps> = ({
  item,
  mode = "popup",
  historyEntry,
  initialState
}) => {
  // Merge historyEntry and initialState (historyEntry takes priority)
  const init = historyEntry ?? initialState

  const [step, setStep] = useState<Step>(init?.step ?? 1)
  const [historyTimestamp, setHistoryTimestamp] = useState<number>(historyEntry?.timestamp ?? 0)
  const [selectedAccept, setSelectedAccept] = useState<X402Accept | null>(init?.accept ?? null)
  const [xPaymentHeader, setXPaymentHeader] = useState<string>(init?.xPaymentHeader ?? "")
  const [baseInit, setBaseInit] = useState<RequestInit>(init?.init ?? { method: "GET" })

  const [finalText, setFinalText] = useState<string>(() => {
    if (historyEntry?.response) {
      return JSON.stringify(historyEntry.response.body, null, 2)
    }
    return initialState?.finalText ?? ""
  })
  const [decodedPaymentResp, setDecodedPaymentResp] = useState<any>(initialState?.decodedPaymentResp ?? null)

  // 用于最终请求的 URL（优先 accept.resource，否则 item.resource）
  const resourceUrl = selectedAccept?.resource || item.resource || "-"

  const renderStepIndicator = () => {
    const steps = [
      { n: 1, label: "Payment" },
      { n: 2, label: "Request" },
      { n: 3, label: "Response" }
    ] as const
    return (
      <div className={cn("flex items-center px-3 pb-1 text-sm text-color-muted", step === 2 && 'border-b')}>
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <span className={step === s.n ? "text-color-strong font-medium" : ""}>
              {s.label}
            </span>
            {i < steps.length - 1 && <img src={ArrowRightIcon} alt="arrow" className="w-6 h-6" />}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex-shrink-0">
        {renderStepIndicator()}
      </div>

      <div className="flex-1 min-h-0 pb-3 pt-1 flex flex-col overflow-y-auto">
        {step === 1 && (
          <Step1
            item={item}
            mode={mode}
            onSelected={async (acc, init, header) => {
              setSelectedAccept(acc)
              setBaseInit(init)
              setXPaymentHeader(header)
              setStep(2)

              // 保存状态（签名后的状态）并写入历史记录
              const validBefore = parseValidBeforeFromHeader(header)
              const ts = Date.now()
              setHistoryTimestamp(ts)
              await savePendingTransaction({
                item,
                selectedAcceptIndex: item.accepts?.indexOf(acc) ?? 0,
                step: 2,
                accept: acc,
                init,
                xPaymentHeader: header,
                validBefore: validBefore ?? undefined,
                timestamp: ts
              })
              await saveX402Request({
                item,
                selectedAcceptIndex: item.accepts?.indexOf(acc) ?? 0,
                step: 2,
                accept: acc,
                init,
                xPaymentHeader: header,
                validBefore: validBefore ?? undefined,
                timestamp: ts
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

              // 更新历史记录状态为完成（仅当有 historyTimestamp 时）
              if (historyTimestamp) {
                await updateX402Request(historyTimestamp, { step: 3 })
              }
              // 清除保存的状态（交易完成）
              await clearPendingTransaction()
            }}
          />
        )}

        {step === 3 && (
          <div className="h-full overflow-auto">
            <Step3
              finalText={finalText}
              decodedPaymentResp={decodedPaymentResp}
            />
          </div>
        )}
      </div>
    </>
  )
}

export const DrawerTitleX402Request: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(String(children))
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 1000)
    } catch (e) {
      console.error("Failed to copy URL:", e)
    }
  }

  return (
    <div
      className="break-all pr-8 text-left font-normal text-sm cursor-pointer hover:underline"
      onClick={handleCopyUrl}
    >
      <MessageTooltip content={copiedUrl ? 'Copied' : 'Copy'}>
        {children}
      </MessageTooltip>
    </div>
  )
}

export default DrawerX402Request
