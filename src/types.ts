export type Chain = "cedra-testnet" | "aptos-testnet" | "stellar-testnet";
export type SwapChain = "cedra" | "aptos" | "stellar";
export type SwapDirection = "x_to_y" | "y_to_x";
export type Period = "1h" | "24h" | "7d" | "30d";

export interface Pool {
  pool_id: string;
  chain_id: Chain;
  token_x: string;
  token_y: string;
  fee_bps: number;
  bin_step: number;
  active_bin?: ActiveBin;
  reserve_x: string;
  reserve_y: string;
  created_at: string;
}

export interface ActiveBin {
  bin_index: number;
  price: number;
  reserve_a: string;
  reserve_b: string;
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
  amount_in: number;
  amount_out: number;
  direction: SwapDirection;
  price_impact_bps: number;
}

export interface JunctaClientOptions {
  baseUrl?: string;
}

export interface PoolsParams {
  chainId?: Chain;
  page?: number;
  limit?: number;
}

export interface TokensParams {
  chainId?: Chain;
  page?: number;
  limit?: number;
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
