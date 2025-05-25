"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { sv } from 'date-fns/locale'

interface DatePickerProps {
  date: Date | DateRange | undefined
  onDateChange: (date: Date | DateRange | undefined) => void
  mode?: 'single' | 'range'
}

const DatePicker = ({ date, onDateChange, mode = 'single' }: DatePickerProps) => {
  function getLabel() {
    if (mode === 'range') {
      const range = date as DateRange | undefined
      if (range?.from && range?.to) {
        return `${format(range.from, 'PPP', { locale: sv })} - ${format(range.to, 'PPP', { locale: sv })}`
      } else if (range?.from) {
        return format(range.from, 'PPP', { locale: sv })
      } else {
        return <span>Välj ett datumintervall</span>
      }
    } else {
      return date ? format(date as Date, 'PPP', { locale: sv }) : <span>Välj ett datum</span>
    }
  }

  // Quick select handlers
  const handleToday = () => {
    const today = new Date()
    if (mode === 'range') {
      onDateChange({ from: today, to: undefined })
    } else {
      onDateChange(today)
    }
  }
  const handleYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (mode === 'range') {
      onDateChange({ from: yesterday, to: undefined })
    } else {
      onDateChange(yesterday)
    }
  }
  const handleLast30Days = () => {
    const today = new Date()
    const from = new Date()
    from.setDate(today.getDate() - 29)
    if (mode === 'range') {
      onDateChange({ from, to: today })
    } else {
      onDateChange(today)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex gap-2 px-4 pt-4 pb-2">
          <Button variant="ghost" size="sm" onClick={handleToday}>Idag</Button>
          <Button variant="ghost" size="sm" onClick={handleYesterday}>Igår</Button>
          <Button variant="ghost" size="sm" onClick={handleLast30Days}>Senaste 30 dagarna</Button>
        </div>
        {mode === 'range' ? (
          <Calendar
            mode="range"
            selected={date as DateRange | undefined}
            onSelect={onDateChange as (range: DateRange | undefined) => void}
            initialFocus
          />
        ) : (
          <Calendar
            mode="single"
            selected={date as Date | undefined}
            onSelect={onDateChange as (date: Date | undefined) => void}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

export type { DateRange }
export default DatePicker
