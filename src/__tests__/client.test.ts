import { beforeEach, describe, expect, it, vi } from "vitest";
import { JunctaAPIError, JunctaClient } from "../client.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function ok(body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), { status: 200 })
  );
}

function fail(status: number, body = "") {
  return Promise.resolve(new Response(body, { status }));
}

beforeEach(() => mockFetch.mockReset());

// ── JunctaAPIError ────────────────────────────────────────────────────────────

describe("JunctaAPIError", () => {
  it("sets status, body, name, message", () => {
    const err = new JunctaAPIError(404, "not found");
    expect(err.status).toBe(404);
    expect(err.body).toBe("not found");
    expect(err.name).toBe("JunctaAPIError");
    expect(err.message).toContain("404");
    expect(err.message).toContain("not found");
    expect(err instanceof Error).toBe(true);
  });
});

// ── Constructor ───────────────────────────────────────────────────────────────

describe("JunctaClient constructor", () => {
  it("defaults to api.juncta.xyz/v1", () => {
    mockFetch.mockReturnValueOnce(ok({ pools: [], total: 0, page: 1, limit: 20 }));
    const client = new JunctaClient();
    client.getPools();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.juncta.xyz/v1"),
      expect.anything()
    );
  });

  it("accepts a custom baseUrl", () => {
    mockFetch.mockReturnValueOnce(ok({ pools: [], total: 0, page: 1, limit: 20 }));
    const client = new JunctaClient({ baseUrl: "http://localhost:8080/v1" });
    client.getPools();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("http://localhost:8080/v1/pools"),
      expect.anything()
    );
  });

  it("strips trailing slash from baseUrl", () => {
    mockFetch.mockReturnValueOnce(ok({ pools: [], total: 0, page: 1, limit: 20 }));
    const client = new JunctaClient({ baseUrl: "http://localhost:8080/v1/" });
    client.getPools();
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).not.toContain("//pools");
  });
});

// ── getPools ──────────────────────────────────────────────────────────────────

describe("getPools", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });
  const payload = { pools: [], total: 0, page: 1, limit: 20 };

  it("calls /pools with no params", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getPools();
    expect(mockFetch.mock.calls[0][0]).toBe("http://test/pools");
  });

  it("appends chain_id", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getPools({ chainId: "stellar-testnet" });
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://test/pools?chain_id=stellar-testnet"
    );
  });

  it("appends page and limit", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getPools({ page: 2, limit: 10 });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("page=2");
    expect(url).toContain("limit=10");
  });

  it("omits undefined params", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getPools({ chainId: undefined });
    expect(mockFetch.mock.calls[0][0]).toBe("http://test/pools");
  });

  it("returns parsed JSON", async () => {
    const data = { pools: [{ pool_id: "abc" }], total: 1, page: 1, limit: 20 };
    mockFetch.mockReturnValueOnce(ok(data));
    const result = await client.getPools();
    expect(result).toEqual(data);
  });
});

// ── getPool ───────────────────────────────────────────────────────────────────

describe("getPool", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });

  it("encodes the pool ID in the path", async () => {
    mockFetch.mockReturnValueOnce(ok({ pool_id: "x/y" }));
    await client.getPool("x/y");
    expect(mockFetch.mock.calls[0][0]).toBe("http://test/pools/x%2Fy");
  });
});

// ── getTokens ─────────────────────────────────────────────────────────────────

describe("getTokens", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });
  const payload = { tokens: [], total: 0, page: 1, limit: 20 };

  it("calls /tokens with no params", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getTokens();
    expect(mockFetch.mock.calls[0][0]).toBe("http://test/tokens");
  });

  it("appends chain_id, page, limit", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getTokens({ chainId: "cedra-testnet", page: 1, limit: 5 });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("chain_id=cedra-testnet");
    expect(url).toContain("page=1");
    expect(url).toContain("limit=5");
  });
});

// ── getToken ──────────────────────────────────────────────────────────────────

describe("getToken", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });

  it("encodes chain and contract in path", async () => {
    mockFetch.mockReturnValueOnce(ok({ chain_id: "cedra-testnet" }));
    await client.getToken("cedra-testnet", "0xabc/token");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://test/tokens/cedra-testnet/0xabc%2Ftoken"
    );
  });
});

// ── getAnalyticsSummary ───────────────────────────────────────────────────────

describe("getAnalyticsSummary", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });
  const payload = {
    swaps_24h: 0, volume_24h: 0, fees_24h: 0,
    active_borrows: 0, positions_at_risk: 0, liquidations_7d: 0,
  };

  it("calls /analytics/summary with no params", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getAnalyticsSummary();
    expect(mockFetch.mock.calls[0][0]).toBe("http://test/analytics/summary");
  });

  it("appends chain_id", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getAnalyticsSummary({ chainId: "aptos-testnet" });
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://test/analytics/summary?chain_id=aptos-testnet"
    );
  });
});

// ── getAnalyticsVolume ────────────────────────────────────────────────────────

describe("getAnalyticsVolume", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });

  it("appends chain_id, pool_id, period", async () => {
    mockFetch.mockReturnValueOnce(ok([]));
    await client.getAnalyticsVolume({
      chainId: "stellar-testnet",
      poolId: "pool-1",
      period: "7d",
    });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("chain_id=stellar-testnet");
    expect(url).toContain("pool_id=pool-1");
    expect(url).toContain("period=7d");
  });

  it("calls /analytics/volume with no params", async () => {
    mockFetch.mockReturnValueOnce(ok([]));
    await client.getAnalyticsVolume();
    expect(mockFetch.mock.calls[0][0]).toBe("http://test/analytics/volume");
  });
});

