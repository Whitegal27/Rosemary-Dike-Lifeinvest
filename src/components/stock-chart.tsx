"use client"

import { useRef, useEffect } from "react"
import type { StockCandle } from "@/types/stock"

interface StockChartProps {
  data: StockCandle[]
  timeframe: "1D" | "1W" | "1M" | "3M" | "1Y"
}

export default function StockChart({ data, timeframe }: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Find min and max values for scaling
    const prices = data.map((candle) => candle.c)
    const minPrice = Math.min(...prices) * 0.99
    const maxPrice = Math.max(...prices) * 1.01
    const priceRange = maxPrice - minPrice

    // Calculate dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Draw price axis (y-axis)
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1

    // Draw horizontal grid lines
    const numGridLines = 5
    for (let i = 0; i <= numGridLines; i++) {
      const y = padding.top + (chartHeight * i) / numGridLines
      ctx.moveTo(padding.left, y)
      ctx.lineTo(rect.width - padding.right, y)

      // Add price labels
      const price = maxPrice - (i / numGridLines) * priceRange
      ctx.fillStyle = "#64748b"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(price.toFixed(2), padding.left - 5, y + 3)
    }
    ctx.stroke()

    // Draw time axis (x-axis)
    const timeLabels = []
    const numTimeLabels = timeframe === "1D" ? 6 : 5

    for (let i = 0; i < numTimeLabels; i++) {
      const index = Math.floor((data.length - 1) * (i / (numTimeLabels - 1)))
      if (index >= 0 && index < data.length) {
        const timestamp = data[index].t * 1000
        let label = ""

        switch (timeframe) {
          case "1D":
            label = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            break
          case "1W":
          case "1M":
            label = new Date(timestamp).toLocaleDateString([], { month: "short", day: "numeric" })
            break
          case "3M":
          case "1Y":
            label = new Date(timestamp).toLocaleDateString([], { month: "short", year: "2-digit" })
            break
        }

        timeLabels.push({ x: padding.left + (chartWidth * i) / (numTimeLabels - 1), label })
      }
    }

    // Draw time labels
    ctx.fillStyle = "#64748b"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    timeLabels.forEach(({ x, label }) => {
      ctx.fillText(label, x, rect.height - padding.bottom + 15)
    })

    // Draw price line
    ctx.beginPath()
    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 2

    data.forEach((candle, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth
      const y = padding.top + chartHeight - ((candle.c - minPrice) / priceRange) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Add gradient below the line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
    gradient.addColorStop(0, "rgba(37, 99, 235, 0.2)")
    gradient.addColorStop(1, "rgba(37, 99, 235, 0)")

    ctx.beginPath()
    data.forEach((candle, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth
      const y = padding.top + chartHeight - ((candle.c - minPrice) / priceRange) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw current price indicator
    const lastPrice = data[data.length - 1].c
    const lastY = padding.top + chartHeight - ((lastPrice - minPrice) / priceRange) * chartHeight

    ctx.beginPath()
    ctx.arc(padding.left + chartWidth, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = "#2563eb"
    ctx.fill()

    // Add current price label
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(lastPrice.toFixed(2), padding.left + chartWidth - 10, lastY - 10)
  }, [data, timeframe])

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", minHeight: "300px" }} />
}

