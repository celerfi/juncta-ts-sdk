# @juncta/sdk

TypeScript SDK for the [Juncta Protocol](https://juncta.xyz) public API. Works in Node.js, browsers, and edge runtimes (ESM + CJS).

## Installation

```bash
npm install @juncta/sdk
```

## Quick start

```ts
import { JunctaClient } from "@juncta/sdk";

const client = new JunctaClient();

const { pools } = await client.getPools({ chainId: "cedra-testnet" });
console.log(pools);
```

The default base URL is `https://api.juncta.xyz/v1`. No API key is required.

## Client options

```ts
const client = new JunctaClient({
  baseUrl: "https://api.juncta.xyz/v1", // optional override
});
```

## Methods

### Pools

```ts
// List pools (optional filter by chain)
const { pools, total, page, limit } = await client.getPools({
  chainId: "cedra-testnet", // "cedra-testnet" | "aptos-testnet" | "stellar-testnet"
  page: 1,
  limit: 20,
});

// Get a single pool - includes bins summary and APY breakdown
const pool = await client.getPool("pool-id");
// pool.apy_breakdown.fee_apy, pool.apy_breakdown.lending_apy, pool.apy_breakdown.total_apy
// pool.bins.active_count, pool.bins.lending_count, pool.bins.idle_count

// Get per-bin visualization data for a pool
const { bins, active_bin } = await client.getPoolBins("pool-id");
// bins[n].type - "center" | "active" | "lending" | "idle"
```

### Tokens

```ts
// List tokens
const { tokens, total } = await client.getTokens({
  chainId: "stellar-testnet",
  page: 1,
  limit: 20,
  stable: true, // optional - filter to stablecoins only
});

// Get a single token
const token = await client.getToken("cedra-testnet", "0xabc123::coin::USDC");

// Get USD price for a token
const price = await client.getTokenPrice("cedra-testnet", "0xabc123::coin::USDC");
// price.price_usd, price.symbol, price.updated_at
```

### Lending

```ts
// List tokens available for lending/borrowing
const { tokens } = await client.getLendableTokens({ chainId: "cedra-testnet" });
// tokens[n].supply_apy, tokens[n].borrow_apy, tokens[n].utilization, tokens[n].ltv
```

### Positions

```ts
// Get LP positions for an account
const { positions, has_position } = await client.getPositions("0xabc123", {
  chainId: "cedra-testnet", // optional
  poolId: "pool-id",        // optional
});
// positions[n].net_shares, net_amount_x, net_amount_y
```

### Liquidity preview

```ts
// Preview how liquidity is distributed across bins before adding
const preview = await client.getLiquidityPreview({
  chainId: "cedra-testnet",
  poolId: "pool-id",
  strategy: "spot",     // "spot" | "curve" | "bid_ask" | "wide"
  amountX: 1_000_000,
  amountY: 1_000_000,
  centerBin: 8388608,   // optional - defaults to active bin
  bidWeight: 50,        // optional - bid/ask weight % for "bid_ask" strategy
});
// preview.bins, preview.estimated_apy, preview.bin_range
```

### Analytics

```ts
// Protocol-wide overview (TVL, lending capital, APY breakdown, bin counts)
const overview = await client.getProtocolOverview();
// overview.total_tvl_usd, overview.lending_supplied_usd
// overview.trading_fee_apy, overview.lending_yield_apy, overview.combined_apy
// overview.total_bins, overview.active_bins, overview.lending_bins, overview.idle_bins

// Protocol summary (24h swaps, volume, fees, etc.)
const summary = await client.getAnalyticsSummary({ chainId: "cedra-testnet" });

// Volume breakdown by pool
const rows = await client.getAnalyticsVolume({
  chainId: "cedra-testnet",
  poolId: "pool-id", // optional
  period: "7d",      // "1h" | "24h" | "7d" | "30d"
});

// Fee stats
const fees = await client.getAnalyticsFees({ period: "24h" });
```

### Swap quote

```ts
const quote = await client.getSwapQuote({
  chain: "cedra",      // "cedra" | "aptos" | "stellar"
  pool: "pool-id",
  amountIn: "1000000",
  direction: "x_to_y", // "x_to_y" | "y_to_x"
  sender: "0xabc123",  // required for Stellar, optional for Cedra/Aptos
});

console.log(quote.amount_out, quote.fee, quote.price);
```

### Transaction build + submit

All build methods work on Cedra, Aptos, and Stellar. The response `type` field tells you how to handle the payload:

- `"entry_function"` - Cedra / Aptos. Pass `payload` directly to your Move wallet SDK.
- `"soroban_xdr"` - Stellar. Sign the XDR with your wallet, then submit via `submitTx`.

```ts
// Swap
const build = await client.buildSwapTx({
  chain: "cedra",
  pool: "pool-id",
  amountIn: 1_000_000,
  minOut: 0,
  direction: "x_to_y",
  sender: "0xabc123",
});

// Add liquidity - strategy controls bin distribution
const addLiq = await client.buildAddLiquidityTx({
  chain: "cedra",
  pool: "pool-id",
  amountX: 1_000_000,
  amountY: 1_000_000,
  strategy: "spot",    // "spot" | "curve" | "bid_ask" | "wide"
  centerBin: 8388608,  // optional
  bidWeight: 50,       // optional - for "bid_ask" strategy
  sender: "0xabc123",
});

// Remove liquidity
await client.buildRemoveLiquidityTx({ chain, pool, binId, shares, sender });

// Create pool
await client.buildCreatePoolTx({ chain, tokenX, tokenY, basePrice, poolType, binStep, initialPrice, sender });

// Lending
await client.buildLendDepositTx({ chain, storeAddr, token, amount, sender });
await client.buildLendWithdrawTx({ chain, storeAddr, token, shares, sender });

// Borrow against LP collateral
await client.buildBorrowLPTx({ chain, storeAddr, lpStoreAddr, oracleAddr, token, positionId, poolId, borrowAmount, sender });

// Repay borrow
await client.buildRepayTx({ chain, storeAddr, token, positionId, amount, sender });

// Adaptive manager - call register AFTER the add-liquidity transaction confirms
await client.buildAdaptiveRegisterTx({ chain, pool, positionId, lowerBin, upperBin, sender });
await client.buildAdaptiveDeregisterTx({ chain, positionId, sender });

// Submit signed XDR (Stellar only)
const submitted = await client.submitTx({
  chain: "stellar",
  signedXdr: "AAAAAgAAA...",
});
console.log(submitted.hash);
```

## Error handling

All methods throw `JunctaAPIError` on non-2xx responses.

```ts
import { JunctaClient, JunctaAPIError } from "@juncta/sdk";

try {
  const pool = await client.getPool("bad-id");
} catch (err) {
  if (err instanceof JunctaAPIError) {
    console.log(err.status); // 404
    console.log(err.body);   // raw response body
  }
}
```

## Types

All request and response types are exported:

```ts
import type {
  Chain,
  SwapChain,
  SwapDirection,
  Period,
  PoolType,
  LiquidityStrategy,
  Pool,
  ActiveBin,
  PoolBins,
  APYBreakdown,
  PoolDetail,
  PoolBinVisualization,
  PoolBinsResponse,
  PoolsResponse,
  Token,
  TokenPrice,
  TokensResponse,
  LPPosition,
  PositionsResponse,
  BinWeight,
  LiquidityPreviewResponse,
  LendableToken,
  LendableTokensResponse,
  ProtocolOverviewResponse,
  SummaryResponse,
  VolumeRow,
  FeesResponse,
  QuoteResponse,
  BuildResponse,
  SubmitTxResponse,
} from "@juncta/sdk";
```

## License

Apache-2.0
