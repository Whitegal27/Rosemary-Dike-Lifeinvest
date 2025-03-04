"use client"

import { useState, useEffect } from "react"
import type { Stock, StockQuote, StockCandle } from "../types/stock"
import { getStockQuote, getStockCandles } from "../lib/api"
import StockChart from "./stock-chart"

interface StockDetailProps {
  stock: Stock
  isInWatchlist: boolean
  onAddToWatchlist: () => void
  onRemoveFromWatchlist: () => void
}

export default function StockDetail({
  stock,
  isInWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}: StockDetailProps) {
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [candles, setCandles] = useState<StockCandle[] | null>(null)
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch quote data (real-time)
        const quoteData = await getStockQuote(stock.symbol)
        setQuote(quoteData)

        // Fetch candle data (historical) based on timeframe
        let resolution = "D"
        let from = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 // Default: 1 month

        switch (timeframe) {
          case "1D":
            resolution = "5"
            from = Math.floor(Date.now() / 1000) - 24 * 60 * 60
            break
          case "1W":
            resolution = "60"
            from = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
            break
          case "1M":
            resolution = "D"
            from = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
            break
          case "3M":
            resolution = "D"
            from = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60
            break
          case "1Y":
            resolution = "W"
            from = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60
            break
        }

        const candleData = await getStockCandles(stock.symbol, resolution, from)
        setCandles(candleData)
      } catch (err) {
        console.error("Error fetching stock data:", err)
        setError("Failed to load stock data. Please check your internet connection and try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStockData()
  }, [stock.symbol, timeframe])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  return (
    <div className="stock-detail">
      <div className="stock-header">
        <div className="stock-title">
          <h2>
            {stock.description} ({stock.symbol})
          </h2>
          {quote && (
            <div className="stock-price">
              <span className="current-price">{formatCurrency(quote.price)}</span>
              <span className={`price-change ${quote.changePercent >= 0 ? "price-up" : "price-down"}`}>
                {quote.changePercent >= 0 ? "+" : ""}
                {formatCurrency(quote.change)} ({formatPercentage(quote.changePercent)})
              </span>
            </div>
          )}
        </div>
        <div className="stock-actions">
          {isInWatchlist ? (
            <button className="btn btn-danger" onClick={onRemoveFromWatchlist}>
              Remove from Watchlist
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onAddToWatchlist}>
              Add to Watchlist
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading stock data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setTimeframe(timeframe)} className="btn btn-primary">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="chart-timeframe">
            {(["1D", "1W", "1M", "3M", "1Y"] as const).map((tf) => (
              <button
                key={tf}
                className={`timeframe-btn ${timeframe === tf ? "active" : ""}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="chart-container">
            {candles && candles.length > 0 ? (
              <StockChart data={candles} timeframe={timeframe} />
            ) : (
              <div className="no-data-message">No chart data available for this timeframe</div>
            )}
          </div>

          {quote && (
            <div className="stock-info-grid">
              <div className="info-item">
                <span className="info-label">Open</span>
                <span className="info-value">{formatCurrency(quote.open)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">High</span>
                <span className="info-value">{formatCurrency(quote.high)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Low</span>
                <span className="info-value">{formatCurrency(quote.low)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Prev. Close</span>
                <span className="info-value">{formatCurrency(quote.previousClose)}</span>
              </div>
            </div>
          )}
        </>
      )}
      <style jsx>{`
        .stock-detail {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .stock-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        
        .stock-title h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .stock-price {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .current-price {
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .price-change {
          font-size: 1rem;
          font-weight: 500;
        }
        
        .chart-timeframe {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .timeframe-btn {
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          border: 1px solid var(--border-color);
          background-color: transparent;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .timeframe-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .timeframe-btn.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        .chart-container {
          flex: 1;
          min-height: 300px;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.25rem;
          padding: 1rem;
        }
        
        .stock-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          padding: 0.75rem;
          border-radius: 0.25rem;
          border: 1px solid var(--border-color);
        }
        
        .info-label {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-bottom: 0.25rem;
        }
        
        .info-value {
          font-size: 1rem;
          font-weight: 500;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }
        
        .loader {
          width: 2rem;
          height: 2rem;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .no-data-message {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-light);
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 768px) {
          .stock-header {
            flex-direction: column;
          }
          
          .stock-actions {
            margin-top: 1rem;
            width: 100%;
          }
          
          .stock-actions button {
            width: 100%;
          }
          
          .stock-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}

