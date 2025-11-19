# Technical Design for Settings Dropdown on X402 List

## Overview  
Extend the **ViewX402List** component to support a settings menu with three controls:
- Service URL selection  
- Sort key selection  
- Network filter  

## File Changes

1. **src/app/views/x402/ViewX402List.tsx**  
   - Import and install `@radix-ui/react-dropdown-menu`.  
   - Add new React state and persistence layers for:  
     - `serviceUrl` (default BAZAAR_URL)  
     - `sortKey` (existing `"score"` | `"month"`)  
     - `networkFilter` (`"all"` or a specific network string)  
   - On mount, initialize these from `localStorage`.  
   - Watch for changes in any setting:  
     - When `serviceUrl` changes → call `load(true)` to refetch.  
     - When `sortKey` or `networkFilter` changes → update the displayed list (filter → sort).  
   - Modify `load()` to use `serviceUrl` instead of the hard‐coded constant.  
   - After fetching, extract unique networks from `items` to populate the filter options.  

2. **Dependencies**  
   - Add `@radix-ui/react-dropdown-menu` to `package.json`.  
   - Run `yarn` to install.

## UI Implementation

- Wrap a gear or settings icon button in `<DropdownMenu.Root>`.  
- Use `<DropdownMenu.Trigger asChild>` for the button.  
- In `<DropdownMenu.Content>`, render three labeled sections:  
  1. **Service URL**: a `<Select>` with options (default + any additional URLs).  
  2. **Sort By**: two `<RadioGroup>` items or a `<Select>` for Score / Monthly Tx.  
  3. **Network**: a `<Select>` with all + unique networks.  
- Style the menu to match existing UI using `cn(...)`.

## Persistence

- Key in `localStorage`: `x402_list_option`  
- On change, write the new value to `localStorage`.

## Data Flow

1. On component mount:
   - Read persisted settings.
   - Call `load(false)` with initial `serviceUrl`.
2. `load(forceRefresh: boolean)`:
   - Fetch from `serviceUrl`.
   - Filter items by `networkFilter`.
   - Sort by `sortKey`.
   - Update state and cache.
3. Settings changes trigger re‐execution of the above steps.