// ── getAnalyticsFees ──────────────────────────────────────────────────────────

describe("getAnalyticsFees", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });
  const payload = { total_fees: 0, swap_count: 0, avg_fee_per_swap: 0 };

  it("calls /analytics/fees with period", async () => {
    mockFetch.mockReturnValueOnce(ok(payload));
    await client.getAnalyticsFees({ period: "24h" });
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://test/analytics/fees?period=24h"
    );
  });
});

// ── getSwapQuote ──────────────────────────────────────────────────────────────

describe("getSwapQuote", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });

  it("appends all required params", async () => {
    mockFetch.mockReturnValueOnce(
      ok({
        chain: "cedra",
        pool: "p1",
        amount_in: "100",
        amount_out: "99",
        fee: "1",
        price: "0.99",
        direction: "x_to_y",
      })
    );
    await client.getSwapQuote({
      chain: "cedra",
      pool: "p1",
      amountIn: "100",
      direction: "x_to_y",
    });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/tx/swap/quote");
    expect(url).toContain("chain=cedra");
    expect(url).toContain("pool=p1");
    expect(url).toContain("amount_in=100");
    expect(url).toContain("direction=x_to_y");
  });

  it("includes optional sender when provided", async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await client.getSwapQuote({
      chain: "stellar",
      pool: "p2",
      amountIn: "50",
      direction: "y_to_x",
      sender: "GABCD",
    });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("sender=GABCD");
  });

  it("omits sender when not provided", async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    await client.getSwapQuote({
      chain: "aptos",
      pool: "p3",
      amountIn: "10",
      direction: "x_to_y",
    });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).not.toContain("sender");
  });
});

// ── tx build + submit ────────────────────────────────────────────────────────

describe("tx build methods", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });

  it("buildSwapTx uses POST and snake_case payload keys", async () => {
    mockFetch.mockReturnValueOnce(ok({ chain: "cedra", type: "entry_function", payload: {} }));
    await client.buildSwapTx({
      chain: "cedra",
      pool: "p1",
      amountIn: 100,
      minOut: 90,
      direction: "x_to_y",
      sender: "0xabc",
    });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://test/tx/swap/build");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({
      chain: "cedra",
      pool: "p1",
      amount_in: 100,
      min_out: 90,
      direction: "x_to_y",
      sender: "0xabc",
    });
  });

  it("buildBorrowLPTx includes optional fields when set", async () => {
    mockFetch.mockReturnValueOnce(ok({ chain: "aptos", type: "entry_function", payload: {} }));
    await client.buildBorrowLPTx({
      chain: "aptos",
      storeAddr: "0xstore",
      lpStoreAddr: "0xlp",
      oracleAddr: "0xoracle",
      token: "0xtoken",
      positionId: 1,
      poolId: 2,
      borrowAmount: 500,
      sender: "0xme",
    });

    const [, opts] = mockFetch.mock.calls[0];
    expect(JSON.parse(opts.body)).toEqual({
      chain: "aptos",
      store_addr: "0xstore",
      lp_store_addr: "0xlp",
      oracle_addr: "0xoracle",
      token: "0xtoken",
      position_id: 1,
      pool_id: 2,
      borrow_amount: 500,
      sender: "0xme",
    });
  });

  it("omits undefined optional fields from POST payload", async () => {
    mockFetch.mockReturnValueOnce(ok({ chain: "stellar", type: "soroban_xdr", payload: "AAAA" }));
    await client.buildLendDepositTx({
      chain: "stellar",
      amount: 1000,
      sender: "GABC",
    });

    const [, opts] = mockFetch.mock.calls[0];
    expect(JSON.parse(opts.body)).toEqual({
      chain: "stellar",
      amount: 1000,
      sender: "GABC",
    });
  });

  it("submitTx maps signedXdr to signed_xdr", async () => {
    mockFetch.mockReturnValueOnce(ok({ hash: "abc123" }));
    await client.submitTx({ chain: "stellar", signedXdr: "AAAA..." });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://test/tx/submit");
    expect(JSON.parse(opts.body)).toEqual({
      chain: "stellar",
      signed_xdr: "AAAA...",
    });
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe("error handling", () => {
  const client = new JunctaClient({ baseUrl: "http://test" });

  it("throws JunctaAPIError on 404", async () => {
    mockFetch.mockReturnValueOnce(fail(404, "not found"));
    await expect(client.getPools()).rejects.toBeInstanceOf(JunctaAPIError);
  });

  it("throws JunctaAPIError with correct status on 500", async () => {
    mockFetch.mockReturnValueOnce(fail(500, "server error"));
    const err = await client.getPools().catch((e) => e);
    expect(err).toBeInstanceOf(JunctaAPIError);
    expect(err.status).toBe(500);
    expect(err.body).toContain("server error");
  });

  it("throws JunctaAPIError on 401", async () => {
    mockFetch.mockReturnValueOnce(fail(401, '{"error":"unauthorized"}'));
    const err = await client.getAnalyticsSummary().catch((e) => e);
    expect(err.status).toBe(401);
  });

  it("uses GET method on all requests", async () => {
    mockFetch.mockReturnValueOnce(ok([]));
    await client.getAnalyticsVolume();
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe("GET");
  });

  it("sends Content-Type application/json", async () => {
    mockFetch.mockReturnValueOnce(ok([]));
    await client.getAnalyticsVolume();
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers["Content-Type"]).toBe("application/json");
  });
});
