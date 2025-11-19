import React, { useState, useRef } from "react"
import { decodeXPaymentResponseHeader } from "../lib"
import { Button } from "~/components/Button"
import DynamicForm, { type DynamicFormRef } from "./DynamicForm"
import type { X402Accept } from "../types"
import { SvgIcon } from "~/components/SvgIcon"
import CopyIconSrc from "@assets/icons/copy.svg"
import { MessageTooltip } from "~/components/MessageTooltip"

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
  const [copied, setCopied] = useState(false)
  const [headerFormat, setHeaderFormat] = useState<'base64' | 'json'>('base64')
  const formRef = useRef<DynamicFormRef>(null)

  const handleCopy = async () => {
    try {
      const textToCopy = headerFormat === 'json' ? paymentHeaderJson : xPaymentHeader
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const paymentHeaderJson = (() => {
    try {
      const decodeBase64Url = (str: string) => {
        // Base64URL to Base64
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
        // Add padding
        const pad = base64.length % 4
        if (pad) {
          base64 += '='.repeat(4 - pad)
        }
        return atob(base64)
      }

      // Try JWT format first: header.payload.signature
      const parts = xPaymentHeader.split('.')
      if (parts.length === 3) {
        try {
          const header = JSON.parse(decodeBase64Url(parts[0]))
          const payload = JSON.parse(decodeBase64Url(parts[1]))
          return JSON.stringify({ header, payload, signature: parts[2] }, null, 2)
        } catch (jwtError) {
          // Not a valid JWT, continue to try direct base64 decode
        }
      }

      // Try direct base64 decode
      const decoded = decodeBase64Url(xPaymentHeader)
      const parsed = JSON.parse(decoded)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return xPaymentHeader
    }
  })()

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
    <div className="flex flex-col h-full px-3 overflow-hidden">
      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        {err && <div className="text-xs text-error mb-3">错误：{err}</div>}

        {/* 动态表单 */}
        <DynamicForm ref={formRef} selectedAccept={selectedAccept} />

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <div className="text-color-strong text-sm">X-Payment Header</div>
              <MessageTooltip content={copied ? 'Copied' : 'Copy'}>
                <button
                  onClick={handleCopy}
                  className="flex items-center"
                >
                  <SvgIcon src={CopyIconSrc} className="w-4 h-4 text-secondary hover:text-primary-hover transition-colors" />
                </button>
              </MessageTooltip>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setHeaderFormat('json')}
                className={`text-xs ${
                  headerFormat === 'json'
                    ? 'text-color-strong'
                    : 'text-color-muted hover:text-color-strong'
                }`}
              >
                JSON
              </button>
              <div className="h-3 w-[1px] bg-border mx-2"></div>
              <button
                onClick={() => setHeaderFormat('base64')}
                className={`text-xs ${
                  headerFormat === 'base64'
                    ? 'text-color-strong'
                    : 'text-color-muted hover:text-color-strong'
                }`}
              >
                BASE64
              </button>
            </div>
          </div>
          <div className="text-xs bg-surface p-2 rounded-lg whitespace-pre-wrap break-words max-h-[172px] overflow-y-scroll scrollbar-hide mb-3">
            {headerFormat === 'json' ? paymentHeaderJson : xPaymentHeader}
          </div>
        </div>
      </div>

      {/* 固定底部按钮 */}
      <div className="pt-4 border-t flex-shrink-0">
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
