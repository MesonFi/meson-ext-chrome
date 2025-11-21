// src/lib/utils/address.ts
// Address formatting utilities

/**
 * Shorten an address for display
 * @param addr - Full address string
 * @param prefixLen - Number of characters to show at start (default: 6)
 * @param suffixLen - Number of characters to show at end (default: 4)
 * @returns Shortened address like "0x1234...5678"
 */
export function shortAddr(addr?: string, prefixLen = 6, suffixLen = 4): string {
  if (!addr) return ""
  if (addr.length <= prefixLen + suffixLen + 3) return addr
  return `${addr.slice(0, prefixLen)}...${addr.slice(-suffixLen)}`
}
