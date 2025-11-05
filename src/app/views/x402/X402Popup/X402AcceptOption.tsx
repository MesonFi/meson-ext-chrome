import React from "react"

type Props = {
  accept: any
  selected?: boolean
  onSelect: () => void
}

function formatMaxAmount6(raw?: string) {
  if (!raw) return "-"
  try {
    const n = BigInt(raw)
    const intPart = n / 1000000n
    const fracPart = n % 1000000n
    if (fracPart === 0n) return intPart.toString()
    const frac = fracPart.toString().padStart(6, "0").replace(/0+$/, "")
    return `${intPart.toString()}.${frac}`
  } catch {
    return raw
  }
}

const X402AcceptOption: React.FC<Props> = ({ accept, selected, onSelect }) => {
  const desc = accept?.description || ""
  const network = accept?.network ?? "-"
  const asset = accept?.asset || "-"
  const extraName = accept?.extra?.name || ""
  const scheme = accept?.scheme
  const amount6 = formatMaxAmount6(accept?.maxAmountRequired)
  const payTo = accept?.payTo ?? "-"

  return (
    <div
      role="button"
      onClick={onSelect}
      className={`rounded border p-2 ${
        selected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-slate-50"
      }`}
    >
      {desc && <div className="text-sm font-medium break-words">{desc}</div>}

      <div className="mt-1 flex items-center justify-between text-[12px]">
        <span className="inline-flex items-center h-5 px-2 rounded bg-slate-100 text-slate-800" title={network}>
          {network}
        </span>
        {scheme && scheme !== "exact" && (
          <span className="text-[11px] text-gray-500">{scheme}</span>
        )}
      </div>

      {/* 金额 / 资产行 */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
        {/* 金额 1/3 */}
        <div className="col-span-1 min-w-0">
          <div className="text-[11px] text-gray-500">最大金额</div>
          <div className="truncate">
            {amount6}
            {extraName && <span className="text-gray-500 ml-1">{extraName}</span>}
          </div>
        </div>

        {/* 资产 2/3 */}
        <div className="col-span-2 min-w-0">
          <div className="text-[11px] text-gray-500">资产</div>
          <div className="truncate" title={asset}>{asset}</div>
        </div>
      </div>

      {/* 收款地址 */}
      <div className="mt-2">
        <div className="text-[11px] text-gray-500">收款地址</div>
        <div className="text-[12px] break-all">{payTo}</div>
      </div>
    </div>
  )
}

export default X402AcceptOption
