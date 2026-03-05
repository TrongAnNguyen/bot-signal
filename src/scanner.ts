import { config } from "./config";
import { fetchCandles } from "./exchange";
import { calculateRSI } from "./indicators";
import { findPivotLows, findPivotHighs } from "./pivots";
import { detectBullishDivergence, detectBearishDivergence } from "./divergence";
import { DivergenceSignal, ConfluenceAlert, ScanResult } from "./types";

// ============================================================
// Scanner — multi-timeframe divergence scanning
// ============================================================

/** Higher timeframes that produce stronger signals */
const HIGHER_TIMEFRAMES = new Set(["4h", "1d", "1w"]);

/**
 * Scan a single symbol on a single timeframe.
 * Returns any detected divergence signals.
 */
export async function scanSymbolTimeframe(
  symbol: string,
  timeframe: string,
): Promise<ScanResult> {
  const result: ScanResult = {
    symbol,
    timeframe,
    divergences: [],
    timestamp: Date.now(),
  };

  // 1. Fetch candles
  const candles = await fetchCandles(symbol, timeframe, config.candleLimit);
  if (candles.length < config.rsiPeriod + config.pivotStrength * 2) {
    console.log(
      `[Scanner] Not enough candles for ${symbol} ${timeframe} (got ${candles.length})`,
    );
    return result;
  }

  // 2. Calculate RSI (aligned with candle indices)
  const closePrices = candles.map((c) => c.close);
  const rsiValues = calculateRSI(closePrices, config.rsiPeriod);

  // 3. Find Pivot Lows → detect Bullish Divergence
  const pivotLows = findPivotLows(candles, rsiValues, config.pivotStrength);
  const bullish = detectBullishDivergence(
    pivotLows,
    symbol,
    timeframe,
    config.minPivotDistance,
    config.maxPivotDistance,
  );
  if (bullish) {
    result.divergences.push(bullish);
    console.log(
      `[Scanner] 🟢 Bullish divergence on ${symbol} ${timeframe} ` +
        `| Price: ${bullish.currentPivot.price} | RSI: ${bullish.currentPivot.rsi.toFixed(2)} ` +
        `| Strict: ${bullish.strict}`,
    );
  }

  // 4. Find Pivot Highs → detect Bearish Divergence
  const pivotHighs = findPivotHighs(candles, rsiValues, config.pivotStrength);
  const bearish = detectBearishDivergence(
    pivotHighs,
    symbol,
    timeframe,
    config.minPivotDistance,
    config.maxPivotDistance,
  );
  if (bearish) {
    result.divergences.push(bearish);
    console.log(
      `[Scanner] 🔴 Bearish divergence on ${symbol} ${timeframe} ` +
        `| Price: ${bearish.currentPivot.price} | RSI: ${bearish.currentPivot.rsi.toFixed(2)} ` +
        `| Strict: ${bearish.strict}`,
    );
  }

  return result;
}

/**
 * Scan all symbols across all timeframes.
 */
export async function scanAll(
  symbols: string[],
  timeframes: string[],
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  for (const symbol of symbols) {
    for (const tf of timeframes) {
      const result = await scanSymbolTimeframe(symbol, tf);
      results.push(result);
    }
  }

  return results;
}

/**
 * Detect confluence: same divergence type on multiple timeframes
 * for the same symbol → higher confidence.
 */
export function detectConfluence(results: ScanResult[]): ConfluenceAlert[] {
  // Group divergences by (symbol, divergence type)
  const groups = new Map<string, DivergenceSignal[]>();

  for (const result of results) {
    for (const div of result.divergences) {
      const key = `${div.symbol}::${div.type}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(div);
    }
  }

  const alerts: ConfluenceAlert[] = [];

  for (const [key, signals] of groups) {
    const [symbol, type] = key.split("::");
    const timeframes = signals.map((s) => s.timeframe);

    let confidence: ConfluenceAlert["confidence"];

    if (timeframes.length >= 2) {
      // Multi-timeframe confluence → High
      confidence = "High";
    } else if (HIGHER_TIMEFRAMES.has(timeframes[0])) {
      // Single higher timeframe → Medium
      confidence = "Medium";
    } else {
      // Single lower timeframe → Low
      confidence = "Low";
    }

    alerts.push({
      symbol,
      signal: type as DivergenceSignal["type"],
      timeframes,
      signals,
      confidence,
    });
  }

  return alerts;
}
