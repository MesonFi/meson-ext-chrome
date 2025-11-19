# Project Documentation

This document set describes the browser extension under `src/`.

## Overview

The extension integrates with MetaMask (or compatible wallets) to support x402 payments:
- Discover x402 resources and present them in a list.
- Fetch payment requirements (HTTP 402 responses) and parse them.
- Generate and attach signed `X-Payment` headers.
- Retry requests with payment headers and display results.
- Provide both popup and sidepanel interfaces with a unified UI.

## Documentation Structure

- **UI** (`docs/ui`)
  - [Application Layout](ui/app_layout.md)
  - [UI Guide](ui/ui_guide.md)
- **Modules** (`docs/modules`)
  - [Modules Overview](modules/index.md)
  - [Storage](modules/storage.md)
  - [Wallet Transport](modules/wallet-transport.md)

## Source Directory Structure

src/  
├─ app/  
│  ├─ contexts/      AppProvider (wallet & drawer contexts)  
│  ├─ layout/        TabView, DrawerPopup  
│  ├─ views/         Feature pages and flows  
│  ├─ AppShell.tsx   Root component  
│  └─ Header.tsx     Header component  

## Import Path Configuration

Absolute imports use `~/` to reference the `src/` root:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "~/*": ["src/*"] }
  }
}
```
