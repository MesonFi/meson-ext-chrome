# Technical Design for `wallet-transport`

## 1. Overview
The `wallet-transport` module centralizes all inter-extension messaging and wallet‐injection logic. It provides a unified API for:
- Sending messages from popup/sidepanel to in-page script (`sendToActiveTab`)
- Adding request timeouts (`withTimeout`)
- Injecting and handling messages in page context (content and in-page scripts)

## 2. Folder Structure
Create a new directory:
```
src/wallet-transport/
├─ index.ts             # exports withTimeout, sendToActiveTab
├─ inpage-script.ts     # moved (and renamed) from injected/inpage.ts
└─ content-script.ts    # moved (and renamed) from contents/metamask-bridge.ts
```

Documentation:
```
docs/wallet-transport.md   # explains initialization order, APIs, and extension points
```

## 3. Implementation Steps
1. **Create folder** `src/wallet-transport/`.
2. **Move and rename files**:
   - `src/lib/transport.ts` → `src/wallet-transport/index.ts`
   - `src/injected/inpage.ts` → `src/wallet-transport/inpage-script.ts`
   - `src/contents/metamask-bridge.ts` → `src/wallet-transport/content-script.ts`
   - update import in side these files if necessary
3. **Update imports** across the codebase:
   - Replace `from "~/lib/transport"` (or relative paths) with `from "~/wallet-transport"`.
   - In `ExtensionSigner`, `useWallet`, and any other consumer, import from `"~/wallet-transport"`.
4. **Remove references to “metamask”** in file names and identifiers; the API remains generic.
5. **Add documentation** at `docs/wallet-transport.md` describing:
   - Load order: content-script → inpage-script → application.
   - Message flow and error handling.
   - Exported functions and their signatures.
6. **Verify**:
   - Run `yarn build`; test popup and sidepanel flows.
   - Ensure no other imports break.

## 4. Future Extension
- Add support for other wallets by extending message types in `inpage-script.ts`.
- Implement unit tests for `index.ts` APIs.
