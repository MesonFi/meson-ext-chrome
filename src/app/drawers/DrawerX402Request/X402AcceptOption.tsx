import React from "react"
import BaseIconSrc from "@assets/icons/base.svg"
import SvgIcon from "~/components/SvgIcon"
import { capitalize } from "~/lib/utils"
import type { X402Accept } from "~/lib/x402/types"

type Props = {
  accept: X402Accept
  selected?: boolean
  onSelect: () => void
}

function formatMaxAmount6(raw?: number) {
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
  const openUrl = (url: string) => {
    window.open(url)
  }

  const getDomainUrl = (networkId: string) => {
    if (networkId === 'base') {
      return 'https://basescan.org'
    }
    return 'https://sepolia.basescan.org'
  }
  return (
    <div
      role="button"
      onClick={onSelect}
      className={`px-2 py-1 bg-surface rounded-lg ${
        selected ? "border border-secondary" : ""
      }`}
    >
      {desc && <div className="text-xs break-words text-black mb-2">{desc}</div>}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="text-xs">Payment</div>
          <div className="flex items-center">
            <div className="inline-flex items-center h-5 pr-1 rounded bg-slate-100 text-color-strong gap-1" title={network}>
              {['base', 'base-sepolia'].includes(network) && <SvgIcon src={BaseIconSrc} />}{capitalize(network)}
            </div>
            <div className="w-[1px] h-3 bg-[#E4E3E3] mr-1"/>
            {amount6}
            {extraName && <span className="ml-1">{extraName}</span>}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-xs min-w-[104px]">Asset</div>
          <div
            className="text-xs break-all hover:underline hover:text-color-strong text-right"
            title={asset}
            onClick={() => openUrl(`${getDomainUrl(network)}/token/${asset}`)}
          >
            {asset}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-xs min-w-[104px]">Pay to</div>
          <div
            className="text-xs break-all hover:underline hover:text-color-strong text-right"
            onClick={() => openUrl(`${getDomainUrl(network)}/address/${payTo}`)}
          >{payTo}</div>
        </div>
      </div>
    </div>
  )
}

export default X402AcceptOption
