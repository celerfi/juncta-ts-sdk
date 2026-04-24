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

// Get a single pool
const pool = await client.getPool("pool-id");
```

### Tokens

```ts
// List tokens
const { tokens, total } = await client.getTokens({
  chainId: "stellar-testnet",
  page: 1,
  limit: 20,
});

// Get a single token
const token = await client.getToken("cedra-testnet", "0xabc123::coin::USDC");
```

### Analytics

```ts
// Protocol summary (24h swaps, volume, fees, etc.)
const summary = await client.getAnalyticsSummary({ chainId: "cedra-testnet" });

// Volume breakdown by pool
const rows = await client.getAnalyticsVolume({
  chainId: "cedra-testnet",
  poolId: "pool-id",  // optional
  period: "7d",       // "1h" | "24h" | "7d" | "30d"
});

// Fee stats
const fees = await client.getAnalyticsFees({ period: "24h" });
```

### Swap quote

```ts
const quote = await client.getSwapQuote({
  chain: "cedra",       // "cedra" | "aptos" | "stellar"
  pool: "pool-id",
  amountIn: "1000000",
  direction: "x_to_y",  // "x_to_y" | "y_to_x"
  sender: "0xabc123",   // optional
});

console.log(quote.amount_out, quote.fee, quote.price);
```

### Transaction build + submit

```ts
// Build an unsigned transaction payload
const build = await client.buildSwapTx({
  chain: "cedra",
  pool: "1",
  amountIn: 1_000_000,
  minOut: 0,
  direction: "x_to_y",
  sender: "0xabc123",
});

// For Stellar, submit the signed XDR after wallet signing
const submitted = await client.submitTx({
  chain: "stellar",
  signedXdr: "AAAAAgAAA...",
});

console.log(build.type, submitted.hash);
```

Supported builder methods:
- `buildSwapTx`
- `buildAddLiquidityTx`
- `buildRemoveLiquidityTx`
- `buildCreatePoolTx`
- `buildLendDepositTx`
- `buildLendWithdrawTx`
- `buildBorrowLPTx`
- `buildRepayTx`

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
  Pool,
  Token,
  Chain,
  SwapChain,
  SwapDirection,
  Period,
  PoolsResponse,
  TokensResponse,
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
