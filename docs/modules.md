# Modules & Components

This section highlights key files and their roles.

## lib  
- **signer.ts**: `ExtensionSigner` wraps MetaMask RPC (accounts, chain, sign, sendTransaction).  
- **transactionState.ts**: persists in-flight x402 transactions in Chrome storage.  
- **utils.ts**: helper (`cn` for class merging, `capitalize`).  

## wallet-transport
- **wallet-transport/index.ts**:: `sendToActiveTab` & `withTimeout` for messaging between popup and in-page.  

## contexts  
- **WalletContext.tsx**: exposes `connect`, `disconnect`, `address`, and `ExtensionSigner` via React context.

## views/x402  
- **X402URL.tsx**: URL input drawer to initiate x402 flows.  
- **X402Popup/**: 3-step flow components (Step1: select & sign, Step2: form & retry, Step3: display response).  
- **lib.ts**: core x402 helpers (fetchPaymentRequirements, buildXPaymentHeader, fetchWithXPayment).  
- **types.ts**: TypeScript definitions for x402 schema and API shapes.

## components/ui  
Reusable design primitives using Radix and Tailwind Variants:
- **Input, Button, Checkbox, Select, Drawer, Tooltip, HoverCard**  
- **Sonner Toaster** for notifications  
- **SvgIcon** for inline SVG support  

## Communication Flow  
1. **popup** → content script (`chrome.runtime.sendMessage`)  
2. **content** → in-page script (`window.postMessage`)  
3. **in-page** → window.ethereum → reply back along the chain  

This messaging powers wallet calls, signing, chain switching, and sending transactions.
