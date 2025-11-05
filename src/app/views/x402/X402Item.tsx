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
  if (s < 60) return `${s}s 前`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}min 前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h 前`
  const dd = Math.floor(h / 24)
  if (dd < 7) return `${dd}d 前`
  return d.toLocaleString()
}

const X402Item: React.FC<Props> = ({ item, onClick, maxMonth = 0 }) => {
  const resource = stripScheme(item?.resource)
  const score = item?.metadata?.confidence?.overallScore
  const mth = monthTx(item?.metadata)
  const success = item?.metadata?.reliability?.apiSuccessRate
  const updated = item?.lastUpdated ? new Date(item.lastUpdated) : null

  return (
    <div className="py-3 cursor-pointer hover:bg-slate-50" onClick={onClick}>
      {/* 第一行：resource（过长省略） */}
      <div className="min-w-0">
        <div className="text-sm font-medium truncate" title={resource}>
          {resource}
        </div>
      </div>

      {/* 第二行：四项两行对齐（评分、月交易、成功率、更新时间），数值也放在“框里” */}
      <div className="mt-1 grid grid-cols-4 gap-3">
        {/* 评分 */}
        <div className="min-w-0">
          <div className="text-[11px] text-gray-500 leading-none mb-1">评分</div>
          <div
            className={`inline-flex items-center h-6 px-2 rounded ${scoreBadgeClass(score)}`}
            title={typeof score === "number" ? score.toFixed(2) : "-"}
          >
            <span className="text-xs font-semibold">
              {typeof score === "number" ? score.toFixed(2) : "-"}
            </span>
          </div>
        </div>

        {/* 月交易 */}
        <div className="min-w-0">
          <div className="text-[11px] text-gray-500 leading-none mb-1">月交易</div>
          <div
            className={`inline-flex items-center h-6 px-2 rounded ${monthBadgeClass(mth, maxMonth)}`}
            title={formatInt(mth)}
          >
            <span className="text-xs font-semibold">{formatInt(mth)}</span>
          </div>
        </div>

        {/* 成功率（放框里，保持一致风格） */}
        <div className="min-w-0">
          <div className="text-[11px] text-gray-500 leading-none mb-1">成功率</div>
          <div
            className="inline-flex items-center h-6 px-2 rounded bg-slate-100 text-slate-800"
            title={formatPercent(success, 0)}
          >
            <span className="text-xs font-semibold">{formatPercent(success, 0)}</span>
          </div>
        </div>

        {/* 更新时间（放框里 + 相对时间） */}
        <div className="min-w-0 text-right">
          <div className="text-[11px] text-gray-500 leading-none mb-1">更新时间</div>
          <div
            className="inline-flex items-center h-6 px-2 rounded bg-slate-100 text-slate-800 max-w-full"
            title={updated ? updated.toLocaleString() : "-"}
          >
            <span className="text-[11px] font-medium truncate">
              {formatRelativeFromDate(updated)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default X402Item
