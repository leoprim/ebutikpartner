"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function AnimatedInput({ label, ...props }: AnimatedInputProps) {
  const id = useId()
  
  const handleContainerClick = (e: React.MouseEvent) => {
    // Only focus if clicking on the container, not the input itself
    // This prevents double-focusing issues
    if (e.target === e.currentTarget) {
      const input = document.getElementById(id) as HTMLInputElement | null
      if (input) {
        input.focus()
      }
    }
  }
  
  return (
    <div 
      className="group relative cursor-text" 
      onClick={handleContainerClick}
    >
      <label
        htmlFor={id}
        className="origin-start text-muted-foreground/70 group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm transition-all group-focus-within:top-0 group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium pointer-events-none"
      >
        <span className="bg-background inline-flex px-2">
          {label}
        </span>
      </label>
      <Input 
        id={id} 
        placeholder=" " 
        className="h-12" 
        {...props} 
      />
    </div>
  )
} 