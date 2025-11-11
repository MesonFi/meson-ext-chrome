import React, { useState, useRef } from "react"
import { decodeXPaymentResponseHeader } from "../lib"
import { Button } from "~src/components/Button"
import DynamicForm, { type DynamicFormRef } from "./DynamicForm"
import type { X402Accept } from "../types"

type Props = {
  resourceUrl: string
  baseInit: RequestInit
  xPaymentHeader: string
  selectedAccept: X402Accept | null
  onCompleted: (payload: { text: string; decoded: any }) => void
}

const Step2: React.FC<Props> = ({
  resourceUrl,
  baseInit,
  xPaymentHeader,
  selectedAccept,
  onCompleted
}) => {
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string>("")
  const formRef = useRef<DynamicFormRef>(null)

  async function onSend() {
    setErr("")

    // 验证表单并获取数据
    const validation = formRef.current?.validate()
    if (!validation) {
      setErr("Form validation failed")
      return
    }

    if (!validation.valid) {
      setErr(validation.error || "Form validation failed")
      return
    }

    const bodyData = validation.data || {}

    try {
      setSending(true)

      // 构建请求配置，添加 body 数据
      const requestInit: RequestInit = {
        ...baseInit,
        headers: {
          ...(baseInit.headers || {}),
          "Content-Type": "application/json",
          "X-Payment": xPaymentHeader,
          "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE"
        }
      }

      // 如果有 bodyData，添加到请求 body
      if (Object.keys(bodyData).length > 0) {
        requestInit.body = JSON.stringify(bodyData)
      }

      const res = await fetch(resourceUrl, requestInit)
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

      {/* 动态表单 */}
      <DynamicForm ref={formRef} selectedAccept={selectedAccept} />

      <div className="">
        <div className="text-textColor1 text-sm mb-1">X-Payment Header</div>
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
