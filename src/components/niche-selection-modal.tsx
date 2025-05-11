"use client"

import { useState } from "react"
import { Shirt, Laptop, Home, Palette, Dumbbell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function NicheSelectionModal() {
  const [open, setOpen] = useState(true)
  const [selectedNiche, setSelectedNiche] = useState<string>("fashion")

  // Reduced to 5 niches as requested
  const niches = [
    { id: "fashion", name: "Fashion", icon: Shirt, description: "Clothing, shoes, and accessories" },
    { id: "electronics", name: "Electronics", icon: Laptop, description: "Gadgets, computers, and smart devices" },
    { id: "home", name: "Home & Garden", icon: Home, description: "Furniture, decor, and garden supplies" },
    { id: "beauty", name: "Beauty", icon: Palette, description: "Makeup, skincare, and personal care" },
    { id: "fitness", name: "Fitness", icon: Dumbbell, description: "Exercise equipment and activewear" },
  ]

  const handleSave = () => {
    console.log(`Selected niche: ${selectedNiche}`)
    setOpen(false)
  }

  const handleNicheSelect = (nicheId: string) => {
    setSelectedNiche(nicheId)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Choose Your E-commerce Niche
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">E-commerce niche selection</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose your e-commerce niche by selecting an option below.
            </p>

            <RadioGroup
              value={selectedNiche}
              onValueChange={setSelectedNiche}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {niches.map((niche) => {
                const Icon = niche.icon
                return (
                  <div
                    key={niche.id}
                    className={`border rounded-md p-4 transition-all cursor-pointer ${
                      selectedNiche === niche.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
                    }`}
                    onClick={() => handleNicheSelect(niche.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <RadioGroupItem value={niche.id} id={niche.id} />
                      <div className="bg-muted rounded-full p-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <label htmlFor={niche.id} className="text-base font-medium cursor-pointer">
                        {niche.name}
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8">{niche.description}</p>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t bg-muted/20">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
