# Technical Design

This document describes the restructuring of the root-level UI and context logic, introducing a clear top-down component hierarchy and reducing redundancy in drawer usage.

## 1. Component Hierarchy

AppShell (root)  
├─ AppProvider (context)  
│  ├─ WalletContext (wallet connect/disconnect)  
│  └─ DrawerContext (open/close drawer)  
├─ Header (fixed at top)  
├─ TabView  
│  ├─ TabContent (renders current view)  
│  │  ├─ Home view (list of X402 items)  
│  │  └─ History view  
│  └─ TabBar (persistent bottom navigation)  
├─ DrawerPopup (bottom sheet wrapper)  
│  └─ dynamic content (e.g. DrawerX402Request, X402URL)  
└─ Toaster (global notifications)

## 2. AppProvider

- Rename existing `WalletProvider` to `AppProvider`.  
- Wrap both wallet logic and drawer logic:  
  - Provide `openDrawer(ReactNode)` and `closeDrawer()` via `DrawerContext`.  
  - Internal state: `{ isOpen: boolean, content: ReactNode }`.  

## 3. TabView

- New component that manages selected tab state.  
- Encapsulates rendering of `TabContent` and `TabBar`.  
- Exposes `onSelectTab` callback and `selectedTab` state.  

## 4. DrawerPopup

- Single wrapper around Radix `DrawerPrimitive.Root`.  
- Controlled by `DrawerContext`.  
- Renders `content` from context inside its `DrawerContent`.  
- All existing drawer implementations in `DrawerX402Request` and `X402URL` will remove their own `<Drawer>` and instead call `openDrawer(<DrawerX402Request …/>)` or `openDrawer(<X402URL …/>)`.

## 5. Refactoring Steps

1. **Rename** `WalletProvider.tsx` → `AppProvider.tsx`.  
2. **Create** `DrawerContext` in `AppProvider.tsx` alongside wallet context.  
3. **Implement** `TabView.tsx` under `src/app/layout/`.  
4. **Create** `DrawerPopup.tsx` under `src/app/layout/`.  
5. **Update** `AppShell.tsx` to:  
   - Wrap children in `AppProvider`.  
   - Replace manual drawer logic with `<DrawerPopup />`.  
   - Replace manual tab state with `<TabView>` wrapper.  
6. **Refactor** `DrawerX402Request` and `X402URL`:  
   - Remove their internal `<Drawer>`.  
   - Export functions that call `openDrawer(...)` with their content.  
7. **Update** imports and tests accordingly.

## 6. Dependencies & Migrations

- No new dependencies.  
- Ensure TypeScript types for `DrawerContext`.  
- Update all references from `WalletProvider` to `AppProvider`.  
- Run `yarn build` and verify functionality.
