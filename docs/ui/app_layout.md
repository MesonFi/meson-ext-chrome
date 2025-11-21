# Application Layout

This document describes the top-level structure of the React application.

## AppRoot (root)
- Wraps the UI in `<AppProvider>` context.
- Runs a one-time check for pending transactions on startup.
- If a pending transaction exists, opens `DrawerX402Request` with the stored state via `initialState`.

## AppShellContent (UI)
- Defines the container for popup and sidepanel modes.
- Responsible solely for rendering UI elements inside the provider:
  1. `<Header>` (fixed at top).
  2. `<TabView>` (manages selected tab state and triggers drawers).
  3. `<DrawerPopup>` (renders controlled drawer content).
  4. `<Toaster>` (global notifications).

## AppProvider (context)
- Combines two contexts:
  - **WalletContext**: handles wallet connect/disconnect and signer logic.
  - **DrawerContext**: provides `openDrawer(content, title)` and `closeDrawer()` for bottom-sheet content.
- Supplies context values to the entire component tree.

## Header
- Displays wallet status and connect/disconnect controls.
- In popup mode, includes a sidebar toggle button.

## TabView
- Manages two tabs: `"list"` and `"history"`.
- Exposes an `onAdd` callback for opening the drawer.

## DrawerConnectWallet

- Renders a full-screen drawer for selecting and connecting wallets.
- Contains two buttons: Connect MetaMask and Connect Phantom.
- Close button in the top-right to dismiss.
- On successful connection via `useWallet().connect(type)`, automatically invokes `closeDrawer()`.
- Displays error messages on failure.

## DrawerPopup
- Wraps the Radix `<Drawer>` primitive.
- Listens to `DrawerContext` for `isOpen`, `content`, and `closeDrawer`.
- Renders `content` inside the drawer.

## DrawerX402Request Step1
- In the Payment step, the action button adapts based on the selected network:
  - If wallet not connected: shows generic 'Connect Wallet'.
  - If connected but network mismatch: shows 'Connect Phantom Wallet' or 'Connect MetaMask Wallet', and clicking switches the wallet and proceeds.
  - If connected and network matches: shows 'Confirm'.

## Toaster
- Renders global toast notifications using Sonner.
