// x402 Discovery API 数据类型定义

/**
 * 输出 Schema 定义
 */
export interface X402OutputSchema {
  input?: {
    type?: string // "http"
    method?: string // HTTP 方法：GET, POST, etc.
    bodyType?: string // "json"
    bodyFields?: Record<string, {
      type?: string
      description?: string
      required?: boolean
      default?: any
    }>
    headerFields?: Record<string, {
      type?: string
      description?: string
      required?: boolean
    }>
  }
  output?: Record<string, string> // 输出字段类型映射
}

/**
 * 额外信息字段
 */
export interface X402Extra {
  name?: string // Token 名称，如 USDC
  symbol?: string
  decimals?: number
  [key: string]: any
}

/**
 * x402 Accept（支付选项）
 */
export interface X402Accept {
  // 基本信息
  description?: string
  network?: string // 网络：base, base-sepolia, etc.
  scheme?: string // 支付方案：exact, etc.
  mimeType?: string // MIME 类型：application/json, etc.

  // 资产和金额
  asset?: string // 资产合约地址
  maxAmountRequired?: number // 最大支付金额（字符串或数字）

  // 支付相关
  payTo?: string // 收款地址

  // 时间限制
  validBefore?: number // Unix 时间戳（秒）
  validAfter?: number // Unix 时间戳（秒）
  maxTimeoutSeconds?: number // 最大超时时间（秒）

  // 额外信息
  extra?: X402Extra

  // Schema 定义
  outputSchema?: X402OutputSchema

  // 资源 URL（可选，通常在 item 层级）
  resource?: string

  // 允许其他字段
  [key: string]: any
}

/**
 * x402 Item 元数据
 */
export interface X402ItemMetadata {
  // 置信度评分
  confidence?: {
    overallScore?: number // 总体评分 0-1
    performanceScore?: number // 性能评分 0-1
    reliabilityScore?: number // 可靠性评分 0-1
    recencyScore?: number // 新鲜度评分 0-1
    volumeScore?: number // 交易量评分 0-1
    dataQuality?: number
    communityTrust?: number
  }

  // 支付分析
  paymentAnalytics?: {
    transactionsMonth?: number // 月交易量
    totalTransactions?: number // 总交易量
    transactions24h?: number // 24小时交易量
    transactionsWeek?: number // 周交易量
    totalUniqueUsers?: number // 总唯一用户数
    averageDailyTransactions?: number // 日均交易量
    averageAmount?: number
    [key: string]: any // 支持动态的支付货币统计，如 "base:0x833589..."
  }

  // 可靠性指标
  reliability?: {
    apiSuccessRate?: number // API 成功率 0-1
    uptimePercentage?: number
    responseTime?: number
    successfulSettlements?: number // 成功结算数
    totalRequests?: number // 总请求数
  }

  // 性能指标
  performance?: {
    avgLatencyMs?: number // 平均延迟（毫秒）
    minLatencyMs?: number // 最小延迟（毫秒）
    maxLatencyMs?: number // 最大延迟（毫秒）
    recentAvgLatencyMs?: number // 最近平均延迟（毫秒）
  }

  // 错误分析
  errorAnalysis?: {
    requestErrors?: number // 请求错误数
    apiErrors?: number // API 错误数
    facilitatorErrors?: number // 促进者错误数
    delayedSettlements?: number // 延迟结算数
    abandonedFlows?: number // 放弃流程数
  }

  // 其他元数据
  [key: string]: any
}

/**
 * x402 Item（单个资源）
 */
export interface X402Item {
  // 必需字段
  resource: string // 资源 URL

  // 支付选项列表
  accepts?: X402Accept[]

  // 元数据
  metadata?: X402ItemMetadata

  // 时间戳
  lastUpdated?: string // ISO 8601 格式

  // x402 协议版本
  x402Version?: number

  // 其他字段
  [key: string]: any
}

/**
 * x402 Discovery API 响应
 */
export interface X402DiscoveryResponse {
  items?: X402Item[]
  // 可能还有其他顶层字段
  [key: string]: any
}
