import { RSI } from "technicalindicators";

// ============================================================
// Indicators — RSI calculation with index alignment
// ============================================================

/**
 * Calculate RSI values aligned to the candle array.
 *
 * `technicalindicators` returns an array shorter than the input
 * (it drops the first `period` values). We pad the front with NaN
 * so that rsiValues[i] corresponds to candles[i].
 */
export function calculateRSI(closePrices: number[], period: number): number[] {
  const raw = RSI.calculate({ values: closePrices, period });

  // Pad leading values so indices match the candle array
  const padding = closePrices.length - raw.length;
  const aligned: number[] = new Array(padding).fill(NaN);
  aligned.push(...raw);

  return aligned;
}
