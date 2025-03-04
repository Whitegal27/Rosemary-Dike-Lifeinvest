import type React from "react"
export const metadata = {
  title: "StockTracker - Real-time Stock Tracking",
  description: "Track stock prices, create watchlists, and analyze market trends with StockTracker",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

