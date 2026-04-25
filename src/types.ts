export type Chain = "cedra-testnet" | "aptos-testnet" | "stellar-testnet";
export type SwapChain = "cedra" | "aptos" | "stellar";
export type SwapDirection = "x_to_y" | "y_to_x";
export type Period = "1h" | "24h" | "7d" | "30d";
export type PoolType = "stable" | "standard" | "volatile";
export type LiquidityStrategy = "spot" | "curve" | "bid_ask" | "wide";

export interface ActiveBin {
  index: number;
  price: number;
  reserve_x: string;
  reserve_y: string;
}

export interface Pool {
  pool_id: string;
  chain_id: Chain;
  token_x: string;
  token_y: string;
  token_x_symbol: string;
  token_y_symbol: string;
  token_x_decimals: number;
  token_y_decimals: number;
  fee: number;
  bin_step: number;
  tvl_usd: number;
  volume_24h_usd: number;
  fees_24h_usd: number;
  apy: number;
  active_bin?: ActiveBin;
  updated_at: string;
}

export interface PoolBins {
  total: number;
  active_count: number;
  active_indexes: number[];
  lending_count: number;
  lending_indexes: number[];
  idle_count: number;
  idle_indexes: number[];
}

export interface APYBreakdown {
  fee_apy: number;
  lending_apy: number;
  total_apy: number;
}

export interface PoolDetail extends Pool {
  bins: PoolBins;
  apy_breakdown: APYBreakdown;
}

export interface PoolsResponse {
  pools: Pool[];
  total: number;
  page: number;
  limit: number;
}

export interface Token {
  chain_id: Chain;
  contract_id: string;
  token_type: string;
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  asset_code: string | null;
  asset_issuer: string | null;
}

export interface TokenRow extends Token {}

export interface TokensResponse {
  tokens: Token[];
  total: number;
  page: number;
  limit: number;
}

export interface LPPosition {
  chain_id: Chain;
  pool_id: string;
  net_shares: number;
  net_amount_x: number;
  net_amount_y: number;
}

export interface PositionsResponse {
  account: string;
  positions: LPPosition[];
  has_position: boolean;
}

export interface TokenPrice {
  chain_id: Chain;
  contract_id: string;
  symbol?: string;
  price_usd: number;
  updated_at: string;
}

export interface BinWeight {
  bin_index: number;
  weight: number;
  amount_x: number;
  amount_y: number;
}

export interface LiquidityPreviewResponse {
  strategy: LiquidityStrategy;
  center_bin: number;
  bin_range: [number, number];
  bin_count: number;
  bins: BinWeight[];
  total_amount_x: number;
  total_amount_y: number;
  estimated_apy: number;
}

export interface SummaryResponse {
  swaps_24h: number;
  volume_24h: number;
  fees_24h: number;
  active_borrows: number;
  positions_at_risk: number;
  liquidations_7d: number;
}

export interface VolumeRow {
  chain_id: Chain;
  pool_id: string;
  swap_count: number;
  total_volume: number;
  total_fees: number;
  avg_bins_crossed: number;
}

export interface FeesResponse {
  total_fees: number;
  swap_count: number;
  avg_fee_per_swap: number;
}

export interface QuoteResponse {
  chain: SwapChain;
  pool: string;
  amount_in: string;
  amount_out: string;
  fee: string;
  price: string;
  direction: SwapDirection;
}

export interface BuildResponse {
  chain: SwapChain;
  type: string;
  payload: unknown;
}

export interface SubmitTxResponse {
  hash: string;
}

export interface LendableToken {
  chain_id: Chain;
  contract_id: string;
  symbol: string;
  name: string;
  image_url: string;
  decimals: number | null;
  verified: boolean;
  market_id: string;
  store_address: string;
  total_supplied_raw: string;
  total_borrowed_raw: string;
  utilization: number;
  supply_apy: number | null;
  borrow_apy: number | null;
  collateral_factor: number | null;
  ltv: number | null;
  liquidation_threshold: number | null;
}

export interface LendableTokensResponse {
  tokens: LendableToken[];
  total: number;
}

export interface JunctaClientOptions {
  baseUrl?: string;
}

export interface PoolsParams {
  chainId?: Chain;
  page?: number;
  limit?: number;
}

export interface PositionsParams {
  chainId?: Chain;
  poolId?: string;
}

export interface TokensParams {
  chainId?: Chain;
  page?: number;
  limit?: number;
  stable?: boolean;
}

export interface LiquidityPreviewParams {
  chainId: Chain;
  poolId: string;
  strategy?: LiquidityStrategy;
  amountX?: number;
  amountY?: number;
  centerBin?: number;
  bidWeight?: number;
}

export interface AnalyticsParams {
  chainId?: Chain;
}

export interface VolumeParams extends AnalyticsParams {
  poolId?: string;
  period?: Period;
}

export interface FeesParams extends AnalyticsParams {
  period?: Period;
}

export interface SwapQuoteParams {
  chain: SwapChain;
  pool: string;
  amountIn: string;
  direction: SwapDirection;
  sender?: string;
}

export interface SwapBuildParams {
  chain: SwapChain;
  pool: string;
  amountIn: number;
  minOut: number;
  direction: SwapDirection;
  sender: string;
}

export interface AddLiquidityBuildParams {
  chain: SwapChain;
  pool: string;
  binId?: number;
  centerBin?: number;
  amountX: number;
  amountY: number;
  strategy?: LiquidityStrategy;
  bidWeight?: number;
  sender: string;
}

export interface RemoveLiquidityBuildParams {
  chain: SwapChain;
  pool: string;
  binId: number;
  shares: number;
  sender: string;
}

export interface CreatePoolBuildParams {
  chain: SwapChain;
  tokenX: string;
  tokenY: string;
  basePrice: number;
  poolType: PoolType;
  binStep: number;
  initialPrice: number;
  sender: string;
}

export interface LendDepositBuildParams {
  chain: SwapChain;
  storeAddr?: string;
  token?: string;
  amount: number;
  sender: string;
}

export interface LendWithdrawBuildParams {
  chain: SwapChain;
  storeAddr?: string;
  token?: string;
  shares: number;
  sender: string;
}

export interface BorrowLPBuildParams {
  chain: SwapChain;
  storeAddr?: string;
  lpStoreAddr?: string;
  oracleAddr?: string;
  token?: string;
  positionId?: number;
  poolId?: number;
  borrowAmount: number;
  sender: string;
}

export interface RepayBuildParams {
  chain: SwapChain;
  storeAddr?: string;
  token?: string;
  positionId?: number;
  amount: number;
  sender: string;
}

export interface AdaptiveRegisterParams {
  chain: SwapChain;
  pool: string;
  positionId: number;
  lowerBin: number;
  upperBin: number;
  sender: string;
}

export interface AdaptiveDeregisterParams {
  chain: SwapChain;
  positionId: number;
  sender: string;
}

export interface SubmitTxParams {
  chain: SwapChain;
  signedXdr: string;
}
