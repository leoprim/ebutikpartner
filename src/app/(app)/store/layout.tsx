import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Store | Store Progress Tracker",
  description: "Track the progress of your pre-built Shopify store",
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 