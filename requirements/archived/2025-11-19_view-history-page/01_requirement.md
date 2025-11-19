# Requirement: ViewHistory Page

Implement a history page (`ViewHistory`) that displays all past x402 requests stored in browser storage. Each list item should be rendered by a `PastX402Request` component.

## Functional Requirements

1. List both:
   - Completed requests (successful or failed).
   - Pending requests that have generated a payment header but not yet executed.

2. Item behavior:
   - Clicking a completed request opens `DrawerX402Request` in the **Response** (step 3) view, showing the response data.
   - Clicking a pending request opens `DrawerX402Request` in the **Request** (step 2) view, allowing the user to execute the request.
   - A request that generated a payment header but whose execution failed is treated as **completed** (failure) and opens in the Response view.

3. Data extraction from the Base64-encoded payment header:
   - `network` and `amount` (from `payload.authorization.value`).
   - `from` address (from `payload.authorization.from`).
   - `validAfter` and `validBefore` timestamps.

## UI Requirements

For each `PastX402Request` item, display:
- **Status**: Completed (Success/Failure) or Pending.
- **URL** (truncate if necessary).
- **Timestamp** of header generation or request completion.
- **Network** and **Amount**.
- **From Address**.
- If **pending**:
  - Disable the “Request” action if current time > `validBefore`.
  - Show a notice if current time < `validAfter` indicating when the request becomes available.

```json
// Example decoded header
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "base",
  "payload": {
    "authorization": {
      "from": "0x0014eb4ac6dd1473b258d088e6ef214b2bcdc53c",
      "to": "0x07737A1fB3863202bcd3c7408b801EEd68604D39",
      "value": "1000",
      "validAfter": "1763548445",
      "validBefore": "1763549105",
      "nonce": "0x03d2cf087ffd183138327b93baceffc2c8f0eb27384615eedf7e118abaa13a72"
    }
  }
}
```

## Tips for Tech Design

Storage key for past x402 requests should be `x402-history`.

Need to implement storage methods such as

- `loadX402History()`
- `saveX402Request(x402Req)`
- `updateX402Request(...)`

The `x402Req` could use the same type `X402TransactionState`. You can modify type `X402TransactionState` if needed.

Make sure you to call storage methods when payment header is generated as well as receiving a response.
