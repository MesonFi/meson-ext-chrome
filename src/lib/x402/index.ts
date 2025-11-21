// src/app/views/x402/lib.ts
// x402 支付流程：1) 获取并解析 Payment Requirements 2) 生成支付头(签名) 3) 携带支付头重试

import {
  PaymentRequirementsSchema,
  type X402Config
} from "x402/types"

import {
  createPaymentHeader,
  selectPaymentRequirements,
  type PaymentRequirementsSelector
} from "x402/client"

import { decodeXPaymentResponse } from "x402/shared"
import type { Hex } from "../signer"
import type { WalletType } from "~/lib/storage/app_state"

/**
 * 根据网络名称推导所需的钱包类型
 * @param network - 网络名称（如 "solana", "base"）
 * @returns "phantom" | "metamask"
 */
export function getWalletTypeByNetwork(network: string | undefined): WalletType {
  if (!network) return "metamask" // 默认 MetaMask
  const normalized = network.toLowerCase()
  if (normalized.startsWith("solana")) return "phantom"
  return "metamask" // EVM 默认
}

const NETWORK_TO_CHAIN_ID: Record<string, Hex> = {
  "base": "0x2105",           // 8453
  "base-sepolia": "0x14a34"   // 84532
}

const EVM_NETWORKS = ["base", "base-sepolia"]
const SOLANA_NETWORKS = ["solana", "solana-devnet"]

function getChainId(network: string): Hex | null {
  return NETWORK_TO_CHAIN_ID[network.toLowerCase()] || null
}

function isEvmNetwork(network: string): boolean {
  return EVM_NETWORKS.includes(network.toLowerCase())
}

function isSolanaNetwork(network: string): boolean {
  return SOLANA_NETWORKS.includes(network.toLowerCase())
}

// ====== Step 1: 获取并解析 Payment Requirements ======

export type PaymentRequirementsParsed = ReturnType<typeof PaymentRequirementsSchema.parse>

export type PaymentDiscovery = {
  x402Version: number
  requirements: PaymentRequirementsParsed[]
  /** 原始 Response（可能是 402，也可能不是） */
  response: Response
  /** 方便调试：若为 JSON 则为对象，否则为 null；不会替你做任何协议层解析 */
  rawBody: any
}

/**
 * 对目标 URL 进行一次 fetch：
 * - 若返回 402，则用官方 PaymentRequirementsSchema 逐条 parse 出 requirements；
 * - 若非 402，返回空 requirements（交给上层决定后续 UI 流程）。
 */
export async function fetchPaymentRequirements(
  url: string,
  init?: RequestInit
): Promise<PaymentDiscovery> {
  const res = await fetch(url, init)

  let body: any = null
  try {
    // 不假设一定是 JSON，失败则保持 null
    body = await res.clone().json()
  } catch {
    body = null
  }

  if (res.status !== 402) {
    return {
      x402Version: 0,
      requirements: [],
      response: res,
      rawBody: body
    }
  }

  // 按你给的源码：{ x402Version, accepts }，并用官方 Schema 解析
  const { x402Version, accepts } = (body ?? {}) as {
    x402Version: number
    accepts: unknown[]
  }

  const parsed = Array.isArray(accepts)
    ? accepts.map((x) => PaymentRequirementsSchema.parse(x))
    : []

  return {
    x402Version: Number(x402Version) || 1,
    requirements: parsed,
    response: res,
    rawBody: body
  }
}

// ====== Step 2: 选择某个 requirement，并让钱包签名 → 生成支付头 ======

/** 按 x402-fetch 的同款网络推断逻辑，从钱包推断 Network（或多网络） */
export function inferNetworkFromWallet(
  wallet: any
): any {
  // 如果有 inferNetworkFromWallet 方法，直接调用
  if (wallet && typeof wallet.inferNetworkFromWallet === 'function') {
    return wallet.inferNetworkFromWallet()
  }

  // 尝试从 chainId 推断（MetaMask）
  if (wallet?.chain?.id) {
    const chainId = wallet.chain.id
    for (const [network, id] of Object.entries(NETWORK_TO_CHAIN_ID)) {
      if (id === chainId) {
        return network
      }
    }
  }

  // 默认返回支持的网络
  return undefined
}

/**
 * 用官方的 selectPaymentRequirements 从若干 requirements 中选出一个。
 * - 默认 scheme 为 "exact"（与 x402-fetch 源码一致）
 * - 也可以传入自定义 selector 覆盖选择逻辑
 */
export function pickPaymentRequirement(
  requirements: PaymentRequirementsParsed[],
  wallet: any,
  opts?: {
    scheme?: string
    selector?: PaymentRequirementsSelector
  }
): PaymentRequirementsParsed {
  const scheme = (opts?.scheme ?? "exact") as any
  const selector = opts?.selector ?? selectPaymentRequirements
  const network = inferNetworkFromWallet(wallet)

  // 直接用官方选择器
  return selector(requirements, network as any, scheme)
}

/**
 * 构建 EVM 网络支付头
 */
