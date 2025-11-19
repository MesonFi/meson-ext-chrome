# Design: ViewHistory & PastX402Request

## 1. Data Model

- Reuse `X402TransactionState` (in `src/lib/storage/x402_pending_transaction.ts`):
  - Add optional fields:
    - `response?: { status: number; body: any }` (already present)
    - `error?: string` (failure reason)
  - Use `step` to distinguish:
    - `step === 1`: no need to display in history list (in fact this will not be stored in storage)
    - `step === 2`: header generated (pending)
    - `step === 3`: request sent (completed, success or failure)

- Storage key: `x402-history`
- Modify `X402TransactionState` if needed:
  ```ts
  type X402TransactionState = {
    // existing fields
    error?: string // new fields
  }
  ```

## 2. Storage API

Implement in `src/lib/storage/x402_history.ts`:

- `async function loadX402History(): Promise<X402TransactionState[]>`  
  - Read from Chrome local under key `x402-history` or return `[]`.
- `async function saveX402Request(entry: X402TransactionState): Promise<void>`  
  - Append or prepend entry to history array, trim to recent N if desired.
- `async function updateX402Request(timestamp: number, updates: Partial<X402TransactionState>): Promise<void>`  
  - Find entry by a unique `timestamp` (use this as the `id` because it will be unique), merge updates, save back.

Call these methods:
- After building payment header → `saveX402Request({ ...state, step: 1, timestamp })`.
- After request completes → `updateX402Request(timestamp, { response or error, step: 2 })`.

## 3. UI Components

### 3.1 PastX402Request

- New file: `src/app/views/history/PastX402Request.tsx`
- Props: 
  - `entry: X402TransactionState`
  - `onSelect: (entry) => void`
- Renders:
  - URL in title, with time at the right in the title line
  - Status badge: “Pending” / "Expired" / "Waiting" / “Success” / “Failure”
  - network, amount, from address
  - If pending and now < `validAfter`, show "Waiting" badge, and “Available after …”
  - If pending and now > `validBefore`, show "Expired" badge. Disable the Request button action in `DrawerX402Request/Step2`

### 3.2 ViewHistory

- In `src/app/views/history/ViewHistory.tsx`:
  - On mount, call `loadX402History()`, store in local state.
  - Render a list of `<PastX402Request>` items.
  - On item click:
    - If `step === 2`: open `DrawerX402Request` at step 2.
    - If `step === 3`: open at step 3.

## 4. Drawer Integration

- Modify `DrawerX402Request` to accept an initial `X402TransactionState`:
  - If passed, restore `step`, `selectedAccept`, `baseInit`, `xPaymentHeader`, and `response`.
- The existing restore logic already handles pending transactions; extend it to accept history entries.

## 5. Timeline

1. Create `x402_history.ts` storage module.
2. Hook storage calls in `DrawerX402Request` Steps.
3. Implement `PastX402Request` and update `ViewHistory`.
4. Test pending vs completed flows and drawer restoration.
