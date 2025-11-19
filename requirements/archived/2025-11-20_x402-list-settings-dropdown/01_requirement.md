# Requirement

On the **X402 List** page (`ViewX402List`), add a **Settings** dropdown button in the top‐right corner of the header (replace the current Score | Monthly Tx toggle). Clicking this button opens a small popover menu containing:

1. **Discovery Service URL**  
   - A select control to choose the x402 discovery service endpoint.  
   - Initial options include only the default URL:  
     `https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources`
2. **Sort Option**  
   - Controls to select sorting by **Score** or **Monthly Tx** (same as the existing toggle).
3. **Network Filter**  
   - A select control to filter displayed items by network.  
   - Options: **All** (default) plus each unique `accept.network` value currently present in the list.

Behavior:

- Persist user selections (service URL, sort key, network filter) in `localStorage`.
- On **Service URL** change, refetch the list from the selected endpoint.
- On **Sort Option** or **Network Filter** change, update the displayed items accordingly (apply filter then sort).
