import { config } from "./config";
import { scanAll, detectConfluence } from "./scanner";
import {
  initTelegram,
  launchBot,
  stopBot,
  onScanCommand,
  sendAlert,
} from "./telegram";

// ============================================================
// Main — entry point for the RSI Divergence Signal Bot
// ============================================================

async function runScanCycle(): Promise<void> {
  const start = Date.now();
  console.log(`\n⏳ [${new Date().toISOString()}] Starting scan cycle...`);

  try {
    // 1. Scan all symbols × all timeframes
    const results = await scanAll(config.symbols, config.timeframes);

    // 2. Count total divergences found
    const totalDivergences = results.reduce(
      (sum, r) => sum + r.divergences.length,
      0,
    );

    // 3. Detect confluence across timeframes
    const alerts = detectConfluence(results);

    console.log(
      `✅ Scan complete in ${((Date.now() - start) / 1000).toFixed(1)}s ` +
        `| ${totalDivergences} divergence(s) | ${alerts.length} alert(s)`,
    );

    // 4. Send alerts via Telegram
    for (const alert of alerts) {
      await sendAlert(alert);
    }
  } catch (error) {
    console.error("❌ Scan cycle error:", error);
  }
}

async function main() {
  console.log("🤖 RSI Divergence Signal Bot starting...");
  console.log(`   Symbols:    ${config.symbols.join(", ")}`);
  console.log(`   Timeframes: ${config.timeframes.join(", ")}`);
  console.log(`   Interval:   ${config.scanIntervalMs / 1000}s`);
  console.log(`   Pivot N:    ${config.pivotStrength}`);
  console.log(`   RSI Period: ${config.rsiPeriod}`);
  console.log("");

  // Initialize Telegram bot
  initTelegram();
  onScanCommand(runScanCycle);
  await launchBot();

  // Run initial scan
  await runScanCycle();

  // Schedule recurring scans
  const interval = setInterval(runScanCycle, config.scanIntervalMs);

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down...`);
    clearInterval(interval);
    stopBot(signal);
    process.exit(0);
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
