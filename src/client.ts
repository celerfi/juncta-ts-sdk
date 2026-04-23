import type {
  AnalyticsParams,
  FeesParams,
  FeesResponse,
  Pool,
  PoolsParams,
  PoolsResponse,
  QuoteResponse,
  SummaryResponse,
  SwapQuoteParams,
  Token,
  TokensParams,
  TokensResponse,
  VolumeParams,
  VolumeRow,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.juncta.xyz/v1";

export class JunctaClient {
  private readonly baseUrl: string;

  constructor(options: { baseUrl?: string } = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  // ── Pools ────────────────────────────────────────────────────────────────

  async getPools(params: PoolsParams = {}): Promise<PoolsResponse> {
    const q = this.buildQuery({
      chain_id: params.chainId,
      page: params.page?.toString(),
      limit: params.limit?.toString(),
    });
    return this.get<PoolsResponse>(`/pools${q}`);
  }

  async getPool(poolId: string): Promise<Pool> {
    return this.get<Pool>(`/pools/${encodeURIComponent(poolId)}`);
  }

  // ── Tokens ───────────────────────────────────────────────────────────────

  async getTokens(params: TokensParams = {}): Promise<TokensResponse> {
    const q = this.buildQuery({
      chain_id: params.chainId,
      page: params.page?.toString(),
      limit: params.limit?.toString(),
    });
    return this.get<TokensResponse>(`/tokens${q}`);
  }

  async getToken(chainId: string, contractId: string): Promise<Token> {
    return this.get<Token>(
      `/tokens/${encodeURIComponent(chainId)}/${encodeURIComponent(contractId)}`
    );
  }

  // ── Analytics ────────────────────────────────────────────────────────────

  async getAnalyticsSummary(params: AnalyticsParams = {}): Promise<SummaryResponse> {
    const q = this.buildQuery({ chain_id: params.chainId });
    return this.get<SummaryResponse>(`/analytics/summary${q}`);
  }

  async getAnalyticsVolume(params: VolumeParams = {}): Promise<VolumeRow[]> {
    const q = this.buildQuery({
      chain_id: params.chainId,
      pool_id: params.poolId,
      period: params.period,
    });
    return this.get<VolumeRow[]>(`/analytics/volume${q}`);
  }

  async getAnalyticsFees(params: FeesParams = {}): Promise<FeesResponse> {
    const q = this.buildQuery({
      chain_id: params.chainId,
      period: params.period,
    });
    return this.get<FeesResponse>(`/analytics/fees${q}`);
  }

  // ── Swap Quote ───────────────────────────────────────────────────────────

  async getSwapQuote(params: SwapQuoteParams): Promise<QuoteResponse> {
    const q = this.buildQuery({
      chain: params.chain,
      pool: params.pool,
      amount_in: params.amountIn,
      direction: params.direction,
      sender: params.sender,
    });
    return this.get<QuoteResponse>(`/tx/swap/quote${q}`);
  }

  // ── HTTP ─────────────────────────────────────────────────────────────────

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new JunctaAPIError(res.status, body);
    }

    return res.json() as Promise<T>;
  }

  private buildQuery(params: Record<string, string | undefined>): string {
    const entries = Object.entries(params).filter(
      (e): e is [string, string] => e[1] !== undefined && e[1] !== ""
    );
    if (entries.length === 0) return "";
    return "?" + new URLSearchParams(entries).toString();
  }
}

export class JunctaAPIError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`Juncta API error ${status}: ${body}`);
    this.name = "JunctaAPIError";
  }
}
