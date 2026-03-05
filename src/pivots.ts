import { Candle, Pivot } from "./types";

// ============================================================
// Pivot Detection — swing highs and swing lows
// ============================================================

/**
 * Find Pivot Lows (troughs).
 *
 * A candle at index `i` is a Pivot Low if its `low` price is
 * strictly lower than the `low` of the N candles before AND
 * the N candles after it.
 */
export function findPivotLows(
  candles: Candle[],
  rsiValues: number[],
  n: number,
): Pivot[] {
  const pivots: Pivot[] = [];

  for (let i = n; i < candles.length - n; i++) {
    const currentLow = candles[i].low;
    let isPivot = true;

    // Check N candles before
    for (let j = 1; j <= n; j++) {
      if (currentLow >= candles[i - j].low) {
        isPivot = false;
        break;
      }
    }

    if (!isPivot) continue;

    // Check N candles after
    for (let j = 1; j <= n; j++) {
      if (currentLow >= candles[i + j].low) {
        isPivot = false;
        break;
      }
    }

    if (isPivot && !isNaN(rsiValues[i])) {
      pivots.push({
        index: i,
        price: currentLow,
        rsi: rsiValues[i],
        timestamp: candles[i].timestamp,
        type: "low",
      });
    }
  }

  return pivots;
}

/**
 * Find Pivot Highs (peaks).
 *
 * A candle at index `i` is a Pivot High if its `high` price is
 * strictly higher than the `high` of the N candles before AND
 * the N candles after it.
 */
export function findPivotHighs(
  candles: Candle[],
  rsiValues: number[],
  n: number,
): Pivot[] {
  const pivots: Pivot[] = [];

  for (let i = n; i < candles.length - n; i++) {
    const currentHigh = candles[i].high;
    let isPivot = true;

    // Check N candles before
    for (let j = 1; j <= n; j++) {
      if (currentHigh <= candles[i - j].high) {
        isPivot = false;
        break;
      }
    }

    if (!isPivot) continue;

    // Check N candles after
    for (let j = 1; j <= n; j++) {
      if (currentHigh <= candles[i + j].high) {
        isPivot = false;
        break;
      }
    }

    if (isPivot && !isNaN(rsiValues[i])) {
      pivots.push({
        index: i,
        price: currentHigh,
        rsi: rsiValues[i],
        timestamp: candles[i].timestamp,
        type: "high",
      });
    }
  }

  return pivots;
}
