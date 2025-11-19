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
    <div className="p-4">
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
  )
}

export default ViewHistory
