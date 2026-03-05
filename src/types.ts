// ============================================================
// Shared Types for the RSI Divergence Signal Bot
// ============================================================

/** Raw OHLCV candle from the exchange */
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** A confirmed swing point (high or low) */
export interface Pivot {
  index: number; // position in the candle array
  price: number; // high (for peak) or low (for trough)
  rsi: number; // RSI value at this candle
  timestamp: number; // Unix ms
  type: "high" | "low";
}

/** Type of divergence signal */
export type DivergenceType = "bullish" | "bearish";

/** A single divergence detection result */
export interface DivergenceSignal {
  type: DivergenceType;
  symbol: string;
  timeframe: string;
  currentPivot: Pivot;
  previousPivot: Pivot;
  confirmed: boolean;
  /** true if first RSI pivot was in oversold (<30) or overbought (>70) zone */
  strict: boolean;
}

/** Result of scanning one symbol on one timeframe */
export interface ScanResult {
  symbol: string;
  timeframe: string;
  divergences: DivergenceSignal[];
  timestamp: number;
}

/** Aggregated confluence alert across timeframes */
export interface ConfluenceAlert {
  symbol: string;
  signal: DivergenceType;
  timeframes: string[];
  signals: DivergenceSignal[];
  confidence: "Low" | "Medium" | "High";
}
