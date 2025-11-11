import React, { useState, useMemo, forwardRef, useImperativeHandle } from "react"
import { Input } from "~src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~src/components/ui/select"
import type { X402Accept, X402FieldSchema } from "../types"

type Props = {
  selectedAccept: X402Accept | null
}

export type DynamicFormRef = {
  validate: () => { valid: boolean; data?: Record<string, any>; error?: string }
}

const DynamicForm = forwardRef<DynamicFormRef, Props>(({ selectedAccept }, ref) => {
  // 解析 bodyFields
  const bodyFields = useMemo(() => {
    const fields = selectedAccept?.outputSchema?.input?.bodyFields || {}
    return Object.entries(fields).map(([key, schema]) => ({
      key,
      schema: schema as X402FieldSchema
    }))
  }, [selectedAccept])

  // 初始化表单数据（使用默认值）
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    bodyFields.forEach(({ key, schema }) => {
      if (schema.default !== undefined) {
        initial[key] = schema.default
      } else if (schema.type === "boolean") {
        initial[key] = false
      } else if (schema.type === "number" || schema.type === "integer") {
        initial[key] = ""
      } else {
        initial[key] = ""
      }
    })
    return initial
  })

  // 更新表单字段
  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // 暴露验证方法给父组件
  useImperativeHandle(ref, () => ({
    validate: () => {
      // 验证必填字段
      for (const { key, schema } of bodyFields) {
        if (schema.required) {
          const value = formData[key]
          // 对于字符串类型，检查是否为空
          if (schema.type === "string" && (!value || value.trim() === "")) {
            return { valid: false, error: `Field "${key}" is required` }
          }
          // 对于数字类型，检查是否有值
          if ((schema.type === "number" || schema.type === "integer") && (value === "" || value === null || value === undefined)) {
            return { valid: false, error: `Field "${key}" is required` }
          }
        }
      }

      // 构建最终的 body 数据，进行类型转换
      const bodyData: Record<string, any> = {}
      for (const { key, schema } of bodyFields) {
        const value = formData[key]

        // 跳过空值的非必填字段
        if (!schema.required && (value === "" || value === null || value === undefined)) {
          continue
        }

        // 根据类型转换值
        if (schema.type === "integer") {
          bodyData[key] = parseInt(value, 10)
        } else if (schema.type === "number") {
          bodyData[key] = parseFloat(value)
        } else if (schema.type === "boolean") {
          bodyData[key] = Boolean(value)
        } else {
          bodyData[key] = value
        }
      }

      return { valid: true, data: bodyData }
    }
  }))

  if (bodyFields.length === 0) {
    return null
  }

  return (
    <div className="mb-4 space-y-3 hidden">
      <div className="text-textColor1 text-sm mb-2">Request Parameters</div>
      {bodyFields.map(({ key, schema }) => (
        <div key={key} className="space-y-1">
          <label className="text-xs text-textColor4 flex items-center gap-1">
            {key}
            {schema.required && <span className="text-error">*</span>}
            <span className="text-textColor3 ml-1">({schema.type || "string"})</span>
          </label>

          {/* 根据类型渲染不同的输入组件 */}
          {schema.type === "boolean" ? (
            <Select
              value={formData[key]?.toString() || "false"}
              onValueChange={(value) => handleInputChange(key, value === "true")}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">TRUE</SelectItem>
                <SelectItem value="false">FALSE</SelectItem>
              </SelectContent>
            </Select>
          ) : schema.type === "number" || schema.type === "integer" ? (
            <Input
              type="number"
              placeholder={schema.description || `Enter ${key}`}
              value={formData[key] ?? ""}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="text-xs"
              step={schema.type === "integer" ? "1" : "any"}
            />
          ) : (
            <Input
              type="text"
              placeholder={schema.description || `Enter ${key}`}
              value={formData[key] || ""}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="text-xs"
            />
          )}

          {schema.description && (
            <p className="text-xs text-textColor4">{schema.description}</p>
          )}
          {schema.default !== undefined && (
            <p className="text-xs text-textColor4">Default: {String(schema.default)}</p>
          )}
        </div>
      ))}
    </div>
  )
})

DynamicForm.displayName = "DynamicForm"

export default DynamicForm
