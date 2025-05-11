import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Store | StorePartner.io",
  description: "Track the progress of your pre-built Shopify store",
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 