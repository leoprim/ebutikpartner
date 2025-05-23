"use client"

import { useState, useTransition, useEffect } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { createProduct, ProductDraft } from "@/app/actions/products"
import { scrapeAlibabaProduct } from "@/app/actions/alibaba"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

// Place this at the top-level, outside the component and functions
function normalizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  let u = url.trim()
  if (u.startsWith('//')) u = 'https:' + u
  if (!u.startsWith('http')) u = 'https://' + u
  // Remove query params and fragments
  u = u.split('?')[0].split('#')[0]
  return u
}

// Add a list of common niches
const NICHES = [
  "Leksaker",
  "Elektronik",
  "Hem & Hushåll",
  "Skönhet & Hälsa",
  "Hobby",
  "Sport & Utomhus",
  "Husdjur"
]

export default function NewProductPage() {
  const [step, setStep] = useState<"import" | "edit" | "saving">("import")
  const [alibabaUrl, setAlibabaUrl] = useState("")
  const [importError, setImportError] = useState("")
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<ProductDraft | null>(null)
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (loading) {
      setProgress(0)
      let start = Date.now()
      interval = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000
        // Animate to 95% over 15s, then to 99% after 10s
        let pct = Math.min(95, elapsed * 6.5) // ~15s to 95%
        if (elapsed > 10) pct = Math.min(99, pct + (elapsed - 10) * 2)
        setProgress(pct)
      }, 100)
    } else if (!loading && progress > 0) {
      setProgress(100)
      setTimeout(() => setProgress(0), 500)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [loading])

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setImportError("")
    try {
      // Use real Alibaba scraper
      const data = await scrapeAlibabaProduct(alibabaUrl)
      // Normalize main images
      const mainImages = Array.isArray(data.images) ? data.images.map(normalizeUrl).filter((img): img is string => Boolean(img)) : []
      // Collect all variant images
      const variantImagesSet = new Set<string>()
      if (Array.isArray(data.variants)) {
        data.variants.forEach((variant: any) => {
          if (Array.isArray(variant.options)) {
            variant.options.forEach((opt: any) => {
              if (opt.image) {
                const norm = normalizeUrl(opt.image)
                if (norm) variantImagesSet.add(norm)
                // Also normalize the variant image in-place
                opt.image = norm
              }
            })
          }
        })
      }
      // Convert Set to Array for spreading
      const variantImages = Array.from(variantImagesSet)
      // Do NOT merge variant images into main images
      setDraft({
        title: data.title,
        description: data.description,
        images: mainImages, // Only main images, not variant images
        variants: data.variants,
        source_url: alibabaUrl,
      })
      setStep("edit")
    } catch (err: any) {
      setImportError(err?.message || "Kunde inte importera produkt från Alibaba.")
    } finally {
      setLoading(false)
    }
  }

  const handleDraftChange = (field: keyof ProductDraft, value: any) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : prev)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError("")
    setSuccess(false)
    try {
      if (!draft) return
      await createProduct(draft)
      setSuccess(true)
      setStep("import")
      setDraft(null)
      setAlibabaUrl("")
    } catch (err) {
      setSaveError("Kunde inte spara produkten.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="flex flex-col space-y-8 w-full">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Tillbaka till produkter</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-medium">Lägg till produkt</h1>
            <p className="text-muted-foreground">Importera en ny produkt från Alibaba.</p>
          </div>
        </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className={`flex items-center gap-2 ${step === "import" ? "font-medium text-primary" : "text-muted-foreground"}`}>
            <span className="rounded-full w-6 h-6 flex items-center justify-center border border-primary bg-background">1</span>
            <span>Importera</span>
          </div>
          <span className="h-0.5 w-8 bg-border rounded" />
          <div className={`flex items-center gap-2 ${step === "edit" ? "font-medium text-primary" : "text-muted-foreground"}`}>
            <span className="rounded-full w-6 h-6 flex items-center justify-center border border-primary bg-background">2</span>
            <span>Redigera</span>
          </div>
        </div>
        <Card className="shadow-xl border-2 border-border/60">
          <CardHeader className="rounded-t-lg">
            <CardTitle className="text-xl font-medium">{step === "import" ? "Importera produkt" : "Redigera produkt"}</CardTitle>
            <CardDescription>
              {step === "import"
                ? "Klistra in en länk från Alibaba för att importera produktinformation."
                : "Granska och redigera produktens information innan du sparar."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {step === "import" && (
              <form onSubmit={handleImport} className="space-y-8 w-full">
                {/* Progress bar shown when loading or progress > 0 */}
                {(loading || progress > 0) && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="alibaba-url" className="font-medium">Alibaba-länk</label>
                  <Input
                    id="alibaba-url"
                    value={alibabaUrl}
                    onChange={e => setAlibabaUrl(e.target.value)}
                    placeholder="https://www.alibaba.com/product-detail/..."
                    required
                  />
                </div>
                {importError && <div className="text-destructive text-sm">{importError}</div>}
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading || !alibabaUrl} className="w-40">
                    {loading && <ArrowPathIcon className="animate-spin mr-2 h-5 w-5" />}Importera
                  </Button>
                </div>
                {success && <div className="text-green-600 text-sm">Produkten importerades och sparades!</div>}
              </form>
            )}
            {step === "edit" && draft && (
              <form onSubmit={handleSave} className="space-y-8 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="font-medium">Produktnamn</label>
                      <Input
                        value={draft.title}
                        onChange={e => handleDraftChange("title", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium">Nisch</label>
                      <Select
                        value={draft.niche || ""}
                        onValueChange={value => handleDraftChange("niche", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Välj nisch" />
                        </SelectTrigger>
                        <SelectContent>
                          {NICHES.map(niche => (
                            <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      {/* Price and Compare at Price side by side */}
                      <div className="flex gap-4 items-end">
                        <div className="space-y-1 w-32">
                          <label className="font-medium">Pris</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft.price ?? ''}
                            onChange={e => handleDraftChange("price", e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            placeholder="Ord. pris"
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1 w-32">
                          <label className="font-medium">Reapris</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft.compare_at_price ?? ''}
                            onChange={e => handleDraftChange("compare_at_price", e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            placeholder="Jämförpris"
                            className="text-sm"
                          />
                        </div>
                      </div>
                      {/* Description input below price fields */}
                      <div className="space-y-2">
                        <label className="font-medium">Beskrivning</label>
                        <Textarea
                          value={draft.description}
                          onChange={e => handleDraftChange("description", e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="font-medium">Bilder</label>
                      <div className="flex flex-wrap gap-4">
                        {draft.images.map((img, i) => (
                          <div key={i} className="relative w-24 h-24 border rounded overflow-hidden bg-background shadow">
                            <Image src={img} alt="Produktbild" fill className="object-cover" />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10 shadow"
                              onClick={() => handleDraftChange('images', draft.images.filter((_: any, idx: number) => idx !== i))}
                              aria-label="Ta bort bild"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium">Varianter</label>
                      <div className="space-y-2">
                        {draft.variants.map((variant, i) => (
                          <div key={i} className="space-y-1 border rounded p-2 bg-muted/40">
                            <div className="flex items-center justify-between mb-1">
                              <Input
                                value={variant.name}
                                onChange={e => {
                                  const newVariants = [...draft.variants]
                                  newVariants[i].name = e.target.value
                                  handleDraftChange('variants', newVariants)
                                }}
                                className="font-medium w-48"
                                aria-label="Variantgruppens namn"
                              />
                              <button
                                type="button"
                                className="text-red-500 text-xs ml-2"
                                onClick={() => handleDraftChange('variants', draft.variants.filter((_: any, idx: number) => idx !== i))}
                              >
                                Ta bort variantgrupp
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              {variant.options.map((opt: { value: string; image?: string }, j: number) => (
                                <div key={j} className="flex items-center gap-2 border rounded px-2 py-1 bg-background relative shadow-sm">
                                  {opt.image && (
                                    <div className="relative w-8 h-8">
                                      <Image src={opt.image} alt={opt.value} fill className="object-cover rounded" />
                                    </div>
                                  )}
                                  <Input
                                    value={opt.value ?? ""}
                                    onChange={e => {
                                      const newVariants = [...draft.variants]
                                      newVariants[i].options[j].value = e.target.value
                                      handleDraftChange("variants", newVariants)
                                    }}
                                    className="w-32"
                                  />
                                  <button
                                    type="button"
                                    className="text-red-500 text-xs ml-1"
                                    onClick={() => {
                                      const newOptions = variant.options.filter((_: any, idx: number) => idx !== j)
                                      const newVariants = draft.variants.map((v, idx) =>
                                        idx === i ? { ...v, options: newOptions } : v
                                      )
                                      handleDraftChange('variants', newVariants)
                                    }}
                                    aria-label="Ta bort variant"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {saveError && <div className="text-destructive text-sm">{saveError}</div>}
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setStep("import")}>Avbryt</Button>
                  <Button type="submit" disabled={saving} className="w-40">
                    {saving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}Spara produkt
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 