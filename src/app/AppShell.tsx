// src/app/AppShell.tsx
import React, { useEffect } from "react"
import { AppProvider, useDrawer } from "./contexts/AppProvider"
import AppShellContent from "./AppShellContent"
import {
  getPendingTransaction
} from "~/lib/storage/x402_pending_transaction"
import DrawerX402Request, { DrawerTitleX402Request } from "./drawers/DrawerX402Request"

type Mode = "popup" | "sidepanel"

const AppShell: React.FC<{ mode: Mode }> = ({ mode }) => (
  <AppProvider>
    <AppRootInner mode={mode} />
  </AppProvider>
)

const AppRootInner: React.FC<{ mode: Mode }> = ({ mode }) => {
  const { openDrawer } = useDrawer()

  useEffect(() => {
    ;(async () => {
      const state = await getPendingTransaction()
      if (state && state.item) {
        openDrawer(
          <DrawerX402Request
            item={state.item}
            mode={mode}
            initialState={{
              step: state.step,
              accept: state.accept,
              xPaymentHeader: state.xPaymentHeader,
              init: state.init,
              finalText: state.response ? JSON.stringify(state.response.body, null, 2) : undefined
            }}
          />,
          <DrawerTitleX402Request>{state.item.resource}</DrawerTitleX402Request>
        )
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AppShellContent mode={mode} />
}

export default AppShell
