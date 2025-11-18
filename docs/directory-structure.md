# Directory Structure

Below is the top-level `src/` layout:

src/  
├─ app/  
│  ├─ contexts/        # React contexts (WalletContext)  
│  ├─ views/           # Feature views (Home, X402, Options)  
│  ├─ AppShell.tsx     # Root shell for popup & sidepanel  
│  └─ Header.tsx       # Shared header with wallet connect  
├─ lib/                # Core logic (signer, transport, utils, storage)  
├─ components/          # Shared UI components  
│  ├─ ui/               # Design system primitives (Input, Button, Tooltip, Drawer, etc.)  
│  ├─ SvgIcon/          # Inline-SVG loader  
│  ├─ ConnectMetamask/  # Connect button and UI  
│  └─ Loading/          # Skeleton loaders  

├─ injected/            # In-page script for wallet bridging  
├─ contents/            # Content script for communication  
├─ background.ts        # Background script for tab tracking  
├─ popup.tsx            # Entry point for popup view  
└─ sidepanel.tsx        # Entry point for sidepanel view

Each folder groups by responsibility:
- **app/**: business logic + React views  
- **components/**: generic UI building blocks  
- **injected/contents/background**: extension platform glue  
