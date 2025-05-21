"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { updateProduct } from "@/app/actions/products"
import { createServerClient } from '@supabase/ssr'

const NICHES = [
  "Leksaker",
  "Elektronik",
  "Hem & Hushåll",
  "Skönhet & Hälsa",
  "Hobby",
  "Sport & Utomhus",
  "Husdjur"
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [draft, setDraft] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get() { return undefined } } }
      )
      const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single()
      if (data) setDraft(data)
      setLoading(false)
    }
    if (params.id) fetchProduct()
  }, [params.id])

  const handleDraftChange = (field: string, value: any) => {
    setDraft((prev: any) => prev ? { ...prev, [field]: value } : prev)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError("")
    setSuccess(false)
    try {
      if (!draft) return
      await updateProduct(draft.id, draft)
      setSuccess(true)
      router.push("/admin/products")
    } catch (err) {
      setSaveError("Kunde inte spara ändringarna.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !draft) return <div className="p-8 text-center text-muted-foreground">Laddar produkt...</div>

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
            <h1 className="text-3xl font-medium">Redigera produkt</h1>
            <p className="text-muted-foreground">Ändra produktinformation.</p>
          </div>
        </div>
        <Card className="shadow-xl border-2 border-border/60">

          <CardContent className="space-y-8">
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
                      <label className="font-medium">Ordinarie pris</label>
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
                  <div className="space-y-2">
                    <label className="font-medium">Beskrivning</label>
                    <Textarea
                      value={draft.description}
                      onChange={e => handleDraftChange("description", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-medium">Bilder</label>
                    <div className="flex flex-wrap gap-4">
                      {draft.images.map((img: string, i: number) => (
                        <div key={i} className="relative w-24 h-24 border rounded-lg overflow-hidden bg-background shadow">
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
                      {draft.variants.map((variant: any, i: number) => (
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
                                    const newVariants = draft.variants.map((v: any, idx: number) =>
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
                <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Avbryt</Button>
                <Button type="submit" disabled={saving} className="w-40">
                  {saving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}Spara ändringar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 