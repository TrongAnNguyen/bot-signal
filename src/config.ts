import dotenv from "dotenv";
dotenv.config();

// ============================================================
// Configuration — loads from .env with sensible defaults
// ============================================================

export const config = {
  // --- Telegram ---
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",

  // --- Trading pairs ---
  symbols: (process.env.SYMBOLS || "BTC/USDT,ETH/USDT,AVAX/USDT")
    .split(",")
    .map((s) => s.trim()),

  // --- Timeframes to scan ---
  timeframes: (process.env.TIMEFRAMES || "5m,30m,1h,4h,1d,1w")
    .split(",")
    .map((s) => s.trim()),

  // --- Scanning ---
  scanIntervalMs: Number(process.env.SCAN_INTERVAL_MS) || 60_000,
  candleLimit: Number(process.env.CANDLE_LIMIT) || 300,

  // --- Pivot detection ---
  pivotStrength: Number(process.env.PIVOT_STRENGTH) || 3,

  // --- RSI ---
  rsiPeriod: Number(process.env.RSI_PERIOD) || 14,

  // --- Divergence validation ---
  minPivotDistance: Number(process.env.MIN_PIVOT_DISTANCE) || 5,
  maxPivotDistance: Number(process.env.MAX_PIVOT_DISTANCE) || 50,
} as const;

export type Config = typeof config;
