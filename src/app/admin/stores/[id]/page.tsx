"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { ArrowLeft, Calendar, Clock, DollarSign, Mail, Package, ShoppingBag, Tag, User, Settings, Palette, Truck } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpdateStoreForm } from "./update-store-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"
import { updateShopifyCredentials } from '@/app/actions/store-orders'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import Image from "next/image"

const STEPS = [
  { id: 'setup', label: 'Konfiguration', icon: Settings, value: 0 },
  { id: 'design', label: 'Butiksdesign', icon: Palette, value: 33 },
  { id: 'content', label: 'Produkt & Innehåll', icon: Package, value: 66 },
  { id: 'deliver', label: 'Levererad', icon: Truck, value: 100 }
] as const

// Use the same NICHES as on the products page
const NICHES = [
  "Leksaker",
  "Elektronik",
  "Hem & Hushåll",
  "Skönhet & Hälsa",
  "Hobby",
  "Sport & Utomhus",
  "Husdjur"
]

interface StoreOrder {
  id: string
  store_name: string
  client_name: string
  client_email: string
  order_date: string
  status: 'Väntar' | 'Under utveckling' | 'Granska' | 'Levererad'
  price: number
  niche: string
  description: string
  requirements: string[]
  progress: number
  timeline: {
    date: string
    event: string
    completed: boolean
  }[]
  current_step?: 'setup' | 'design' | 'content' | 'deliver'
  shopify_domain?: string
  shopify_access_token?: string
  user_id?: string
}

