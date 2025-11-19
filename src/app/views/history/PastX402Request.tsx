import React from "react"
import type { X402TransactionState } from "~/lib/storage/x402_pending_transaction"

type Props = {
  entry: X402TransactionState
  onSelect: (entry: X402TransactionState) => void
}

const PastX402Request: React.FC<Props> = ({ entry, onSelect }) => {
  // Decode X-Payment header to extract authorization info
  let auth: any = {};
  if (entry.xPaymentHeader) {
    try {
      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        const pad = base64.length % 4;
        if (pad) base64 += "=".repeat(4 - pad);
        return atob(base64);
      };
      const parts = entry.xPaymentHeader.split(".");
      const payloadStr =
        parts.length === 3
          ? decodeBase64Url(parts[1])
          : atob(entry.xPaymentHeader);
      const headerPayload = JSON.parse(payloadStr);
      auth = headerPayload.payload?.authorization || {};
      auth.network = headerPayload.network;
    } catch (e) {
      console.error("Failed to decode payment header:", e);
    }
  }

  const nowSec = Math.floor(Date.now() / 1000);
  let status = "";
  if (entry.step === 2) {
    const validAfter = Number(auth.validAfter) || 0;
    const validBefore = Number(auth.validBefore) || 0;
    if (nowSec < validAfter) status = "Waiting";
    else if (nowSec > validBefore) status = "Expired";
    else status = "Pending";
  } else {
    const code = entry.response?.status ?? 0;
    status = code >= 200 && code < 300 ? "Success" : "Failure";
  }

  const badgeClasses: Record<string, string> = {
    Pending: "bg-primary text-white",
    Waiting: "bg-warning text-black",
    Expired: "bg-error text-white",
    Success: "bg-success text-white",
    Failure: "bg-error text-white"
  };

  return (
    <div
      className="py-2 px-3 border-b cursor-pointer hover:bg-surface"
      onClick={() => onSelect(entry)}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium truncate">
          {entry.item?.resource || "-"}
        </span>
        <span className="text-xs text-color-muted">
          {new Date(entry.timestamp).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            badgeClasses[status] || ""
          }`}
        >
          {status}
        </span>
      </div>
      <div className="text-xs mb-1">
        <span className="font-semibold">Network:</span>{" "}
        {auth.network || "-"}{" "}
        <span className="font-semibold ml-2">Amount:</span>{" "}
        {auth.value ?? "-"}
      </div>
      <div className="text-xs mb-1">
        <span className="font-semibold">From:</span> {auth.from || "-"}
      </div>
      {entry.step === 2 && auth.validAfter && nowSec < Number(auth.validAfter) && (
        <div className="text-xs text-color-muted">
          Available after:{" "}
          {new Date(Number(auth.validAfter) * 1000).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default PastX402Request
