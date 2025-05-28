"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  SearchIcon,
  FilterIcon,
  ExternalLinkIcon,
  ShoppingBag,
  TrendingUp,
  Star,
  Target,
} from "lucide-react"

const trendingProducts = [
  {
    id: 1,
    name: "Trådlösa Brusreducerande Hörlurar",
    image: "/placeholder.svg?height=80&width=80&query=wireless headphones",
    searchVolume: 45000,
    trend: 15.2,
    opportunityScore: 92,
    cpc: 2.45,
    niche: "Elektronik",
    category: "Ljud",
    competition: "Medium",
    avgPrice: 199.99,
  },
  {
    id: 2,
    name: "Smart Fitnessklocka",
    image: "/placeholder.svg?height=80&width=80&query=fitness tracker watch",
    searchVolume: 38500,
    trend: 8.7,
    opportunityScore: 87,
    cpc: 1.89,
    niche: "Hälsa & Fitness",
    category: "Bärbara enheter",
    competition: "High",
    avgPrice: 149.99,
  },
  {
    id: 3,
    name: "Bärbar Bluetooth-högtalare",
    image: "/placeholder.svg?height=80&width=80&query=bluetooth speaker",
    searchVolume: 52000,
    trend: -3.2,
    opportunityScore: 74,
    cpc: 1.67,
    niche: "Elektronik",
    category: "Ljud",
    competition: "High",
    avgPrice: 79.99,
  },
  {
    id: 4,
    name: "LED Gaming-tangentbord",
    image: "/placeholder.svg?height=80&width=80&query=gaming keyboard",
    searchVolume: 29000,
    trend: 22.1,
    opportunityScore: 89,
    cpc: 2.12,
    niche: "Gaming",
    category: "Tillbehör",
    competition: "Medium",
    avgPrice: 129.99,
  },
  {
    id: 5,
    name: "Trådlös Telefonladdare",
    image: "/placeholder.svg?height=80&width=80&query=wireless charger",
    searchVolume: 41000,
    trend: 12.5,
    opportunityScore: 81,
    cpc: 1.34,
    niche: "Elektronik",
    category: "Tillbehör",
    competition: "Medium",
    avgPrice: 39.99,
  },
  {
    id: 6,
    name: "Smart Säkerhetskamera",
    image: "/placeholder.svg?height=80&width=80&query=security camera",
    searchVolume: 67000,
    trend: 18.9,
    opportunityScore: 95,
    cpc: 3.21,
    niche: "Smart Hem",
    category: "Säkerhet",
    competition: "Low",
    avgPrice: 89.99,
  },
  {
    id: 7,
    name: "Ergonomisk Kontorsstol",
    image: "/placeholder.svg?height=80&width=80&query=office chair",
    searchVolume: 33500,
    trend: 6.3,
    opportunityScore: 78,
    cpc: 2.87,
    niche: "Möbler",
    category: "Kontor",
    competition: "Medium",
    avgPrice: 299.99,
  },
  {
    id: 8,
    name: "Rostfri Vattenflaska",
    image: "/placeholder.svg?height=80&width=80&query=water bottle",
    searchVolume: 28000,
    trend: -1.8,
    opportunityScore: 69,
    cpc: 0.89,
    niche: "Livsstil",
    category: "Dryckeskärl",
    competition: "High",
    avgPrice: 24.99,
  },
]

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("opportunityScore")
  const [filterNiche, setFilterNiche] = useState("all")
  const [viewMode, setViewMode] = useState("cards")

  const filteredProducts = trendingProducts
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesNiche = filterNiche === "all" || product.niche === filterNiche
      return matchesSearch && matchesNiche
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "searchVolume":
          return b.searchVolume - a.searchVolume
        case "trend":
          return b.trend - a.trend
        case "opportunityScore":
          return b.opportunityScore - a.opportunityScore
        case "cpc":
          return b.cpc - a.cpc
        default:
          return 0
      }
    })

  const getOpportunityColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-blue-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <ArrowUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-500" />
    )
  }

  const getProductLabel = (product: any) => {
    if (product.competition === "Low") {
      return {
        text: "Låg konkurrens",
        color: "bg-green-500",
        icon: Target,
      }
    }
    if (product.trend > 15) {
      return {
        text: "Trending",
        color: "bg-orange-500",
        icon: TrendingUp,
      }
    }
    if (product.searchVolume > 50000) {
      return {
        text: "Populär",
        color: "bg-blue-500",
        icon: Star,
      }
    }
    return null
  }

  const niches = Array.from(new Set(trendingProducts.map((p) => p.niche)))

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trendande Produkter</h1>
            <p className="text-muted-foreground">
              Upptäck högmöjlighets produkter från Google Shopping med realtidsanalys
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUpIcon className="h-8 w-8 text-green-500" />
            <Badge variant="secondary" className="text-sm">
              {filteredProducts.length} Produkter
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök produkter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterNiche} onValueChange={setFilterNiche}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <FilterIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrera efter nisch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla Nischer</SelectItem>
              {niches.map((niche) => (
                <SelectItem key={niche} value={niche}>
                  {niche}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sortera efter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opportunityScore">Möjlighetspoäng</SelectItem>
              <SelectItem value="searchVolume">Sökvolym</SelectItem>
              <SelectItem value="trend">Trend</SelectItem>
              <SelectItem value="cpc">CPC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cards">Kortvy</TabsTrigger>
          <TabsTrigger value="table">Tabellvy</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const label = getProductLabel(product)
              return (
                <Card
                  key={product.id}
                  className="hover:shadow-lg transition-shadow min-h-[360px] flex flex-col rounded-2xl overflow-hidden p-0"
                >
                  <div className="w-full relative aspect-square">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover object-top w-full h-full"
                      style={{ display: 'block' }}
                    />
                    {label && (
                      <div
                        className={`absolute top-3 right-3 ${label.color} text-white px-3 py-1.5 rounded-2xl flex items-center space-x-1 text-sm font-medium`}
                      >
                        <label.icon className="h-4 w-4" />
                        <span>{label.text}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-3">
                      <h3 className="text-base font-medium leading-tight line-clamp-2 text-center text-gray-900">
                        {product.name}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-end pb-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground text-center">Sökvolym</p>
                          <p className="text-sm font-semibold text-center">
                            {(product.searchVolume / 1000).toFixed(0)}k
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground text-center">Trend</p>
                          <div className="flex items-center justify-center space-x-1">
                            {getTrendIcon(product.trend)}
                            <span
                              className={`text-sm font-semibold ${product.trend > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {product.trend > 0 ? "+" : ""}
                              {product.trend}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground text-center">CPC</p>
                          <p className="text-sm font-semibold text-center">${product.cpc}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Möjlighet</p>
                          <span className="text-sm font-bold">{product.opportunityScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getOpportunityColor(product.opportunityScore)}`}
                            style={{ width: `${product.opportunityScore}%` }}
                          />
                        </div>
                      </div>
                      <Button className="w-full rounded-xl">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Lägg till i butik
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card className="rounded-2xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produkt</TableHead>
                  <TableHead>Nisch</TableHead>
                  <TableHead className="text-right">Sökvolym</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                  <TableHead className="text-right">Möjlighet</TableHead>
                  <TableHead className="text-right">CPC</TableHead>
                  <TableHead className="text-right">Genomsnittspris</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs rounded-xl">
                        {product.niche}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{product.searchVolume.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {getTrendIcon(product.trend)}
                        <span
                          className={`text-sm font-medium ${product.trend > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {product.trend > 0 ? "+" : ""}
                          {product.trend}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getOpportunityColor(product.opportunityScore)}`} />
                        <span className="font-medium">{product.opportunityScore}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">${product.cpc}</TableCell>
                    <TableCell className="text-right font-medium">${product.avgPrice}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 