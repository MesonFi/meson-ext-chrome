# Wallet Transport Module

## Overview
The `wallet-transport` module centralizes messaging between extension contexts and handles wallet injection logic. It provides:
- `sendToActiveTab`: forward messages to the active browser tab content.
- `withTimeout`: add timeouts to asynchronous calls.

## Folder Structure
```
src/wallet-transport/
├─ index.ts             # exports withTimeout, sendToActiveTab
├─ inpage-script.ts     # in-page script injected into page context
└─ content-script.ts    # content script to bridge messages between popup and in-page
```

## Usage
Import the APIs:
```ts
import { sendToActiveTab, withTimeout } from "~/wallet-transport"
```

## Extension Points
- Extend in `inpage-script.ts` to support additional wallet RPC methods.
- Modify message timeout in `index.ts` as needed.
