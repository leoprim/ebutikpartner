"use client"
import DatePicker, { DateRange } from "@/components/date-picker"
import { useState, useEffect } from "react"

interface DashboardHeaderProps {
  onRangeChange?: (range: DateRange | undefined) => void
}

export default function DashboardHeader({ onRangeChange }: DashboardHeaderProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dashboardDateRange') : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object' && parsed.from) {
          parsed.from = new Date(parsed.from)
          if (parsed.to) parsed.to = new Date(parsed.to)
          setSelectedRange(parsed)
          if (onRangeChange) onRangeChange(parsed)
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (selectedRange && selectedRange.from) {
      localStorage.setItem('dashboardDateRange', JSON.stringify(selectedRange))
      if (onRangeChange) onRangeChange(selectedRange)
    }
  }, [selectedRange])

  const handleRangeChange = (date: DateRange | Date | undefined) => {
    if (!date || (typeof date === 'object' && 'from' in date)) {
      setSelectedRange(date as DateRange | undefined)
    }
  }

  return (
    <div className="flex items-center gap-4 justify-between">
      <div className="flex flex-col">
        <h1 className="text-2xl font-medium">Instrumentpanel</h1>
        <span className="text-muted-foreground text-sm">Översikt över plattformens statistik och aktivitet</span>
      </div>
      <div className="flex items-center gap-2">
        <DatePicker date={selectedRange} onDateChange={handleRangeChange} mode="range" />
      </div>
    </div>
  )
} 