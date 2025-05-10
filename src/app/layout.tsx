import "./globals.css"
import { Toaster } from "sonner"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata = {
  title: "Your App Title",
  description: "Your app description",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="font-sans font-medium bg-background text-foreground">
        <Toaster />
        {children}
      </body>
    </html>
  )
}
