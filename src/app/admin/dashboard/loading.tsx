"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-40 rounded" />
        <Skeleton className="h-10 w-32 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-1/2 mb-4 rounded" />
            <Skeleton className="h-8 w-full mb-2 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
        ))}
      </div>
      <div className="border rounded-lg p-4">
        <Skeleton className="h-6 w-1/3 mb-4 rounded" />
        <Skeleton className="h-8 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
    </div>
  )
}
  