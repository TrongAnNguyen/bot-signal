import { binance } from "ccxt";
import { Candle } from "./types";

// ============================================================
// Exchange — fetches OHLCV candle data from Binance
// ============================================================

const exchange = new binance({ enableRateLimit: true });

/**
 * Fetch OHLCV candles for a given symbol and timeframe.
 * Returns full Candle objects (not just close prices).
 */
export async function fetchCandles(
  symbol: string,
  timeframe: string,
  limit: number,
): Promise<Candle[]> {
  try {
    const raw = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);

    return raw
      .filter(
        (c: any) =>
          c[1] != null && c[2] != null && c[3] != null && c[4] != null,
      )
      .map(
        (c: any): Candle => ({
          timestamp: c[0],
          open: c[1],
          high: c[2],
          low: c[3],
          close: c[4],
          volume: c[5] ?? 0,
        }),
      );
  } catch (error) {
    console.error(`[Exchange] Error fetching ${symbol} ${timeframe}:`, error);
    return [];
  }
}
