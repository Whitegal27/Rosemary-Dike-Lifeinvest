"use client"

import { useState, useEffect, useCallback } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const debouncedSearch = useCallback(
    (value: string) => {
      const handler = setTimeout(() => {
        onSearch(value)
      }, 500)

      return () => {
        clearTimeout(handler)
      }
    },
    [onSearch],
  )

  useEffect(() => {
    if (query.trim()) {
      return debouncedSearch(query)
    } else {
      onSearch("")
    }
  }, [query, debouncedSearch, onSearch])

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a stock symbol or company name..."
        className="search-input"
        disabled={isLoading}
      />
      {isLoading && <div className="search-loader"></div>}
      <style jsx>{`
        .search-container {
          position: relative;
          width: 100%;
          max-width: 500px;
        }
        
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.25rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        
        .search-input::placeholder {
          color: var(--text-light);
        }
        
        .search-loader {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          border: 2px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: translateY(-50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