function ProductCombobox({ products, value, onChange, loading }: {
  products: any[],
  value: string,
  onChange: (id: string) => void,
  loading: boolean
}) {
  const [open, setOpen] = useState(false)
  const [niche, setNiche] = useState<string>("all")
  const selectedProduct = products.find(p => p.id === value)

  // Filter products by selected niche (case-insensitive, trims whitespace, partial match)
  const filteredProducts =
    niche === "all"
      ? products
      : products.filter(p =>
          (p.niche || "").trim().toLowerCase().includes(niche.trim().toLowerCase())
        )

  // Helper for thumbnail
  const getThumbnail = (product: any) => {
    if (product.images && Array.isArray(product.images) && product.images[0] && typeof product.images[0] === 'string' && product.images[0].startsWith('http')) {
      return <Image src={product.images[0]} alt="" width={28} height={28} className="rounded object-cover" />
    }
    return <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">—</div>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate max-w-[320px] block">
            {selectedProduct ? (
              <span className="flex items-center gap-2">
                {getThumbnail(selectedProduct)}
                {selectedProduct.title}
              </span>
            ) : "Välj produkt..."}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        {/* Niche filter - always visible */}
        <div className="p-2 border-b flex items-center gap-2">
          <span className="text-sm">Nisch:</span>
          <Select value={niche} onValueChange={setNiche}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              {NICHES.map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Command>
          <CommandInput placeholder="Sök produkt..." />
          <CommandList>
            {loading ? (
              <CommandItem disabled>Laddar produkter...</CommandItem>
            ) : (
              <>
                <CommandEmpty>Inga produkter hittades.</CommandEmpty>
                {filteredProducts.map(product => (
                  <CommandItem
                    key={product.id}
                    value={product.title}
                    onSelect={() => {
                      onChange(product.id)
                      setOpen(false)
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {getThumbnail(product)}
                      <span className="truncate max-w-[220px] block">{product.title}</span>
                    </span>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function StoreDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [storeDetails, setStoreDetails] = useState<StoreOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [shopifyDomain, setShopifyDomain] = useState<string>("")
  const [shopifyAccessToken, setShopifyAccessToken] = useState<string>("")
  const [shopifySaving, setShopifySaving] = useState(false)
  const [shopifySuccess, setShopifySuccess] = useState(false)
  const [shopifyError, setShopifyError] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false)
  const [customerFullName, setCustomerFullName] = useState<string>("")

  useEffect(() => {
    if (params?.id) {
      setStoreId(params.id)
    }
  }, [params])

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails()
    }
  }, [storeId])

  useEffect(() => {
    if (storeDetails) {
      setShopifyDomain(storeDetails.shopify_domain ?? "")
      setShopifyAccessToken(storeDetails.shopify_access_token ?? "")
    }
  }, [storeDetails])

  useEffect(() => {
    const supabase = createClientComponentClient()
    supabase.from('products').select('id, title, niche, images').then(({ data }) => {
      setProducts(data || [])
      setProductsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (storeDetails && storeDetails.user_id) {
      const fetchFullName = async () => {
        const { data: meta } = await supabase.rpc('get_user_metadata', { user_id: storeDetails.user_id })
        setCustomerFullName(meta?.full_name || meta?.name || storeDetails.client_name || "Okänd kund")
      }
      fetchFullName()
    }
  }, [storeDetails])

  const fetchStoreDetails = async () => {
    if (!storeId) return

    try {
      const { data, error } = await supabase
        .from('store_orders')
        .select('*')
        .eq('id', storeId)
        .single()

      if (error) throw error

      // Create a timeline based on the order's progress
      const timeline = [
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Order received', completed: true },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Initial setup', completed: data.progress >= 25 },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Theme customization', completed: data.progress >= 50 },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Product setup', completed: data.progress >= 75 },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Final review', completed: data.progress >= 90 },
        { date: new Date(data.order_date).toLocaleDateString(), event: 'Store delivery', completed: data.status === 'delivered' },
      ]

      setStoreDetails({ ...data, timeline })
      setProgress(data.progress)
    } catch (error) {
      console.error('Error fetching store details:', error)
      toast.error('Failed to load store details')
      router.push('/admin/stores')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeliver = async () => {
    if (!storeDetails) return

    try {
      const { error } = await supabase
        .from('store_orders')
        .update({ status: 'delivered', progress: 100 })
        .eq('id', storeDetails.id)

      if (error) throw error

      toast.success('Store marked as delivered')
      fetchStoreDetails()
    } catch (error) {
      console.error('Error delivering store:', error)
      toast.error('Failed to update store status')
    }
  }

  const getCurrentStep = (progress: number) => {
    return STEPS.find(step => step.value >= progress) || STEPS[0]
  }

  const handleProgressChange = async (value: number[]) => {
    if (!storeId) return

    const newProgress = value[0]
    const currentStep = getCurrentStep(newProgress)
    
    try {
      const { data, error } = await supabase
        .from('store_orders')
        .update({
          progress: currentStep.value,
          status: currentStep.id === 'deliver' ? 'Levererad' : 'Under utveckling',
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId)

      if (error) {
        console.error('Error updating progress:', error)
        toast.error('Failed to update progress')
        return
      }

      // Fetch the updated record
      const { data: updatedData, error: fetchError } = await supabase
        .from('store_orders')
        .select('*')
        .eq('id', storeId)
        .single()

      if (fetchError) {
        console.error('Error fetching updated data:', fetchError)
        return
      }

      toast.success('Förloppet har uppdaterats')
      setProgress(currentStep.value)
      setStoreDetails(prev => prev ? {
        ...prev,
        progress: currentStep.value,
        status: currentStep.id === 'deliver' ? 'Levererad' : 'Under utveckling'
      } : null)
    } catch (error) {
      console.error('Error in handleProgressChange:', error)
      toast.error('Failed to update progress')
    }
  }

  const handleNextStep = () => {
    const currentStepIndex = STEPS.findIndex(step => step.value === progress)
    if (currentStepIndex < STEPS.length - 1) {
      handleProgressChange([STEPS[currentStepIndex + 1].value])
    }
  }

  const handleShopifySave = async () => {
    setShopifySaving(true)
    setShopifyError("")
    setShopifySuccess(false)
    try {
      await updateShopifyCredentials(storeDetails!.id, shopifyDomain, shopifyAccessToken)
      setShopifySuccess(true)
      // If the domain matches *.myshopify.com, update the store name
      const match = shopifyDomain.match(/^([^.]+)\.myshopify\.com$/)
      let newName = storeDetails!.store_name
      if (match) {
        newName = match[1]
        // Update in Supabase
        await supabase
          .from('store_orders')
          .update({ store_name: newName })
          .eq('id', storeDetails!.id)
      }
      // Update local state for domain, token, and possibly name
      setStoreDetails(prev => prev ? {
        ...prev,
        shopify_domain: shopifyDomain,
        shopify_access_token: shopifyAccessToken,
        store_name: newName
      } : prev)
    } catch (err: any) {
      setShopifyError(err?.message || "Kunde inte spara Shopify-uppgifter.")
    } finally {
      setShopifySaving(false)
    }
  }

  const handleUpload = async () => {
    if (!storeDetails) return;
    setUploading(true)
    setUploadError("")
    setUploadSuccess(false)
    try {
      const res = await fetch('/api/admin/upload-to-shopify', {
        method: 'POST',
        body: JSON.stringify({
          orderId: storeDetails.id,
          productId: selectedProductId,
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error(await res.text())
      setUploadSuccess(true)
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return <div>Laddar...</div>
  }

  if (!storeDetails) {
    return <div>Store not found</div>
  }

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/stores">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Tillbaka till butiker</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-medium md:text-3xl">{storeDetails.store_name}</h1>
            <p className="text-muted-foreground">Ordernummer: {storeDetails.id}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!(storeDetails.shopify_domain && storeDetails.shopify_access_token) && (
              <Button variant="default" onClick={() => setShopifyModalOpen(true)}>
                <Image src="/shopify-logo-svgrepo-com.svg" alt="Shopify" height={20} width={20} className="mr-2" />
                Koppla butik
              </Button>
            )}
          </div>
        </div>

        {/* Shopify Modal */}
        <Dialog open={shopifyModalOpen} onOpenChange={setShopifyModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">Koppla Shopify-butik</DialogTitle>
              <DialogDescription>
                Ange domän och access token för att koppla Shopify-butik till denna order.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-medium">Shopify URL</label>
                <input
                  className="w-full border rounded-sm px-2 py-2"
                  value={shopifyDomain}
                  onChange={e => setShopifyDomain(e.target.value)}
                  placeholder="sdgy73fd.myshopify.com"
                />
              </div>
              <div>
                <label className="font-medium">Shopify Access Token</label>
                <input
                  className="w-full border rounded-sm px-2 py-2"
                  value={shopifyAccessToken}
                  onChange={e => setShopifyAccessToken(e.target.value)}
                  placeholder="shpat_..."
                  type="password"
                />
              </div>
              {shopifyError && <div className="text-destructive text-sm">{shopifyError}</div>}
              {shopifySuccess && <div className="text-green-600 text-sm">Uppgifter sparade!</div>}
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  await handleShopifySave();
                  if (!shopifyError) setShopifyModalOpen(false);
                }}
                disabled={shopifySaving}
              >
                {shopifySaving ? "Sparar..." : "Spara"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Avbryt</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column: Client Information + Progress */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Kundinformation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 min-h-[320px] flex flex-col">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{customerFullName}</p>
                    <p className="text-sm text-muted-foreground">Kundens namn</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{storeDetails.client_email}</p>
                    <p className="text-sm text-muted-foreground">E-postadress</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{new Date(storeDetails.order_date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">Orderdatum</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Progress Card below Client Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Förlopp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 min-h-[320px] flex flex-col">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-between">
                    {STEPS.map((step) => {
                      const Icon = step.icon
                      const isActive = step.value <= progress
                      return (
                        <div
                          key={step.id}
                          className={`flex flex-col items-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-gray-200'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="mt-2 text-xs font-medium">{step.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <Slider
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={33}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Aktuellt steg: {getCurrentStep(progress).label}
                    </span>
                    <Button
                      onClick={handleNextStep}
                      disabled={progress >= 100}
                    >
                      Nästa steg
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Badge className={storeDetails.status === "Under utveckling" ? "bg-blue-100 text-blue-800" : 
                                    storeDetails.status === "Granska" ? "bg-yellow-100 text-yellow-800" :
                                    storeDetails.status === "Levererad" ? "bg-green-100 text-green-800" :
                                    "bg-gray-100 text-gray-800"}>
                      {storeDetails.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Store Details + Product Upload (stacked) */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Butiksuppgifter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 min-h-[320px] flex flex-col">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{storeDetails.store_name}</p>
                    <p className="text-sm text-muted-foreground">Butiksnamn</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{storeDetails.niche}</p>
                    <p className="text-sm text-muted-foreground">Nisch</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{storeDetails.price.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</p>
                    <p className="text-sm text-muted-foreground">Ordersumma</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-medium text-lg">Koppla produkt till Shopify</CardTitle>
                <CardDescription>Välj en produkt att ladda upp till den anslutna Shopify-butiken.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 min-h-[320px] flex flex-col">
                <ProductCombobox
                  products={products}
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  loading={productsLoading}
                />
                <Button onClick={handleUpload} disabled={!selectedProductId || uploading || !storeDetails}>
                  {uploading ? "Laddar upp..." : "Ladda upp till Shopify"}
                </Button>
                {uploadSuccess && <div className="text-green-600 text-sm">Produkten har laddats upp till butiken!</div>}
                {uploadError && <div className="text-destructive text-sm">{uploadError}</div>}
              </CardContent>
            </Card>
          </div>
        </div>


      </div>
    </div>
  )
}
