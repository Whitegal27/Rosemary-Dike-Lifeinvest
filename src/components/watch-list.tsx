import type { WatchlistItem } from "../types/stock"

interface WatchListProps {
  watchlist: WatchlistItem[]
  onSelectStock: (symbol: string) => void
  onRemoveFromWatchlist: (symbol: string) => void
}

export default function WatchList({ watchlist, onSelectStock, onRemoveFromWatchlist }: WatchListProps) {
  if (watchlist.length === 0) {
    return (
      <div className="watchlist">
        <h2>Your Watchlist</h2>
        <div className="empty-message">Your watchlist is empty. Search for stocks and add them to your watchlist.</div>
      </div>
    )
  }

  return (
    <div className="watchlist">
      <h2>Your Watchlist</h2>
      <div className="watchlist-items">
        {watchlist.map((item) => (
          <div key={item.symbol} className="watchlist-item">
            <div className="watchlist-info" onClick={() => onSelectStock(item.symbol)}>
              <div className="watchlist-symbol">{item.symbol}</div>
              <div className="watchlist-name">{item.companyName}</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => onRemoveFromWatchlist(item.symbol)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .watchlist {
          margin-top: 1rem;
        }
        
        .watchlist-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .watchlist-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.25rem;
          border: 1px solid var(--border-color);
          transition: background-color 0.2s;
        }
        
        .watchlist-item:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        .watchlist-info {
          cursor: pointer;
          flex: 1;
        }
        
        .watchlist-symbol {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .watchlist-name {
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
          border: 1px dashed var(--border-color);
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  )
}

