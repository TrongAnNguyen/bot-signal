import { Telegraf } from "telegraf";
import { config } from "./config";
import { ConfluenceAlert, DivergenceSignal } from "./types";

// ============================================================
// Telegram — bot setup & notification formatting
// ============================================================

let bot: Telegraf | null = null;

/**
 * Initialize the Telegram bot. Returns null if token is not configured.
 */
export function initTelegram(): Telegraf | null {
  if (!config.telegramBotToken) {
    console.warn(
      "[Telegram] No TELEGRAM_BOT_TOKEN set — notifications disabled",
    );
    return null;
  }

  bot = new Telegraf(config.telegramBotToken);

  bot.start((ctx) =>
    ctx.reply(
      "🤖 *RSI Divergence Bot* is running\\!\n\n" +
        "Commands:\n" +
        "/status — Bot status\n" +
        "/scan — Trigger manual scan",
      { parse_mode: "MarkdownV2" },
    ),
  );

  bot.command("status", (ctx) => {
    const symbols = config.symbols.join(", ");
    const timeframes = config.timeframes.join(", ");
    ctx.reply(
      `📊 *Status: Running*\n\n` +
        `• Symbols: ${symbols}\n` +
        `• Timeframes: ${timeframes}\n` +
        `• Scan interval: ${config.scanIntervalMs / 1000}s\n` +
        `• Pivot strength: ${config.pivotStrength}`,
      { parse_mode: "Markdown" },
    );
  });

  return bot;
}

/**
 * Register a manual /scan handler that triggers the provided callback.
 */
export function onScanCommand(callback: () => Promise<void>) {
  if (!bot) return;
  bot.command("scan", async (ctx) => {
    await ctx.reply("🔍 Scanning now...");
    await callback();
    await ctx.reply("✅ Scan complete.");
  });
}

/**
 * Launch the bot in polling mode.
 */
export async function launchBot() {
  if (!bot) return;
  bot.launch();
  console.log("[Telegram] Bot launched in polling mode");
}

/**
 * Stop the bot gracefully.
 */
export function stopBot(reason: string = "shutdown") {
  if (!bot) return;
  bot.stop(reason);
}

// ============================================================
// Message Formatting
// ============================================================

/**
 * Format a single divergence signal into a readable string.
 */
function formatSignal(signal: DivergenceSignal): string {
  const emoji = signal.type === "bullish" ? "🟢" : "🔴";
  const direction = signal.type === "bullish" ? "Bullish" : "Bearish";
  const priceLabel = signal.type === "bullish" ? "Lower Low" : "Higher High";
  const rsiLabel = signal.type === "bullish" ? "Higher Low" : "Lower High";
  const strictTag = signal.strict ? " ✅ Strict" : "";

  return (
    `${emoji} *${direction} Divergence*${strictTag}\n` +
    `  • Timeframe: \`${signal.timeframe}\`\n` +
    `  • Price: $${signal.currentPivot.price.toLocaleString()} (${priceLabel})\n` +
    `  • RSI: ${signal.currentPivot.rsi.toFixed(1)} (${rsiLabel})`
  );
}

/**
 * Build the TradingView chart URL for a symbol.
 */
function chartUrl(symbol: string): string {
  const tvSymbol = symbol.replace("/", "").toUpperCase();
  return `https://www.tradingview.com/chart/?symbol=BINANCE:${tvSymbol}`;
}

/**
 * Format a full confluence alert into a Telegram message.
 */
export function formatAlert(alert: ConfluenceAlert): string {
  const typeEmoji = alert.signal === "bullish" ? "🚨🟢" : "🚨🔴";
  const direction = alert.signal === "bullish" ? "BULLISH" : "BEARISH";
  const tfList = alert.timeframes.join(", ");

  let msg =
    `${typeEmoji} *DIVERGENCE ALERT: ${alert.symbol}*\n\n` +
    `• Signal: ${direction} Divergence (Confirmed)\n` +
    `• Confidence: *${alert.confidence}*`;

  if (alert.timeframes.length > 1) {
    msg += ` (MTF Confluence: ${tfList})`;
  }

  msg += "\n\n";

  for (const signal of alert.signals) {
    msg += formatSignal(signal) + "\n\n";
  }

  msg += `📈 [View Chart](${chartUrl(alert.symbol)})`;

  return msg;
}

/**
 * Send a confluence alert to the configured Telegram chat.
 */
export async function sendAlert(alert: ConfluenceAlert): Promise<void> {
  if (!bot || !config.telegramChatId) {
    console.log("[Telegram] Alert (console only):\n", formatAlert(alert));
    return;
  }

  try {
    await bot.telegram.sendMessage(config.telegramChatId, formatAlert(alert), {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true },
    });
  } catch (error) {
    console.error("[Telegram] Failed to send alert:", error);
  }
}
