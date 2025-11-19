# Application Layout

This document describes the top-level structure of the React application.

## AppShell (root)
- Wraps the UI in `<AppProvider>` context.
- Defines the base container for popup and sidepanel modes.
- Renders in order:
  1. `<Header>` (fixed at top).
  2. `<TabView>` (manages selected tab state):
     - Renders current view via its render prop.
     - Renders `<TabBar>` for navigation.
  3. `<DrawerPopup>` (controlled by `DrawerContext` to display dynamic content).
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

## DrawerPopup
- Wraps the Radix `<Drawer>` primitive.
- Listens to `DrawerContext` for `isOpen`, `content`, and `closeDrawer`.
- Renders `content` inside the drawer.

## Toaster
- Renders global toast notifications using Sonner.
