"use client"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { PlusCircle, Search, MoreVertical } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { deleteProduct } from "@/app/actions/products"
import { useState, useEffect } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const NICHES = [
  "Leksaker",
  "Elektronik",
  "Hem & Hushåll",
  "Skönhet & Hälsa",
  "Hobby",
  "Sport & Utomhus",
  "Husdjur"
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get() { return undefined } } }
      )
      const { data } = await supabase
        .from("products")
        .select("id, title, description, created_at, niche, images, price")
        .order("created_at", { ascending: false })
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const [productList, setProductList] = useState<any[]>([])

  useEffect(() => {
    setProductList(products)
  }, [products])

  const [selectedNiche, setSelectedNiche] = useState<string>("ALL")

  // Debug log
  console.log("Product niches:", productList.map(p => p.niche));
  console.log("Selected niche:", selectedNiche);

  // More forgiving filter: includes match, case-insensitive
  const filteredProducts = selectedNiche !== "ALL"
    ? productList.filter((p: any) =>
        (p.niche || "").toLowerCase().includes(selectedNiche.toLowerCase())
      )
    : productList

  async function handleDelete(id: string) {
    if (confirm("Är du säker på att du vill ta bort produkten?")) {
      await deleteProduct(id)
      setProductList(productList.filter((p: any) => p.id !== id))
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Laddar produkter...</div>

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium">Produkter</h1>
            <p className="text-muted-foreground">Hantera alla uppladdade produkter och importera nya från Alibaba.</p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4 text-white" />
              Lägg till produkt
            </Link>
          </Button>
        </div>

        <Card>

          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex w-full items-center space-x-2 sm:w-auto">
                  <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Sök efter produktnamn..." className="w-full pl-8" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-medium whitespace-nowrap">Nisch:</label>
                    <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Alla nischer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Alla nischer</SelectItem>
                        {NICHES.map(niche => (
                          <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Filter</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filtrera efter</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Namn (A-Ö)</DropdownMenuItem>
                      <DropdownMenuItem>Senast tillagd</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {filteredProducts && filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Bild</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Namn</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nisch</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Beskrivning</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Skapad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pris</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Åtgärd</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredProducts.map((product: any) => {
                        // Find all variant images
                        let variantImages: string[] = [];
                        if (Array.isArray(product.variants) && product.variants.length > 0) {
                          for (const variant of product.variants) {
                            if (Array.isArray(variant.options)) {
                              for (const opt of variant.options) {
                                if (opt.image) variantImages.push(opt.image);
                              }
                            }
                          }
                        }
                        // Filter out variant images from main images
                        const mainImages = Array.isArray(product.images)
                          ? product.images.filter((img: string) => !variantImages.includes(img))
                          : [];
                        const thumbnail = mainImages[0] || (Array.isArray(product.images) ? product.images[0] : undefined);
                        return (
                          <tr
                            key={product.id}
                            className="cursor-pointer hover:bg-muted transition-colors group"
                            onClick={e => {
                              // Prevent row click if dropdown menu is clicked
                              if ((e.target as HTMLElement).closest('[role="menu"]')) return;
                              window.location.href = `/admin/products/${product.id}/edit`;
                            }}
                          >
                            <td className="px-2 py-2">
                              {thumbnail ? (
                                <img src={thumbnail} alt={product.title} className="w-12 h-12 object-cover rounded border" />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">—</div>
                              )}
                            </td>
                            <td className="px-4 py-2 font-medium">{product.title}</td>
                            <td className="px-4 py-2">{product.niche || <span className="text-muted-foreground">—</span>}</td>
                            <td className="px-4 py-2 max-w-xs truncate">{product.description}</td>
                            <td className="px-4 py-2">{new Date(product.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-2">{
                              typeof product.price === 'number'
                                ? product.price.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })
                                : (typeof product.price === 'string' && product.price.trim().startsWith('$'))
                                  ? Number(product.price.replace(/[^\d.]/g, '')).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })
                                  : <span className="text-muted-foreground">—</span>
                            }</td>
                            <td className="text-right" onClick={e => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/products/${product.id}/edit`}>Redigera</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive focus:text-destructive">Ta bort</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                  Inga produkter matchar filtret.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 