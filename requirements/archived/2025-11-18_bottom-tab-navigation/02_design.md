# Technical Design: Bottom Tab Navigation

## 1. Overview
Enhance the existing popup/sidepanel UI with a persistent bottom tab bar containing three controls:
1. **List** – shows the current X402 list view (default on open).  
2. **Add** – centered “+” button that opens the X402 URL drawer (no page switch).  
3. **History** – navigates to an empty history page placeholder.

The header (wallet connect area) and the X402 URL drawer logic remain unchanged; only its trigger is moved into the new tab bar.

## 2. New Components

### 2.1 HistoryPage
- Path: `src/app/views/History.tsx`  
- A simple React component rendering an empty or “Coming soon” placeholder.

### 2.2 TabBar
- Path: `src/components/Navigation/TabBar.tsx`  
- A fixed bottom bar with three buttons:
  - **List**: triggers `setSelectedTab("list")`  
  - **Add**: calls `setDrawerOpen(true)`  
  - **History**: triggers `setSelectedTab("history")`
- Uses existing SVG icons (e.g. `assets/icons/...svg`) and tailwind classes for styling.

## 3. Modify AppShell

### 3.1 State Management
- Add React state:
  ```ts
  const [selectedTab, setSelectedTab] = useState<"list"|"history">("list")
  const [drawerOpen, setDrawerOpen] = useState(false)
  ```
- Remove internal trigger from `X402URL`; control its `open` via `drawerOpen` and `onOpenChange={setDrawerOpen}`.

### 3.2 Content Area
- Replace:
  ```tsx
  <div className="flex-1 overflow-y-auto scrollbar-hide">
    <Home mode={mode} />
  </div>
  ```
  with conditional rendering:
  ```tsx
  <div className="flex-1 overflow-y-auto scrollbar-hide pb-[safe-area-inset-bottom]">
    { selectedTab === "list" && <Home mode={mode}/> }
    { selectedTab === "history" && <HistoryPage/> }
  </div>
  ```

### 3.3 Layout
- Render `<X402URL open={drawerOpen} onOpenChange={setDrawerOpen} mode={mode}/>` immediately after content.
- Render `<TabBar selectedTab={selectedTab} onSelect={setSelectedTab} onAdd={() => setDrawerOpen(true)} />` fixed at bottom.

## 4. File Changes Summary
- **Add**: 
  - `src/app/views/History.tsx`  
  - `src/components/Navigation/TabBar.tsx`
- **Edit**: 
  - `src/app/AppShell.tsx` – import new components and implement state, conditional rendering.
  - `src/app/views/x402URL.tsx` – remove the standalone “Enter x402 URL” trigger button.

## 5. Styling & Accessibility
- Ensure the TabBar has sufficient bottom padding on content and does not overlap scrollable area.
- Use `aria-label` for each tab button.
- Provide visual “active” indicator for the selected tab.
