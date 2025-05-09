import "./globals.css"
import { Toaster } from "sonner"
import { DM_Sans } from "next/font/google"

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "700"] })

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
    <html lang="en" className={dmSans.className}>
      <body className="font-sans bg-background text-foreground">
        <Toaster />
        {children}
      </body>
    </html>
  )
}
