// src/app/views/x402/lib.ts
// Solana x402 支付流程：1) 获取并解析 Payment Requirements 2) 生成支付头(签名) 3) 携带支付头重试

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
  wallet: Signer | MultiNetworkSigner
): Network | Network[] | undefined {
  if (isMultiNetworkSigner(wallet)) {
    return undefined
  }
  if (evm.isSignerWallet(wallet as any)) {
    const chainId = (wallet as any)?.chain?.id
    return ChainIdToNetwork[chainId as keyof typeof ChainIdToNetwork]
  }
  if (isSvmSignerWallet(wallet)) {
    // 与 x402-fetch 源码一致：SVM 钱包默认支持这两个
    return ["solana", "solana-devnet"] as Network[]
  }
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
 * 生成 Solana 支付头（签名）
 * - 不需要切链逻辑，Solana 通过 RPC endpoint 区分网络
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

  // 验证是否为支持的 Solana 网络
  if (!['solana', 'solana-devnet'].includes(network)) {
    throw new Error(`Unsupported network: ${network}. Only 'solana' and 'solana-devnet' are supported.`)
  }

  console.log('[buildXPaymentHeader] Creating payment header for Solana:', {
    network,
    asset: requirement.asset,
    payTo: requirement.payTo,
    amount: requirement.maxAmountRequired
  })

  // 生成支付头（x402 库会自动处理 Solana 交易构建和签名）
  const header = await createPaymentHeader(wallet, x402Version, requirement, {
    ...config,
    svmConfig: {
      // 可以配置自定义 RPC（如果公共 RPC 限流）
      // rpcUrl: "https://api.mainnet-beta.solana.com",  // mainnet
      // rpcUrl: "https://api.devnet.solana.com",         // devnet
      ...config?.svmConfig
    }
  })

  console.log('[buildXPaymentHeader] Payment header created successfully')
  return header
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
