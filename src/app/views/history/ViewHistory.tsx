import React, { useEffect, useState } from "react"
import type { X402TransactionState } from "~/lib/storage/x402_pending_transaction"
import { loadX402History } from "~/lib/storage/x402_history"
import PastX402Request from "./PastX402Request"
import { useDrawer } from "~/app/contexts/AppProvider"
import DrawerX402Request, { DrawerTitleX402Request } from "~/app/views/x402/DrawerX402Request"

const ViewHistory: React.FC = () => {
  const [history, setHistory] = useState<X402TransactionState[]>([])
  const { openDrawer } = useDrawer()

  useEffect(() => {
    ;(async () => {
      const entries = await loadX402History()
      setHistory(entries)
    })()
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 pt-4 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium">X402 History Requests</h3>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {history.length === 0 ? (
          <div className="text-center text-color-muted">No history available</div>
        ) : (
          history.map((entry) => (
            <PastX402Request
              key={entry.timestamp}
              entry={entry}
              onSelect={(e) =>
                openDrawer(
                  <DrawerX402Request item={e.item} historyEntry={e} />,
                  <DrawerTitleX402Request>{e.item.resource}</DrawerTitleX402Request>
                )
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ViewHistory
