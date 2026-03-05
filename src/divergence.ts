import { Pivot, DivergenceSignal } from "./types";

// ============================================================
// Divergence Detection — bullish & bearish
// ============================================================

/**
 * Detect Bullish Divergence from the last two Pivot Lows.
 *
 * Conditions:
 *   - Price:  current pivot LOW  < previous pivot LOW   (Lower Low)
 *   - RSI:    current pivot RSI  > previous pivot RSI   (Higher Low)
 *   - Strict: first RSI pivot is in oversold zone (< 30)
 *   - Distance between pivots is within [minDist, maxDist]
 */
export function detectBullishDivergence(
  pivotLows: Pivot[],
  symbol: string,
  timeframe: string,
  minDist: number,
  maxDist: number,
): DivergenceSignal | null {
  if (pivotLows.length < 2) return null;

  const prev = pivotLows[pivotLows.length - 2];
  const curr = pivotLows[pivotLows.length - 1];
  const distance = curr.index - prev.index;

  // Validate distance
  if (distance < minDist || distance > maxDist) return null;

  // Price: Lower Low
  if (curr.price >= prev.price) return null;

  // RSI: Higher Low (diverging from price)
  if (curr.rsi <= prev.rsi) return null;

  // Strict filter: was the first RSI in oversold territory?
  const strict = prev.rsi < 30;

  return {
    type: "bullish",
    symbol,
    timeframe,
    currentPivot: curr,
    previousPivot: prev,
    confirmed: true,
    strict,
  };
}

/**
 * Detect Bearish Divergence from the last two Pivot Highs.
 *
 * Conditions:
 *   - Price:  current pivot HIGH > previous pivot HIGH  (Higher High)
 *   - RSI:    current pivot RSI  < previous pivot RSI   (Lower High)
 *   - Strict: first RSI pivot is in overbought zone (> 70)
 *   - Distance between pivots is within [minDist, maxDist]
 */
export function detectBearishDivergence(
  pivotHighs: Pivot[],
  symbol: string,
  timeframe: string,
  minDist: number,
  maxDist: number,
): DivergenceSignal | null {
  if (pivotHighs.length < 2) return null;

  const prev = pivotHighs[pivotHighs.length - 2];
  const curr = pivotHighs[pivotHighs.length - 1];
  const distance = curr.index - prev.index;

  // Validate distance
  if (distance < minDist || distance > maxDist) return null;

  // Price: Higher High
  if (curr.price <= prev.price) return null;

  // RSI: Lower High (diverging from price)
  if (curr.rsi >= prev.rsi) return null;

  // Strict filter: was the first RSI in overbought territory?
  const strict = prev.rsi > 70;

  return {
    type: "bearish",
    symbol,
    timeframe,
    currentPivot: curr,
    previousPivot: prev,
    confirmed: true,
    strict,
  };
}
