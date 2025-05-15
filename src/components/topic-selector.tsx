"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface TopicSelectorProps {
  onTopicChange: (topic: string) => void
}

const topics = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "beauty", label: "Beauty & Cosmetics" },
  { value: "home", label: "Home & Decor" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "food", label: "Food & Beverages" },
  { value: "health", label: "Health & Wellness" },
  { value: "jewelry", label: "Jewelry & Accessories" },
  { value: "pets", label: "Pets" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "toys", label: "Toys & Games" },
  { value: "seasonal", label: "Seasonal & Holiday" },
  { value: "ecommerce", label: "E-commerce Tips" },
  { value: "marketing", label: "Marketing Strategies" },
  { value: "customer", label: "Customer Experience" },
  { value: "trends", label: "Industry Trends" },
]

const TopicSelector = ({ onTopicChange }: TopicSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? topics.find((topic) => topic.value === value)?.label : "Select topic..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search topic..." />
          <CommandList>
            <CommandEmpty>No topic found.</CommandEmpty>
            <CommandGroup>
              {topics.map((topic) => (
                <CommandItem
                  key={topic.value}
                  value={topic.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue)
                    onTopicChange(topic.label)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === topic.value ? "opacity-100" : "opacity-0")} />
                  {topic.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default TopicSelector
