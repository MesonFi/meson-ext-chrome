# Technical Design

## Background
The extension uses a React context (`WalletContext`) to manage wallet connection state. It connects via the injected `window.ethereum` provider and stores the connected address in Chrome local storage (`app_state`). However, it does not react to subsequent account switches in the wallet plugin, causing the UI to display a stale address.

## Proposed Solution
To ensure the extension automatically reflects wallet account changes, we will implement:

1. **Account change detection**  
   In the in-page script (`wallet-transport/inpage-script.ts`), subscribe to `ethereum.on('accountsChanged')` and forward the new accounts to the content script.

2. **Forwarding to extension**  
   In the content script (`wallet-transport/content-script.ts`), listen for the forwarded message and relay it to the extension pages (popup/sidepanel) using `chrome.runtime.sendMessage`.

3. **React state update**  
   In `WalletContext` (`src/app/contexts/WalletContext.tsx`), add a `chrome.runtime.onMessage` listener for `MM_ACCOUNTS_CHANGED`. Upon receiving, extract the new address, update Chrome storage (`app_state`) via `saveState`, and call `setAddress` to refresh the UI.

4. **UI refresh via storage listener**  
   The existing storage watcher (`watchState`) will detect the updated `app_state` and propagate the new address throughout the UI.

## Detailed Implementation Steps

### 1. In-page Script
Add to **wallet-transport/inpage-script.ts**:
```ts
if (window.ethereum && !window.ethereum._forwardAccounts) {
  window.ethereum._forwardAccounts = true;
  window.ethereum.on('accountsChanged', (accounts) => {
    window.postMessage({
      target: 'CONTENT',
      payload: { type: 'ACCOUNTS_CHANGED', accounts }
    }, '*');
  });
}
```

### 2. Content Script
In **wallet-transport/content-script.ts**, extend the message handler:
```ts
window.addEventListener('message', (evt) => {
  // existing checks...
  const data = evt.data;
  if (data?.payload?.type === 'ACCOUNTS_CHANGED') {
    chrome.runtime.sendMessage({
      type: 'MM_ACCOUNTS_CHANGED',
      accounts: data.payload.accounts
    });
    return;
  }
  // rest of handler...
});
```

### 3. WalletContext Listener
In **src/app/contexts/WalletContext.tsx**, within the existing `useEffect`, add:
```ts
const handleMsg = (message, _sender, sendResponse) => {
  if (message.type === 'MM_ACCOUNTS_CHANGED') {
    const newAddr = message.accounts?.[0] || '';
    saveState({ connected: !!newAddr, address: newAddr });
    setAddress(newAddr);
  }
};
chrome.runtime.onMessage.addListener(handleMsg);
return () => {
  chrome.runtime.onMessage.removeListener(handleMsg);
};
```

This design ensures that any wallet address switch in the MetaMask (or compatible) plugin is propagated through the in-page and content scripts into the extension’s React context, keeping the displayed address in sync.
