# Project Documentation

This document set describes the architecture, structure, and key components of the browser extension located under `src/`. It covers:

- [Overview](#overview)  
- [Directory Structure](directory-structure.md)  
- [Modules and Components](modules.md)  
- [Conventions & Extension Points](#conventions--extension-points)  

## Overview

The extension integrates with MetaMask (or compatible wallets) to support x402 payments:
- Discovers x402 resources (`ViewX402List`)  
- Fetches payment requirements (402 responses)  
- Builds and attaches payment headers via the `ExtensionSigner`  
- Retries requests with `X-Payment` headers and displays results  
- Provides both popup and sidepanel views  

## Conventions & Extension Points

- **Contexts & hooks**: `WalletContext` for wallet state and signer  
- **UI primitives**: re-usable Radix wrappers under `components/ui`  
- **Dynamic forms**: schema-driven form in `X402Popup/DynamicForm.tsx`  
- **Transaction state**: persists in Chrome storage via `transactionState.ts`  
- **Assets**: SVG icons loaded inline through `SvgIcon`  

## Import Path Configuration

We use absolute imports prefixed with `~/`, mapping to the project’s `src/` root.  

• In **tsconfig.json**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    }
  }
}
```  
• In **components.json**:
```json
"aliases": {
  "components": "~/components",
  "utils": "~/lib/utils"
}
```  

Usage examples:
```ts
import { Button } from "~/components/Button"
import { cn } from "~/lib/utils"
```

For more details, see the linked pages above.
