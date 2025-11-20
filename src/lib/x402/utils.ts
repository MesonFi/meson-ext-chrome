import type { X402ItemMetadata, X402Accept } from "./types"

/**
 * 获取月交易量
 */
export function monthTx(meta?: X402ItemMetadata): number {
  return (
    meta?.paymentAnalytics?.transactionsMonth ??
    meta?.paymentAnalytics?.totalTransactions ??
    0
  )
}

/**
 * 格式化整数
 */
export function formatInt(v?: number): string {
  if (v == null || Number.isNaN(v)) return "-"
  return Math.trunc(v).toLocaleString()
}

/**
 * 格式化百分比
 */
export function formatPercent(v?: number, digits = 0): string {
  if (v == null || Number.isNaN(v)) return "-"
  return `${(v * 100).toFixed(digits)}%`
}

/**
 * 去除 URL 协议前缀
 */
export function stripScheme(u?: string): string {
  if (!u) return "-"
  return u.replace(/^https?:\/\//i, "")
}

/**
 * 根据评分返回对应的徽章样式类名
 */
export function scoreBadgeClass(score?: number): string {
  if (typeof score !== "number") return "bg-slate-100 text-slate-700"
  if (score >= 0.90) return "bg-emerald-100 text-emerald-800"
  if (score >= 0.80) return "bg-lime-100 text-lime-800"
  if (score >= 0.65) return "bg-yellow-100 text-yellow-800"
  if (score >= 0.45) return "bg-orange-100 text-orange-800"
  return "bg-red-100 text-red-800"
}

/**
 * 根据月交易量返回对应的徽章样式类名（对数缩放）
 */
export function monthBadgeClass(v?: number, maxRef?: number): string {
  if (typeof v !== "number" || !maxRef || maxRef <= 0) return "bg-slate-100 text-slate-700"
  const ratio = Math.min(Math.log1p(v) / Math.log1p(maxRef), 1)
  if (ratio >= 0.85) return "bg-indigo-100 text-indigo-800"
  if (ratio >= 0.60) return "bg-blue-100 text-blue-800"
  if (ratio >= 0.35) return "bg-sky-100 text-sky-800"
  if (ratio >= 0.15) return "bg-cyan-100 text-cyan-800"
  return "bg-slate-100 text-slate-700"
}

/**
 * 格式化相对时间
 */
export function formatRelativeFromDate(d?: Date | null): string {
  if (!d) return "-"
  const diffMs = Date.now() - d.getTime()
  const s = Math.max(1, Math.floor(diffMs / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const dd = Math.floor(h / 24)
  if (dd < 7) return `${dd}d ago`
  return d.toLocaleString()
}

/**
 * 格式化支付金额
 * @param amountStr - 金额字符串（如 "10000"）
 * @param decimals - token 精度（如 USDC 为 6）
 * @returns 格式化后的金额（如 "0.01"）
 */
export function formatPaymentAmount(amountStr?: string | number, decimals?: number): string {
  if (!amountStr) return "-"

  const amount = typeof amountStr === "string" ? Number(amountStr) : amountStr
  if (Number.isNaN(amount)) return "-"

  // 默认使用 6 位精度（USDC/USDT 标准）
  const dec = decimals ?? 6
  const divisor = Math.pow(10, dec)
  const result = amount / divisor

  // 智能格式化：小数点后最多 6 位，去除尾部的 0
  return result.toFixed(6).replace(/\.?0+$/, "")
}

/**
 * 格式化延迟时间（毫秒）
 */
export function formatLatency(ms?: number): string {
  if (ms == null || Number.isNaN(ms)) return "-"
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * 获取 token 名称
 */
export function getTokenName(accept?: X402Accept): string {
  return accept?.extra?.name || accept?.extra?.symbol || "Token"
}

/**
 * 获取 token 精度
 */
export function getTokenDecimals(accept?: X402Accept): number {
  return accept?.extra?.decimals ?? 6 // 默认 6 位精度（USDC/USDT）
}
