Building a high-precision **RSI Divergence Bot** requires shifting from simple "if-else" logic to a more sophisticated **Pivot-based** approach. Here is the comprehensive technical specification in English to help you build this with TypeScript.

---

## 1. Core Technical Requirements

- **Language:** TypeScript (Node.js/Bun).
- **Data Source:** Binance API via `ccxt` library.
- **Indicator:** RSI (14-period) via `technicalindicators` library.
- **Timeframes:** `5m`, `30m`, `1h`, `4h`, `1d`, `1w`.
- **Lookback Window:** 100–300 candles per timeframe to identify historical pivot points.

---

## 2. Defining "Pivots" (The Foundation)

To find a divergence, the bot must first identify **swing highs** and **swing lows**. A single candle is not enough; you need a cluster.

- **Pivot Low (Trough):** A candle where the Low is lower than the $N$ candles before it and $N$ candles after it.
- **Pivot High (Peak):** A candle where the High is higher than the $N$ candles before it and $N$ candles after it.
- **The "N" Parameter:** For crypto, $N=3$ or $N=5$ is standard. Note that this introduces a lag of $N$ candles for confirmation.

---

## 3. Divergence Detection Logic

### A. Bullish Divergence (Buy Signal)

Occurs at the end of a downtrend, signaling a potential reversal.

1. **Price Condition:** The current Pivot Low is **lower** than the previous Pivot Low (**Lower Low**).
2. **RSI Condition:** The current RSI value at that pivot is **higher** than the previous RSI value (**Higher Low**).
3. **Strict Filter:** The first RSI pivot should ideally be in the **Oversold zone (< 30)**.

### B. Bearish Divergence (Sell/Short Signal)

Occurs at the end of an uptrend, signaling a potential exhaustion.

1. **Price Condition:** The current Pivot High is **higher** than the previous Pivot High (**Higher High**).
2. **RSI Condition:** The current RSI value at that pivot is **lower** than the previous RSI value (**Lower High**).
3. **Strict Filter:** The first RSI pivot should ideally be in the **Overbought zone (> 70)**.

---

## 4. Multi-Timeframe (MTF) Strategy

The bot should iterate through an array of timeframes and aggregate results.

| Timeframe    | Purpose                             | Noise Level                |
| ------------ | ----------------------------------- | -------------------------- |
| **5m / 30m** | Scalping / Immediate entries.       | High (More false signals). |
| **1h / 4h**  | Swing trading / Trend confirmation. | Moderate (Reliable).       |
| **1d / 1w**  | Macro direction / Major reversals.  | Low (Very strong signals). |

**The Confluence Rule:** If a Bullish Divergence appears on the `1h` and `4h` simultaneously for the same pair, the signal strength is **Triple-A**.

---

## 5. TypeScript Implementation Guide

### The `Pivot` Interface

```typescript
interface Pivot {
  index: number;
  price: number;
  rsi: number;
  timestamp: number;
}
```

### The Scanning Pipeline

1. **Sync:** Fetch OHLCV data for all timeframes.
2. **Calculate:** Compute RSI array for the entire dataset.
3. **Find Pivots:** Iterate through the array to find the last two `Pivot Highs` or `Pivot Lows`.
4. **Validate:**

- Check if the distance between pivots is not too large (e.g., within 5 to 50 candles).
- Check if price and RSI are moving in opposite directions.

5. **Notify:** Format the data into a clean alert.

---

## 6. Notification Payload Example

When the bot finds a signal, the Telegram/Discord notification should look like this:

> 🚨 **DIVERGENCE ALERT: BTC/USDT**
>
> - **Signal:** Bullish Divergence (Confirmed)
> - **Timeframe:** 4h
> - **Price:** $72,875 (Lower Low)
> - **RSI:** 42.5 (Higher Low)
> - **Confidence:** High (MTF Confluence with 1h)
> - [View Chart Link]
