import type {
  AddLiquidityBuildParams,
  AnalyticsParams,
  BorrowLPBuildParams,
  BuildResponse,
  CreatePoolBuildParams,
  FeesParams,
  FeesResponse,
  JunctaClientOptions,
  LendDepositBuildParams,
  LendWithdrawBuildParams,
  Pool,
  PoolsParams,
  PoolsResponse,
  QuoteResponse,
  RemoveLiquidityBuildParams,
  RepayBuildParams,
  SummaryResponse,
  SubmitTxParams,
  SubmitTxResponse,
  SwapBuildParams,
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

  constructor(options: JunctaClientOptions = {}) {
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

  // ── Tx Build + Submit ────────────────────────────────────────────────────

  async buildSwapTx(params: SwapBuildParams): Promise<BuildResponse> {
    return this.post<BuildResponse>("/tx/swap/build", {
      chain: params.chain,
      pool: params.pool,
      amount_in: params.amountIn,
      min_out: params.minOut,
      direction: params.direction,
      sender: params.sender,
    });
  }

  async buildAddLiquidityTx(params: AddLiquidityBuildParams): Promise<BuildResponse> {
    return this.post<BuildResponse>("/tx/liquidity/add/build", {
      chain: params.chain,
      pool: params.pool,
      bin_id: params.binId,
      amount_x: params.amountX,
      amount_y: params.amountY,
      sender: params.sender,
    });
  }

  async buildRemoveLiquidityTx(params: RemoveLiquidityBuildParams): Promise<BuildResponse> {
    return this.post<BuildResponse>("/tx/liquidity/remove/build", {
      chain: params.chain,
      pool: params.pool,
      bin_id: params.binId,
      shares: params.shares,
      sender: params.sender,
    });
  }

  async buildCreatePoolTx(params: CreatePoolBuildParams): Promise<BuildResponse> {
    return this.post<BuildResponse>("/tx/pool/create/build", {
      chain: params.chain,
      token_x: params.tokenX,
      token_y: params.tokenY,
      base_price: params.basePrice,
      pool_type: params.poolType,
      bin_step: params.binStep,
      initial_price: params.initialPrice,
      sender: params.sender,
    });
  }

  async buildLendDepositTx(params: LendDepositBuildParams): Promise<BuildResponse> {
    return this.post<BuildResponse>("/tx/lend/deposit/build", {
      chain: params.chain,
      store_addr: params.storeAddr,
      token: params.token,
      amount: params.amount,
      sender: params.sender,
    });
  }

  async buildLendWithdrawTx(params: LendWithdrawBuildParams): Promise<BuildResponse> {
    return this.post<BuildResponse>("/tx/lend/withdraw/build", {
      chain: params.chain,
      store_addr: params.storeAddr,
      token: params.token,
      shares: params.shares,
      sender: params.sender,
    });
  }

  async buildBorrowLPTx(params: BorrowLPBuildParams): Promise<BuildResponse> {
    return this.post<BuildResponse>("/tx/borrow/lp/build", {
      chain: params.chain,
      store_addr: params.storeAddr,
      lp_store_addr: params.lpStoreAddr,
      oracle_addr: params.oracleAddr,
      token: params.token,
      position_id: params.positionId,
      pool_id: params.poolId,
      borrow_amount: params.borrowAmount,
      sender: params.sender,
    });
  }

  async buildRepayTx(params: RepayBuildParams): Promise<BuildResponse> {
    return this.post<BuildResponse>("/tx/repay/build", {
      chain: params.chain,
      store_addr: params.storeAddr,
      token: params.token,
      position_id: params.positionId,
      amount: params.amount,
      sender: params.sender,
    });
  }

  async submitTx(params: SubmitTxParams): Promise<SubmitTxResponse> {
    return this.post<SubmitTxResponse>("/tx/submit", {
      chain: params.chain,
      signed_xdr: params.signedXdr,
    });
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

  private async post<T>(path: string, payload: Record<string, unknown>): Promise<T> {
    const body = this.cleanPayload(payload);
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new JunctaAPIError(res.status, errBody);
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

  private cleanPayload(payload: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined && v !== "")
    );
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