async function buildEvmPaymentHeader(
  wallet: any,
  network: string,
  x402Version: number,
  requirement: PaymentRequirementsParsed,
  config?: X402Config
): Promise<string> {
  console.log('[buildEvmPaymentHeader] Processing EVM network:', network)

  const chainId = getChainId(network)
  if (!chainId) {
    throw new Error(`Unsupported EVM network: ${network}`)
  }

  // 如果钱包有 switchChain 方法，先切换到目标链
  if (wallet && typeof wallet.switchChain === 'function') {
    try {
      console.log(`[buildEvmPaymentHeader] Switching to chain ${chainId}`)
      await wallet.switchChain(chainId)
    } catch (e: any) {
      console.error('[buildEvmPaymentHeader] Chain switch failed:', e)
      throw new Error(`Failed to switch to ${network}: ${e.message}`)
    }
  }

  // 生成 EVM 支付头
  const header = await createPaymentHeader(wallet, x402Version, requirement, config)
  console.log('[buildEvmPaymentHeader] Payment header created successfully')
  return header
}

/**
 * 构建 Solana 网络支付头
 */
async function buildSolanaPaymentHeader(
  wallet: any,
  network: string,
  x402Version: number,
  requirement: PaymentRequirementsParsed,
  config?: X402Config
): Promise<string> {
  console.log('[buildSolanaPaymentHeader] Processing Solana network:', network)

  // 生成支付头（x402 库会自动处理 Solana 交易构建和签名）
  const header = await createPaymentHeader(wallet, x402Version, requirement, {
    ...config,
    svmConfig: {
      // 可以配置自定义 RPC（如果公共 RPC 限流）
      rpcUrl: network === 'solana'
        ? "https://solemn-winter-road.solana-mainnet.quiknode.pro/46fa061ea3ca4552da78cde720d7d3e6ea1c6265"
        : "https://api.devnet.solana.com",
      ...config?.svmConfig
    }
  })

  console.log('[buildSolanaPaymentHeader] Payment header created successfully')
  return header
}

/**
 * 生成支付头（签名）- 同时支持 EVM 和 Solana 网络
 * - EVM 网络（base, base-sepolia）：切链 + 签名
 * - Solana 网络（solana, solana-devnet）：直接签名
 * - 返回 X-Payment Header 字符串
 */
export async function buildXPaymentHeader(params: {
  wallet: any
  x402Version: number
  requirement: PaymentRequirementsParsed
  config?: X402Config
}): Promise<string> {
  const { wallet, x402Version, requirement, config } = params
  const network = requirement.network as string

  console.log('[buildXPaymentHeader] Creating payment header:', {
    network,
    asset: requirement.asset,
    payTo: requirement.payTo,
    amount: requirement.maxAmountRequired,
    walletType: wallet?.constructor?.name
  })

  // 根据网络类型路由到对应的处理函数
  if (isEvmNetwork(network)) {
    return buildEvmPaymentHeader(wallet, network, x402Version, requirement, config)
  }

  if (isSolanaNetwork(network)) {
    return buildSolanaPaymentHeader(wallet, network, x402Version, requirement, config)
  }

  // 不支持的网络
  throw new Error(
    `Unsupported network: ${network}. Supported networks: ${[...EVM_NETWORKS, ...SOLANA_NETWORKS].join(', ')}`
  )
}

// ====== Step 3: 携带 X-PAYMENT 再次请求，读取成功响应 + 解析结算头 ======

/**
 * 携带 X-PAYMENT 头发起重试请求（保持最小变更，只设置必要头部）
 * - 同时设置 Access-Control-Expose-Headers 以便前端可读 x-payment-response
 */
export async function fetchWithXPayment(
  url: string,
  init: RequestInit | undefined,
  xPaymentHeader: string
): Promise<Response> {
  if (!init) {
    throw new Error("Missing fetch request configuration (init is required)")
  }

  const newInit: RequestInit & { __is402Retry?: boolean } = {
    ...init,
    headers: {
      ...(init.headers || {}),
      "X-Payment": xPaymentHeader,
      "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
    },
    __is402Retry: true // 与源码行为一致：避免重复付费
  }

  console.log(newInit)
  return fetch(url, newInit)
}

/** 解析成功响应的 x-payment-response 头（官方 decodeXPaymentResponse） */
export function decodeXPaymentResponseHeader(res: Response) {
  const raw = res.headers.get("x-payment-response")
  return raw ? decodeXPaymentResponse(raw) : null
}

/**
 * 从 X-Payment header 中解析 validBefore 时间
 * @param xPaymentHeader Base64 编码的 X-Payment header
 * @returns validBefore 秒级 Unix timestamp，如果不存在则返回 null
 */
export function parseValidBeforeFromHeader(xPaymentHeader: string): number | null {
  try {
    // X-Payment header 是 base64 编码的 JSON
    const decoded = atob(xPaymentHeader)
    const payload = JSON.parse(decoded)

    // validBefore 在 payload.payload.authorization.validBefore（秒级时间戳，字符串格式）
    const validBefore = payload?.payload?.authorization?.validBefore

    if (validBefore) {
      // 解析为数字（秒）
      return parseInt(validBefore, 10)
    }

    return null
  } catch (e) {
    console.error("Failed to parse validBefore from X-Payment header:", e)
    return null
  }
}
