// Stock search result
export interface Stock {
  description: string
  displaySymbol: string
  symbol: string
  type: string
}

// Stock quote
export interface StockQuote {
  symbol: string
  open: number
  high: number
  low: number
  price: number  // Latest stock price
  volume: number
  latestTradingDay: string
  previousClose: number
  change: number
  changePercent: number
  currentPrice?: number  // Added currentPrice as an optional field
}

// Stock candle for chart
export interface StockCandle {
  t: number // Timestamp
  o: number // Open
  h: number // High
  l: number // Low
  c: number // Close
  v: number // Volume
}

// Watchlist item
export interface WatchlistItem {
  symbol: string
  companyName: string
  addedAt: string
}

// Financial Report structure
export interface FinancialReport {
  symbol: string
  data: FinancialData[]
}

// Financial Data per report
export interface FinancialData {
  accessNumber: string
  symbol: string
  cik: string
  year: number
  quarter: number
  form: string
  startDate: string
  endDate: string
  filedDate: string
  acceptedDate: string
  report: {
    bs: BalanceSheet
    cf: CashFlow
    ic: IncomeStatement
  }
}

// Balance Sheet structure
export interface BalanceSheet {
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  // Additional fields can be added as needed
}

// Cash Flow statement structure
export interface CashFlow {
  totalCashFromOperatingActivities: number
  capitalExpenditures: number
  // Additional fields can be added as needed
}

// Income Statement structure
export interface IncomeStatement {
  totalRevenue: number
  costOfRevenue: number
  grossProfit: number
  netIncome: number
  // Additional fields can be added as needed
}
