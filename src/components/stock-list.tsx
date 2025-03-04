import type { Stock } from "../types/stock"

interface StockListProps {
  stocks: Stock[]
  onSelectStock: (stock: Stock) => void
  onAddToWatchlist: (stock: Stock) => void
}

export default function StockList({ stocks, onSelectStock, onAddToWatchlist }: StockListProps) {
  if (stocks.length === 0) {
    return <div className="empty-message">No stocks found</div>
  }

  return (
    <div className="stock-list">
      {stocks.map((stock) => (
        <div key={stock.symbol} className="stock-item">
          <div className="stock-info" onClick={() => onSelectStock(stock)}>
            <div className="stock-symbol">{stock.symbol}</div>
            <div className="stock-name">{stock.description}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onAddToWatchlist(stock)}>
            + Add
          </button>
        </div>
      ))}
      <style jsx>{`
        .stock-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .stock-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.25rem;
          border: 1px solid var(--border-color);
          transition: background-color 0.2s;
        }
        
        .stock-item:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        .stock-info {
          cursor: pointer;
          flex: 1;
        }
        
        .stock-symbol {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .stock-name {
          font-size: 0.875rem;
          color: var(--text-light);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        
        .empty-message {
          color: var(--text-light);
          text-align: center;
          padding: 1rem;
        }
      `}</style>
    </div>
  )
}

