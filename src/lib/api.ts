import type { StockQuote, StockCandle } from "../types/stock"

const ALPHA_VANTAGE_API_KEY = "TLHLGRNS8XNQJACD"
const BASE_URL = "https://www.alphavantage.co/query"
const FINNHUB_API_KEY = "cjvp2k9r01qs8rs6v1lgcjvp2k9r01qs8rs6v1m0"
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1"

async function fetchWithErrorHandling(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`API error (${response.status}):`, errorBody)
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

// Get stock quote
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`
    const data = await fetchWithErrorHandling(url)

    if (data["Error Message"]) {
      throw new Error(data["Error Message"])
    }

    const quote = data["Global Quote"]
    if (!quote) {
      throw new Error("No quote data available")
    }

    return {
      symbol: quote["01. symbol"],
      open: Number.parseFloat(quote["02. open"]),
      high: Number.parseFloat(quote["03. high"]),
      low: Number.parseFloat(quote["04. low"]),
      price: Number.parseFloat(quote["05. price"]),
      volume: Number.parseInt(quote["06. volume"]),
      latestTradingDay: quote["07. latest trading day"],
      previousClose: Number.parseFloat(quote["08. previous close"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
    }
  } catch (error) {
    console.error("Error fetching stock quote:", error)
    throw error
  }
}

// Get stock candles
export async function getStockCandles(symbol: string, resolution: string, from: number): Promise<StockCandle[]> {
  try {
    const to = Math.floor(Date.now() / 1000)
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    const data = await fetchWithErrorHandling(url)

    if (data.s !== "ok") {
      throw new Error(`Failed to fetch candle data: ${data.s}`)
    }

    const candles: StockCandle[] = data.t.map((time: number, index: number) => ({
      t: time,
      o: data.o[index],
      h: data.h[index],
      l: data.l[index],
      c: data.c[index],
      v: data.v[index],
    }))

    return candles
  } catch (error) {
    console.error("Error fetching stock candles:", error)
    throw error
  }
}

