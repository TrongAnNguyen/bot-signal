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
  maxLookback: number = 5,
  oversoldLevel: number = 20,
): DivergenceSignal | null {
  if (pivotLows.length < 2) return null;

  const curr = pivotLows[pivotLows.length - 1];
  const startIndex = pivotLows.length - 2;
  const endIndex = Math.max(0, pivotLows.length - 1 - maxLookback);

  for (let i = startIndex; i >= endIndex; i--) {
    const prev = pivotLows[i];
    const distance = curr.index - prev.index;

    // Validate distance
    if (distance < minDist) continue;
    if (distance > maxDist) break; // Optimization: pivots are sorted by index, so distance only grows

    // Price: Lower Low or Double Bottom
    if (curr.price > prev.price) continue;

    // RSI: Higher Low (diverging from price)
    if (curr.rsi <= prev.rsi) continue;

    // Strict filter: was the first RSI in oversold territory?
    const strict = prev.rsi < oversoldLevel;

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

  return null;
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
  maxLookback: number = 5,
  overboughtLevel: number = 80,
): DivergenceSignal | null {
  if (pivotHighs.length < 2) return null;

  const curr = pivotHighs[pivotHighs.length - 1];
  const startIndex = pivotHighs.length - 2;
  const endIndex = Math.max(0, pivotHighs.length - 1 - maxLookback);

  for (let i = startIndex; i >= endIndex; i--) {
    const prev = pivotHighs[i];
    const distance = curr.index - prev.index;

    // Validate distance
    if (distance < minDist) continue;
    if (distance > maxDist) break; // Optimization: pivots are sorted by index, so distance only grows

    // Price: Higher High or Double Top
    if (curr.price < prev.price) continue;

    // RSI: Lower High (diverging from price)
    if (curr.rsi >= prev.rsi) continue;

    // Strict filter: was the first RSI in overbought territory?
    const strict = prev.rsi > overboughtLevel;
    console.log(
      `Pref rsi: ${prev.rsi} - overbought level: ${overboughtLevel} - strict: ${strict}`,
    );

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

  return null;
}
