"use client"

import type React from "react"

import { useState } from "react"
import { getStockQuote } from "../lib/api"
import type { StockQuote } from "../types/stock"
import "./globals.css"

export default function Home() {
  const [symbol, setSymbol] = useState("")
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symbol) return

    setIsLoading(true)
    setError(null)
    setQuote(null)

    try {
      const data = await getStockQuote(symbol)
      setQuote(data)
    } catch (err) {
      console.error("Error fetching stock data:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Stock Quote Tracker</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., IBM)"
            className="search-input"
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>
      </header>

      <div className="app-content">
        {error && <div className="error-message">{error}</div>}

        {quote && (
          <div className="stock-quote">
            <h2>{quote.symbol} Stock Quote</h2>
            <p className="quote-date">As of {quote.latestTradingDay}</p>
            <div className="quote-price">
              <span className="current-price">{formatCurrency(quote.price)}</span>
              <span className={`price-change ${quote.change >= 0 ? "price-up" : "price-down"}`}>
                {quote.change >= 0 ? "+" : ""}
                {formatCurrency(quote.change)} ({formatPercentage(quote.changePercent)})
              </span>
            </div>
            <table className="quote-details">
              <tbody>
                <tr>
                  <th>Previous Close</th>
                  <td>{formatCurrency(quote.previousClose)}</td>
                  <th>Open</th>
                  <td>{formatCurrency(quote.open)}</td>
                </tr>
                <tr>
                  <th>Day's Range</th>
                  <td>
                    {formatCurrency(quote.low)} - {formatCurrency(quote.high)}
                  </td>
                  <th>Volume</th>
                  <td>{formatNumber(quote.volume)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {isLoading && <div className="loading-message">Loading stock data...</div>}
      </div>
    </main>
  )
}

