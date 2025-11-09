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
      className={`px-2 py-1 bg-card rounded-lg ${
        selected ? "outline outline-1 outline-textColor2" : ""
      }`}
    >
      {desc && <div className="text-xs break-words text-black mb-2">{desc}</div>}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="text-xs text-textColor4">Payment</div>
          <div className="truncate">
            <span className="inline-flex items-center h-5 px-2 rounded bg-slate-100 text-slate-800" title={network}>
              {network}
            </span>
            {amount6}
            {extraName && <span className="text-gray-500 ml-1">{extraName}</span>}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-xs text-textColor4 min-w-[104px]">Asset</div>
          <div className="text-xs text-textColor4 break-all hover:underline hover:text-textColor1" title={asset}>{asset}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-xs text-textColor4 min-w-[104px]">Pay to</div>
          <div className="text-xs text-textColor4 break-all hover:underline hover:text-textColor1">{payTo}</div>
        </div>
      </div>
    </div>
  )
}

export default X402AcceptOption
