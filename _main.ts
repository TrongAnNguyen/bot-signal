import { binance } from "ccxt";
import { RSI } from "technicalindicators";

// 1. Cấu hình sàn giao dịch (Sử dụng Binance làm ví dụ)
const exchange = new binance({
  enableRateLimit: true,
});

// 2. Hàm lấy dữ liệu nến (OHLCV)
async function fetchCandles(
  symbol: string,
  timeframe: string = "1h",
  limit: number = 100,
) {
  try {
    const candles = await exchange.fetchOHLCV(
      symbol,
      timeframe,
      undefined,
      limit,
    );
    // Trả về mảng giá đóng cửa (Close prices), lọc bỏ các giá trị null/undefined
    return candles
      .map((candle: any) => candle[4] as number)
      .filter((price: any): price is number => price != null);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return [];
  }
}

// 3. Logic kiểm tra tín hiệu RSI
async function checkRSISignal(symbol: string) {
  console.log(`--- Đang quét tín hiệu cho ${symbol} ---`);

  const closePrices = await fetchCandles(symbol);

  if (closePrices.length < 14) return;

  const inputRSI = {
    values: closePrices,
    period: 14,
  };

  const rsiValues = RSI.calculate(inputRSI);
  if (rsiValues.length < 2) return;

  const currentRSI = rsiValues[rsiValues.length - 1];
  const prevRSI = rsiValues[rsiValues.length - 2];

  if (currentRSI === undefined || prevRSI === undefined) return;

  console.log(`RSI hiện tại: ${currentRSI.toFixed(2)}`);

  // Ví dụ logic đơn giản: RSI đi vào vùng quá bán (< 30)
  if (currentRSI < 30) {
    console.log(
      `🚀 TÍN HIỆU MUA: ${symbol} đang quá bán (RSI: ${currentRSI.toFixed(2)})`,
    );
    // Tại đây bạn có thể gọi hàm gửi Telegram Notification
  }
  // Tín hiệu test lại điểm giao cắt (giống ảnh AVAX của bạn)
  else if (prevRSI < 50 && currentRSI >= 50) {
    console.log(`📈 TÍN HIỆU ĐỘNG LƯỢNG: RSI vừa cắt lên mức 50 cho ${symbol}`);
  }
}

// 4. Chạy bot định kỳ mỗi 1 phút
async function startBot() {
  const symbols = ["BTC/USDT", "AVAX/USDT", "ETH/USDT"];

  for (const symbol of symbols) {
    await checkRSISignal(symbol);
  }
}

// Chạy thử nghiệm
console.log("Bot bắt đầu hoạt động...");
setInterval(startBot, 10000); // 60 giây quét một lần
startBot();
