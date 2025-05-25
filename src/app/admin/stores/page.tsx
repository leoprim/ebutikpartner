import { PlusCircle, Search } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import StoreOrdersTable from "./store-orders-table"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export default async function StoresPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  const { data: orders, error } = await supabase
    .from('store_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch store orders: ' + error.message);
  }

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium">Beställningar</h1>
            <p className="text-muted-foreground">Hantera samtliga butiksbeställningar.</p>
          </div>
          <Button asChild>
            <Link href="/admin/stores/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Skapa ny beställning
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
                    <Input type="search" placeholder="Sök efter kund eller butik..." className="w-full pl-8" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Filtrera</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filtrera efter</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Datum (nyaste först)</DropdownMenuItem>
                      <DropdownMenuItem>Datum (äldsta först)</DropdownMenuItem>
                      <DropdownMenuItem>Kundnamn (A-Z)</DropdownMenuItem>
                      <DropdownMenuItem>Butiksnamn (A-Z)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="all">Alla statuser</SelectItem>
                        <SelectItem value="pending">Pausad</SelectItem>
                        <SelectItem value="in-progress">Under utveckling</SelectItem>
                        <SelectItem value="review">Klart för granskning</SelectItem>
                        <SelectItem value="delivered">Levererad</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <StoreOrdersTable initialOrders={orders || []} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
