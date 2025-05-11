"use client"

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

export default function StoresPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Store Orders</h1>
            <p className="text-muted-foreground">Manage your pre-built Shopify store orders and track their progress.</p>
          </div>
          <Button asChild>
            <Link href="/admin/stores/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Order
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Orders</CardTitle>
            <CardDescription>View and manage all your pre-built Shopify store orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex w-full items-center space-x-2 sm:w-auto">
                  <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search by store name or client..." className="w-full pl-8" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Filters</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Date (Newest first)</DropdownMenuItem>
                      <DropdownMenuItem>Date (Oldest first)</DropdownMenuItem>
                      <DropdownMenuItem>Client name (A-Z)</DropdownMenuItem>
                      <DropdownMenuItem>Store name (A-Z)</DropdownMenuItem>
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
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">Ready for Review</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <StoreOrdersTable />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
