"use client"

import { useState } from "react"
import { Shirt, Laptop, Home, Palette, Dumbbell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NicheSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNicheSelect: (niche: string) => void
}

export default function NicheSelectionModal({ open, onOpenChange, onNicheSelect }: NicheSelectionModalProps) {
  const [selectedNiche, setSelectedNiche] = useState<string>("fashion")

  // Reduced to 5 niches as requested
  const niches = [
    { id: "leksaker", name: "Leksaker", icon: Shirt, description: "Clothing, shoes, and accessories" },
    { id: "elektronik", name: "Elektronik", icon: Laptop, description: "Gadgets, computers, and smart devices" },
    { id: "hem", name: "Hem & Trädgård", icon: Home, description: "Furniture, decor, and garden supplies" },
    { id: "hälsa", name: "Hälsa & Skönhet", icon: Palette, description: "Makeup, skincare, and personal care" },
    { id: "träning", name: "Träning", icon: Dumbbell, description: "Exercise equipment and activewear" },
  ]

  const handleSave = () => {
    onNicheSelect(selectedNiche)
  }

  const handleNicheSelect = (nicheId: string) => {
    setSelectedNiche(nicheId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-medium">Välj din butiksnisch</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Välj en nisch för din butik. Detta hjälper oss att anpassa butikens tema och produkter.
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

        <div className="gap-2 p-4 border-t bg-muted/20 w-full">

          <Button onClick={handleSave} className="w-full">Spara</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
