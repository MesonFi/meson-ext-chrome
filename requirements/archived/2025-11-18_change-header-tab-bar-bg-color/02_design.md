# Technical Design for Updating Header and TabBar Background Colors

## Objective
Change the background color of the extension’s header and bottom tab bar to align with the product’s current color theme.

## Affected Components
- **Header**: `src/app/Header.tsx`  
- **TabBar**: `src/components/Navigation/TabBar.tsx`  

## Proposed Changes

1. Tailwind Token Verification  
   - Ensure the desired theme color is available as a Tailwind utility (e.g. `secondaryBg` or add a new token in `tailwind.config.js`).

2. Update Header  
   - In `Header.tsx`, add the new background utility to the root `<div>`:
     - Before:  
       `cn("border-b border-borderColor flex items-center justify-between px-3", …)`  
     - After:  
       `cn("bg-secondaryBg border-b border-borderColor flex items-center justify-between px-3", …)`

3. Update TabBar  
   - In `TabBar.tsx`, replace `bg-background` on `<nav>` with the new utility:
     - Before:  
       `<nav className="fixed bottom-0 inset-x-0 bg-background border-t …">`  
     - After:  
       `<nav className="fixed bottom-0 inset-x-0 bg-secondaryBg border-t …">`

4. Validation  
   - Run `yarn build`, load the popup and sidepanel in Chrome, and verify that the header and tab bar use the new background color consistently.

## Rollback
If any visual regressions occur, revert to the previous utility classes (`bg-background`) in both components.
