import React from "react"

type Props = {
  item: any
  onClick: () => void
  maxMonth?: number
}

function monthTx(meta?: any) {
  return (
    meta?.paymentAnalytics?.transactionsMonth ??
    meta?.paymentAnalytics?.totalTransactions ??
    0
  )
}
function formatInt(v?: number) {
  if (v == null || Number.isNaN(v)) return "-"
  return Math.trunc(v).toLocaleString()
}
function formatPercent(v?: number, digits = 0) {
  if (v == null || Number.isNaN(v)) return "-"
  return `${(v * 100).toFixed(digits)}%`
}
function stripScheme(u?: string) {
  if (!u) return "-"
  return u.replace(/^https?:\/\//i, "")
}
function scoreBadgeClass(score?: number) {
  if (typeof score !== "number") return "bg-slate-100 text-slate-700"
  if (score >= 0.90) return "bg-emerald-100 text-emerald-800"
  if (score >= 0.80) return "bg-lime-100 text-lime-800"
  if (score >= 0.65) return "bg-yellow-100 text-yellow-800"
  if (score >= 0.45) return "bg-orange-100 text-orange-800"
  return "bg-red-100 text-red-800"
}
function monthBadgeClass(v?: number, maxRef?: number) {
  if (typeof v !== "number" || !maxRef || maxRef <= 0) return "bg-slate-100 text-slate-700"
  const ratio = Math.min(Math.log1p(v) / Math.log1p(maxRef), 1)
  if (ratio >= 0.85) return "bg-indigo-100 text-indigo-800"
  if (ratio >= 0.60) return "bg-blue-100 text-blue-800"
  if (ratio >= 0.35) return "bg-sky-100 text-sky-800"
  if (ratio >= 0.15) return "bg-cyan-100 text-cyan-800"
  return "bg-slate-100 text-slate-700"
}
function formatRelativeFromDate(d?: Date | null) {
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

const X402Item: React.FC<Props> = ({ item, onClick, maxMonth = 0 }) => {
  const resource = stripScheme(item?.resource)
  const accpet = item?.accepts?.[0] || {}
  const score = item?.metadata?.confidence?.overallScore
  const mth = monthTx(item?.metadata)
  const success = item?.metadata?.reliability?.apiSuccessRate
  const updated = item?.lastUpdated ? new Date(item.lastUpdated) : null
  const desc = accpet.description || "-"
  const network = accpet.network
  const maxAmountRequired = Number(accpet.maxAmountRequired) / 1000000
  const tokenName = accpet.extra?.name

  return (
    <div className="py-3 cursor-pointer hover:bg-card px-3 flex flex-col gap-2" onClick={onClick}>
      <div className="flex gap-2 items-center justify-between">
        <div className="text-sm font-medium truncate" title={resource}>
          {resource}
        </div>
        <span className="text-xs truncate text-textColor3">
          {formatRelativeFromDate(updated)}
        </span>
      </div>

      <div className="flex gap-3">
        <div
          className={`inline-flex px-2 py-0.5 rounded flex-col items-start flex-shrink-0 pb-1 w-[60px] ${scoreBadgeClass(score)}`}
          title={typeof score === "number" ? score.toFixed(2) : "-"}
        >
          <span>Score</span>
          <span className="font-semibold text-xl">
            {typeof score === "number" ? score.toFixed(2) : "-"}
          </span>
        </div>
        <div className="text-xs text-textColor4 line-clamp-3" title={desc}>
          {desc}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col min-w-[60px]">
          <div className="text-xs text-textColor4">
            M. Tx
          </div>
          <div className="font-medium text-sm text-textColor1">{formatInt(mth)}</div>
        </div>
        <div className="flex flex-col w-full">
          <div className="text-xs text-textColor4">
            Payment
          </div>
          <div className="font-medium text-sm text-textColor1">
            {network} {maxAmountRequired} <span className="text-textColor4">{tokenName}</span>
          </div>
        </div>
        <div className="flex flex-col min-w-[70px]">
          <div className="text-xs text-textColor4">
            Succ. Rate
          </div>
          <div className="font-medium text-sm text-textColor1 text-right">{formatPercent(success, 0)}</div>
        </div>
      </div>
    </div>
  )
}

export default X402Item
