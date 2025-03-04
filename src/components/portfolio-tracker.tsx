"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Stock } from "../types/stock"
import { getStockQuote } from "../lib/api"

interface PortfolioItem {
  symbol: string
  companyName: string
  shares: number
  purchasePrice: number
  currentPrice?: number
  value?: number
  gain?: number
  gainPercentage?: number
}

interface PortfolioTrackerProps {
  onSelectStock: (stock: Stock) => void
}

export default function PortfolioTracker({ onSelectStock }: PortfolioTrackerProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [newStock, setNewStock] = useState({ symbol: "", shares: 0, purchasePrice: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalValue, setTotalValue] = useState(0)
  const [totalGain, setTotalGain] = useState(0)
  const [totalInvestment, setTotalInvestment] = useState(0)

  // Load portfolio from localStorage on initial render
  useEffect(() => {
    const savedPortfolio = localStorage.getItem("portfolio")
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio))
      } catch (e) {
        console.error("Failed to parse portfolio from localStorage")
      }
    }
  }, [])

  // Update portfolio prices and calculations
  useEffect(() => {
    const updatePortfolioPrices = async () => {
      if (portfolio.length === 0) return

      setIsLoading(true)
      setError(null)

      try {
        const updatedPortfolio = await Promise.all(
          portfolio.map(async (item) => {
            try {
              const quote = await getStockQuote(item.symbol)
              const currentPrice = quote.currentPrice // Replace 'currentPrice' with the actual property name from StockQuote
              const value = currentPrice ? currentPrice * item.shares : 0
              const gain = currentPrice ? value - item.purchasePrice * item.shares : 0
              const gainPercentage = currentPrice ? ((currentPrice - item.purchasePrice) / item.purchasePrice) * 100 : 0

              return {
                ...item,
                currentPrice,
                value,
                gain,
                gainPercentage,
              }
            } catch (err) {
              console.error(`Error fetching quote for ${item.symbol}:`, err)
              return item
            }
          }),
        )

        setPortfolio(updatedPortfolio)

        // Calculate totals
        let totalVal = 0
        let totalInv = 0
        let totalG = 0

        updatedPortfolio.forEach((item) => {
          if (item.value) totalVal += item.value
          if (item.shares && item.purchasePrice) totalInv += item.shares * item.purchasePrice
          if (item.gain) totalG += item.gain
        })

        setTotalValue(totalVal)
        setTotalInvestment(totalInv)
        setTotalGain(totalG)

        // Save to localStorage
        localStorage.setItem("portfolio", JSON.stringify(updatedPortfolio))
      } catch (err) {
        console.error("Error updating portfolio:", err)
        setError("Failed to update portfolio prices. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    updatePortfolioPrices()

    // Set up interval to update prices every minute
    const intervalId = setInterval(updatePortfolioPrices, 60000)

    return () => clearInterval(intervalId)
  }, [portfolio])

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newStock.symbol || newStock.shares <= 0 || newStock.purchasePrice <= 0) {
      setError("Please enter a valid symbol, number of shares, and purchase price.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Verify the stock symbol exists
      const quote = await getStockQuote(newStock.symbol.toUpperCase())

      // Add to portfolio
      const newItem: PortfolioItem = {
        symbol: newStock.symbol.toUpperCase(),
        companyName: newStock.symbol.toUpperCase(), // We'll update this when we get more data
        shares: newStock.shares,
        purchasePrice: newStock.purchasePrice,
        currentPrice: quote.currentPrice, // Replace 'currentPrice' with the actual property name from StockQuote
        value: quote.currentPrice ? quote.currentPrice * newStock.shares : 0,
        gain: quote.currentPrice ? quote.currentPrice * newStock.shares - newStock.purchasePrice * newStock.shares : 0,
        gainPercentage: quote.currentPrice ? ((quote.currentPrice - newStock.purchasePrice) / newStock.purchasePrice) * 100 : 0,
      }

      const updatedPortfolio = [...portfolio, newItem]
      setPortfolio(updatedPortfolio)
      localStorage.setItem("portfolio", JSON.stringify(updatedPortfolio))

      // Reset form
      setNewStock({ symbol: "", shares: 0, purchasePrice: 0 })
    } catch (err) {
      console.error("Error adding stock:", err)
      setError("Failed to add stock. Please check the symbol and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveStock = (symbol: string) => {
    const updatedPortfolio = portfolio.filter((item) => item.symbol !== symbol)
    setPortfolio(updatedPortfolio)
    localStorage.setItem("portfolio", JSON.stringify(updatedPortfolio))
  }

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
    <div className="portfolio-tracker">
      <h2>Your Portfolio</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="portfolio-summary">
        <div className="summary-item">
          <span className="summary-label">Total Value</span>
          <span className="summary-value">{formatCurrency(totalValue)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Investment</span>
          <span className="summary-value">{formatCurrency(totalInvestment)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Gain/Loss</span>
          <span className={`summary-value ${totalGain >= 0 ? "price-up" : "price-down"}`}>
            {formatCurrency(totalGain)} ({formatPercentage((totalGain / totalInvestment) * 100)})
          </span>
        </div>
      </div>

      <form onSubmit={handleAddStock} className="add-stock-form">
        <h3>Add Stock to Portfolio</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="symbol">Symbol</label>
            <input
              type="text"
              id="symbol"
              value={newStock.symbol}
              onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
              placeholder="e.g. AAPL"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="shares">Shares</label>
            <input
              type="number"
              id="shares"
              value={newStock.shares || ""}
              onChange={(e) => setNewStock({ ...newStock, shares: Number.parseFloat(e.target.value) })}
              placeholder="Number of shares"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Purchase Price</label>
            <input
              type="number"
              id="price"
              value={newStock.purchasePrice || ""}
              onChange={(e) => setNewStock({ ...newStock, purchasePrice: Number.parseFloat(e.target.value) })}
              placeholder="Price per share"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Stock"}
          </button>
        </div>
      </form>

      {portfolio.length === 0 ? (
        <div className="empty-message">Your portfolio is empty. Add stocks to track your investments.</div>
      ) : (
        <div className="portfolio-table-container">
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Purchase Price</th>
                <th>Current Price</th>
                <th>Value</th>
                <th>Gain/Loss</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => (
                <tr key={item.symbol}>
                  <td
                    className="stock-symbol-cell"
                    onClick={() =>
                      onSelectStock({
                        symbol: item.symbol,
                        description: item.companyName,
                        displaySymbol: item.symbol,
                        type: "Common Stock",
                      })
                    }
                  >
                    {item.symbol}
                  </td>
                  <td>{item.shares}</td>
                  <td>{formatCurrency(item.purchasePrice)}</td>
                  <td>{item.currentPrice ? formatCurrency(item.currentPrice) : "-"}</td>
                  <td>{item.value ? formatCurrency(item.value) : "-"}</td>
                  <td className={item.gain && item.gain >= 0 ? "price-up" : "price-down"}>
                    {item.gain ? (
                      <>
                        {formatCurrency(item.gain)} ({formatPercentage(item.gainPercentage || 0)})
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveStock(item.symbol)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .portfolio-tracker {
          margin-top: 2rem;
        }
        
        .portfolio-tracker h2 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        
        .portfolio-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .summary-item {
          background-color: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 0.25rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
        }
        
        .summary-label {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-bottom: 0.25rem;
        }
        
        .summary-value {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .add-stock-form {
          background-color: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 0.25rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .add-stock-form h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          align-items: flex-end;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-bottom: 0.25rem;
        }
        
        .form-group input {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .portfolio-table-container {
          overflow-x: auto;
        }
        
        .portfolio-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .portfolio-table th,
        .portfolio-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        
        .portfolio-table th {
          font-weight: 600;
          color: var(--text-light);
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        
        .stock-symbol-cell {
          font-weight: 600;
          cursor: pointer;
          color: var(--primary-color);
        }
        
        .stock-symbol-cell:hover {
          text-decoration: underline;
        }
        
        .empty-message {
          color: var(--text-light);
          text-align: center;
          padding: 2rem;
          border: 1px dashed var(--border-color);
          border-radius: 0.25rem;
        }
        
        @media (max-width: 768px) {
          .portfolio-summary {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

